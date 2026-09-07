package com.reclamation.chat.service;

import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.service.dto.NotificationDTO;
import com.reclamation.chat.service.dto.NotificationType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    // In-memory storage for notification counts
    private final Map<Long, AtomicLong> notificationCounts = new ConcurrentHashMap<>();
    private final Map<Long, NotificationDTO> latestNotifications = new ConcurrentHashMap<>();
    private final Map<Long, List<NotificationDTO>> notificationHistory = new ConcurrentHashMap<>();

    public NotificationService(SimpMessagingTemplate messagingTemplate, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    //Send a notification to a specific user
    public void sendNotification(Long userId, NotificationType type, String title, String message) {
        sendNotification(userId, type, title, message, null, null);
    }

    //Send a notification with additional context
    public void sendNotification(
        Long userId,
        NotificationType type,
        String title,
        String message,
        Long conversationId,
        Long reclamationId
    ) {
        sendNotification(userId, type, title, message, conversationId, reclamationId, null);
    }

    //Send a notification with sender information
    public void sendNotification(
        Long userId,
        NotificationType type,
        String title,
        String message,
        Long conversationId,
        Long reclamationId,
        String senderName
    ) {
        try {
            NotificationDTO notification = new NotificationDTO();
            notification.setId(UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE);
            notification.setType(type.getCode());
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setUserId(userId);
            notification.setConversationId(conversationId);
            notification.setReclamationId(reclamationId);
            notification.setRead(false);
            notification.setTimestamp(Instant.now());
            notification.setSenderName(senderName);

            // Store latest notification
            latestNotifications.put(userId, notification);

            // Store in notification history
            notificationHistory.computeIfAbsent(userId, k -> new ArrayList<>()).add(0, notification);

            // Keep only last 50 notifications per user
            List<NotificationDTO> history = notificationHistory.get(userId);
            if (history != null && history.size() > 50) {
                history.remove(history.size() - 1);
            }

            // Increment notification count
            notificationCounts.computeIfAbsent(userId, k -> new AtomicLong(0)).incrementAndGet();

            // Send via WebSocket
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", notification);

            // Also send count update
            sendNotificationCount(userId);

            log.info("🔔 Sent notification to user {}: type={}, title={}", userId, type, title);
        } catch (Exception e) {
            log.error("❌ Error sending notification to user {}: {}", userId, e.getMessage(), e);
        }
    }

    //Send notification to a user by username
    public void sendNotificationByLogin(
        String userLogin,
        NotificationType type,
        String title,
        String message,
        Long conversationId,
        Long reclamationId,
        String senderName
    ) {
        try {
            User user = userRepository.findOneByLogin(userLogin).orElse(null);
            if (user != null) {
                sendNotification(user.getId(), type, title, message, conversationId, reclamationId, senderName);
            } else {
                log.warn("User not found with login: {}", userLogin);
            }
        } catch (Exception e) {
            log.error("❌ Error sending notification to user {}: {}", userLogin, e.getMessage(), e);
        }
    }

    //Send notification count update to a user
    private void sendNotificationCount(Long userId) {
        try {
            long count = getUnreadCount(userId);
            Map<String, Object> countUpdate = Map.of("type", "COUNT_UPDATE", "count", count, "timestamp", Instant.now().toString());

            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", countUpdate);
        } catch (Exception e) {
            log.error("❌ Error sending notification count to user {}: {}", userId, e.getMessage(), e);
        }
    }

    //Get unread notification count for a user
    public long getUnreadCount(Long userId) {
        return notificationCounts.getOrDefault(userId, new AtomicLong(0)).get();
    }

    //Mark all notifications as read for a user
    public void markAllAsRead(Long userId) {
        notificationCounts.put(userId, new AtomicLong(0));
        sendNotificationCount(userId);
        log.info("✅ Marked all notifications as read for user {}", userId);
    }

    //Get latest notification for a user
    public NotificationDTO getLatestNotification(Long userId) {
        return latestNotifications.get(userId);
    }

    //Get notification history for a user
    public List<NotificationDTO> getNotificationHistory(Long userId) {
        return new ArrayList<>(notificationHistory.getOrDefault(userId, new ArrayList<>()));
    }
}
