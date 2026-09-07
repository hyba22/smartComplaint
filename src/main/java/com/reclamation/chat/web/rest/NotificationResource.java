package com.reclamation.chat.web.rest;

import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.service.NotificationService;
import com.reclamation.chat.service.dto.NotificationDTO;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationResource {

    private static final Logger log = LoggerFactory.getLogger(NotificationResource.class);

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // In-memory storage for notification history
    private final Map<Long, List<NotificationDTO>> notificationHistory = new ConcurrentHashMap<>();

    public NotificationResource(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getNotificationCount() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).build();
            }

            long count = notificationService.getUnreadCount(currentUser.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting notification count", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Void> markAllAsRead() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).build();
            }

            notificationService.markAllAsRead(currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking notifications as read", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<NotificationDTO> getLatestNotification() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).build();
            }

            NotificationDTO notification = notificationService.getLatestNotification(currentUser.getId());
            if (notification == null) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error getting latest notification", e);
            return ResponseEntity.status(500).build();
        }
    }

    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String login = authentication.getName();
                return userRepository.findOneByLogin(login).orElse(null);
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting current user", e);
            return null;
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<NotificationDTO>> getNotificationHistory() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).build();
            }

            List<NotificationDTO> history = notificationService.getNotificationHistory(currentUser.getId());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error getting notification history", e);
            return ResponseEntity.status(500).build();
        }
    }
}
