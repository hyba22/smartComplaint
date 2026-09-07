package com.reclamation.chat.service;

import com.reclamation.chat.domain.Message;
import com.reclamation.chat.domain.Reclamation;
import com.reclamation.chat.domain.Role;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.ConversationRepository;
import com.reclamation.chat.repository.MessageRepository;
import com.reclamation.chat.repository.ReclamationRepository;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.service.dto.DashboardStatisticsDTO;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DashboardStatisticsService {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardStatisticsService.class);

    private final ReclamationRepository reclamationRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public DashboardStatisticsService(
        ReclamationRepository reclamationRepository,
        UserRepository userRepository,
        ConversationRepository conversationRepository,
        MessageRepository messageRepository
    ) {
        this.reclamationRepository = reclamationRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    //Calculate comprehensive dashboard statistics

    public DashboardStatisticsDTO calculateStatistics() {
        LOG.debug("Calculating dashboard statistics");

        DashboardStatisticsDTO stats = new DashboardStatisticsDTO();

        // Reclamation statistics
        calculateReclamationStatistics(stats);

        // User statistics
        calculateUserStatistics(stats);

        // Conversation statistics
        calculateConversationStatistics(stats);

        // Time series data for charts
        calculateTimeSeriesData(stats);

        return stats;
    }

    private void calculateReclamationStatistics(DashboardStatisticsDTO stats) {
        List<Reclamation> allReclamations = reclamationRepository.findAll();

        stats.setTotalReclamations(allReclamations.size());

        // Count by status
        long pending = allReclamations
            .stream()
            .filter(r -> "PENDING".equals(r.getStatut()))
            .count();
        long inProgress = allReclamations
            .stream()
            .filter(r -> "IN_PROGRESS".equals(r.getStatut()))
            .count();
        long resolved = allReclamations
            .stream()
            .filter(r -> "RESOLVED".equals(r.getStatut()))
            .count();
        long closed = allReclamations
            .stream()
            .filter(r -> "CLOSED".equals(r.getStatut()))
            .count();

        stats.setPendingReclamations(pending);
        stats.setInProgressReclamations(inProgress);
        stats.setResolvedReclamations(resolved);
        stats.setClosedReclamations(closed);

        // Group by status for charts
        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put("PENDING", pending);
        byStatus.put("IN_PROGRESS", inProgress);
        byStatus.put("RESOLVED", resolved);
        byStatus.put("CLOSED", closed);
        stats.setReclamationsByStatus(byStatus);

        // Group by level (niveau)
        Map<String, Long> byLevel = allReclamations
            .stream()
            .filter(r -> r.getNiveau() != null)
            .collect(Collectors.groupingBy(r -> r.getNiveau() != null ? r.getNiveau() : "UNKNOWN", Collectors.counting()));
        stats.setReclamationsByLevel(byLevel);
    }

    private void calculateUserStatistics(DashboardStatisticsDTO stats) {
        List<User> allUsers = userRepository.findAll();

        stats.setTotalUsers(allUsers.size());

        // Count by role
        long clients = allUsers
            .stream()
            .filter(u -> Role.CLIENT.equals(u.getRole()))
            .count();
        long conseillers = allUsers
            .stream()
            .filter(u -> Role.CONSEILLER.equals(u.getRole()))
            .count();
        long admins = allUsers
            .stream()
            .filter(u -> Role.ADMIN.equals(u.getRole()))
            .count();
        long active = allUsers.stream().filter(User::isActivated).count();

        stats.setTotalClients(clients);
        stats.setTotalConseillers(conseillers);
        stats.setTotalAdmins(admins);
        stats.setActiveUsers(active);

        // Group by role for charts
        Map<String, Long> byRole = new HashMap<>();
        byRole.put("CLIENT", clients);
        byRole.put("CONSEILLER", conseillers);
        byRole.put("ADMIN", admins);
        stats.setUsersByRole(byRole);
    }

    private void calculateConversationStatistics(DashboardStatisticsDTO stats) {
        long totalConversations = conversationRepository.count();
        stats.setTotalConversations(totalConversations);

        // Count active conversations
        long activeConversations = conversationRepository
            .findAll()
            .stream()
            .filter(c -> "OPEN".equals(c.getStatut()))
            .count();
        stats.setActiveConversations(activeConversations);

        // Count total messages
        long totalMessages = messageRepository.count();
        stats.setTotalMessages(totalMessages);
    }

    private void calculateTimeSeriesData(DashboardStatisticsDTO stats) {
        // Get reclamations for the last 30 days
        Instant thirtyDaysAgo = Instant.now().minusSeconds(30 * 24 * 60 * 60);
        List<Reclamation> recentReclamations = reclamationRepository
            .findAll()
            .stream()
            .filter(r -> r.getDateDepot() != null && r.getDateDepot().isAfter(thirtyDaysAgo))
            .collect(Collectors.toList());

        // Group reclamations by date
        Map<String, Long> reclamationsByDate = recentReclamations
            .stream()
            .collect(
                Collectors.groupingBy(
                    r -> {
                        LocalDate date = r.getDateDepot().atZone(ZoneId.systemDefault()).toLocalDate();
                        return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
                    },
                    Collectors.counting()
                )
            );
        stats.setReclamationsOverTime(reclamationsByDate);

        // Get conversations for the last 30 days
        List<com.reclamation.chat.domain.Conversation> recentConversations = conversationRepository
            .findAll()
            .stream()
            .filter(c -> c.getDateDebut() != null && c.getDateDebut().isAfter(thirtyDaysAgo))
            .collect(Collectors.toList());

        // Group conversations by date
        Map<String, Long> conversationsByDate = recentConversations
            .stream()
            .collect(
                Collectors.groupingBy(
                    c -> {
                        LocalDate date = c.getDateDebut().atZone(ZoneId.systemDefault()).toLocalDate();
                        return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
                    },
                    Collectors.counting()
                )
            );
        stats.setConversationsOverTime(conversationsByDate);
    }
}
