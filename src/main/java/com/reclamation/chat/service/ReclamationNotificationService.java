package com.reclamation.chat.service;

import com.reclamation.chat.domain.Conversation;
import com.reclamation.chat.domain.Reclamation;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.ConversationRepository;
import com.reclamation.chat.service.dto.MessageRequestDTO;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReclamationNotificationService {

    private static final Logger log = LoggerFactory.getLogger(ReclamationNotificationService.class);

    private final ConversationRepository conversationRepository;
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ReclamationNotificationService(
        ConversationRepository conversationRepository,
        MessageService messageService,
        SimpMessagingTemplate messagingTemplate
    ) {
        this.conversationRepository = conversationRepository;
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Send a French notification message to the client about their reclamation assignment
     *
     * @param reclamation
     * @param client
     * @param conseiller
     * @param frenchMessage
     */
    public void sendAssignmentNotification(Reclamation reclamation, User client, User conseiller, String frenchMessage) {
        try {
            log.info(
                "🔔 Sending assignment notification for reclamation {} to client {}",
                reclamation.getIdReclamation(),
                client.getLogin()
            );

            // always create a new conversation for this reclamation assignment
            // This ensures the client gets a fresh chat with the assigned conseiller
            Conversation conversation = createConversationForReclamation(client, conseiller, reclamation);
            log.info(
                "✅ Created conversation {} between client {} and conseiller {}",
                conversation.getIdConversation(),
                client.getLogin(),
                conseiller.getLogin()
            );

            // Send the French notification message as the first message
            MessageRequestDTO messageRequest = new MessageRequestDTO();
            messageRequest.setIdMsg(UUID.randomUUID().toString());
            messageRequest.setConversationId(conversation.getId());
            messageRequest.setSenderId(conseiller.getId());
            messageRequest.setContenu(frenchMessage);
            messageRequest.setEstLu(false);
            messageRequest.setPieceJointe(null);

            messageService.sendMessage(messageRequest);

            log.info("✅ Successfully sent assignment notification to client {}", client.getLogin());
            log.info("📨 Message content: {}", frenchMessage);

            // Send WebSocket notification to client about new conversation
            sendWebSocketNotification(client, conseiller, conversation);
        } catch (Exception e) {
            log.error("❌ Error sending assignment notification: {}", e.getMessage(), e);
            e.printStackTrace();
        }
    }

    /**
     * Send a WebSocket notification to the client that a new conversation has been created
     *
     * @param client
     * @param conseiller
     * @param conversation
     */
    private void sendWebSocketNotification(User client, User conseiller, Conversation conversation) {
        try {
            // Create notification payload
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "CONVERSATION_ASSIGNED");
            notification.put("conversationId", conversation.getId());
            notification.put("conversationIdentifier", conversation.getIdConversation());
            notification.put("conseillerName", conseiller.getFirstName() + " " + conseiller.getLastName());
            notification.put("conseillerLogin", conseiller.getLogin());
            notification.put("message", "Un conseiller vous a été assigné! Vous pouvez maintenant chatter.");
            notification.put("timestamp", Instant.now().toString());

            // Send to specific user via WebSocket
            // The client should subscribe to /user/queue/conversation-assigned
            messagingTemplate.convertAndSendToUser(client.getLogin(), "/queue/conversation-assigned", notification);

            log.info(
                "🔔 Sent WebSocket notification to client {} about conversation {}",
                client.getLogin(),
                conversation.getIdConversation()
            );
        } catch (Exception e) {
            log.error("❌ Error sending WebSocket notification: {}", e.getMessage(), e);
            // Don't throw - notification is not critical
        }
    }

    /**
     * Create a new conversation specifically for a reclamation assignment
     *
     * @param client
     * @param conseiller
     * @param reclamation
     * @return
     */
    private Conversation createConversationForReclamation(User client, User conseiller, Reclamation reclamation) {
        Conversation conversation = new Conversation();

        // Create a unique conversation ID that includes the reclamation reference
        String conversationId = String.format("REC-%s-%s", reclamation.getIdReclamation(), UUID.randomUUID().toString().substring(0, 8));

        conversation.setIdConversation(conversationId);
        conversation.setDateDebut(Instant.now());
        conversation.setStatut("ACTIVE");

        // Add both participants
        conversation.getParticipants().add(client);
        conversation.getParticipants().add(conseiller);

        log.debug("Creating conversation with ID: {}", conversationId);
        log.debug("Participants: {} (CLIENT) and {} (CONSEILLER)", client.getLogin(), conseiller.getLogin());

        Conversation saved = conversationRepository.save(conversation);
        log.debug("Conversation saved with database ID: {}", saved.getId());

        return saved;
    }
}
