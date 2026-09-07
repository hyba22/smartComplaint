package com.reclamation.chat.service;

import com.reclamation.chat.domain.Conversation;
import com.reclamation.chat.domain.Message;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.ConversationRepository;
import com.reclamation.chat.repository.MessageRepository;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.service.dto.ConversationParticipantDTO;
import com.reclamation.chat.service.dto.MessageDTO;
import com.reclamation.chat.service.dto.MessageRequestDTO;
import com.reclamation.chat.service.dto.NotificationType;
import com.reclamation.chat.service.realtime.ChatNotifier;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MessageService {

    private static final Logger LOG = LoggerFactory.getLogger(MessageService.class);

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ChatNotifier chatNotifier;
    private final NotificationService notificationService;

    public MessageService(
        MessageRepository messageRepository,
        ConversationRepository conversationRepository,
        UserRepository userRepository,
        ChatNotifier chatNotifier,
        NotificationService notificationService
    ) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.chatNotifier = chatNotifier;
        this.notificationService = notificationService;
    }

    public MessageDTO sendMessage(MessageRequestDTO requestDTO) {
        return sendMessage(requestDTO, true);
    }

    public MessageDTO sendMessage(MessageRequestDTO requestDTO, boolean broadcast) {
        LOG.debug("Request to send Message : {}", requestDTO.getIdMsg());

        Conversation conversation = conversationRepository
            .findById(requestDTO.getConversationId())
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found with id " + requestDTO.getConversationId()));

        User sender = userRepository
            .findById(requestDTO.getSenderId())
            .orElseThrow(() -> new IllegalArgumentException("Sender not found with id " + requestDTO.getSenderId()));

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setIdMsg(requestDTO.getIdMsg());
        message.setContenu(requestDTO.getContenu());
        message.setDateEnvoi(Instant.now());
        message.setEstLu(Optional.ofNullable(requestDTO.getEstLu()).orElse(Boolean.FALSE));
        message.setPieceJointe(requestDTO.getPieceJointe());
        message.setMessageType(requestDTO.getMessageType() != null ? requestDTO.getMessageType() : "TEXT");

        Message saved = messageRepository.save(message);
        MessageDTO dto = toDTO(saved);
        if (broadcast) {
            chatNotifier.broadcastMessage(dto);

            // Send notification to others
            sendChatNotification(conversation, sender, dto);
        }
        return dto;
    }

    public MessageDTO updateMessage(Long id, MessageRequestDTO requestDTO) {
        LOG.debug("Request to update Message : {}", id);
        Message message = messageRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Message not found with id " + id));

        message.setIdMsg(requestDTO.getIdMsg());
        message.setContenu(requestDTO.getContenu());
        if (requestDTO.getEstLu() != null) {
            message.setEstLu(requestDTO.getEstLu());
        }
        message.setPieceJointe(requestDTO.getPieceJointe());
        if (requestDTO.getMessageType() != null) {
            message.setMessageType(requestDTO.getMessageType());
        }

        if (requestDTO.getSenderId() != null) {
            User sender = userRepository
                .findById(requestDTO.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found with id " + requestDTO.getSenderId()));
            message.setSender(sender);
        }

        Message saved = messageRepository.save(message);
        return toDTO(saved);
    }

    //Send notification when a message is sent
    private void sendChatNotification(Conversation conversation, User sender, MessageDTO messageDTO) {
        try {
            Set<User> participants = conversation.getParticipants();
            String senderName = sender.getFirstName() != null ? sender.getFirstName() + " " + sender.getLastName() : sender.getLogin();

            for (User participant : participants) {
                // Don't send notification to the sender
                if (!participant.getId().equals(sender.getId())) {
                    String notificationMessage = messageDTO.getContenu();
                    if (notificationMessage != null && notificationMessage.length() > 50) {
                        notificationMessage = notificationMessage.substring(0, 50) + "...";
                    }

                    // Determine notification title based on sender and receiver roles
                    String notificationTitle = "Nouveau message";
                    if (
                        sender.getRole() == com.reclamation.chat.domain.Role.CONSEILLER &&
                        participant.getRole() == com.reclamation.chat.domain.Role.ADMIN
                    ) {
                        notificationTitle = "Message du conseiller";
                        LOG.info("🔔 Sending notification to admin {} from conseiller {}", participant.getLogin(), sender.getLogin());
                    }

                    notificationService.sendNotification(
                        participant.getId(),
                        NotificationType.CHAT_MESSAGE,
                        notificationTitle,
                        notificationMessage,
                        conversation.getId(),
                        null,
                        senderName
                    );

                    LOG.debug(
                        "Sent chat notification to user {} for message in conversation {}",
                        participant.getId(),
                        conversation.getId()
                    );
                }
            }
        } catch (Exception e) {
            LOG.error("Error sending chat notification: {}", e.getMessage(), e);
        }
    }

    public Optional<MessageDTO> partialUpdate(Long id, MessageRequestDTO requestDTO) {
        LOG.debug("Request to partially update Message : {}", id);
        return messageRepository
            .findById(id)
            .map(existing -> {
                if (requestDTO.getIdMsg() != null) {
                    existing.setIdMsg(requestDTO.getIdMsg());
                }
                if (requestDTO.getContenu() != null) {
                    existing.setContenu(requestDTO.getContenu());
                }
                if (requestDTO.getEstLu() != null) {
                    existing.setEstLu(requestDTO.getEstLu());
                }
                if (requestDTO.getPieceJointe() != null) {
                    existing.setPieceJointe(requestDTO.getPieceJointe());
                }
                if (requestDTO.getSenderId() != null) {
                    User sender = userRepository
                        .findById(requestDTO.getSenderId())
                        .orElseThrow(() -> new IllegalArgumentException("Sender not found with id " + requestDTO.getSenderId()));
                    existing.setSender(sender);
                }
                return existing;
            })
            .map(messageRepository::save)
            .map(this::toDTO);
    }

    public void markAsRead(Long id) {
        LOG.debug("Request to mark Message as read: {}", id);
        Message message = messageRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Message not found with id " + id));
        message.setEstLu(Boolean.TRUE);
        messageRepository.save(message);
        chatNotifier.broadcastReadReceipt(
            message.getConversation() != null ? message.getConversation().getId() : null,
            message.getId(),
            message.getSender() != null ? message.getSender().getId() : null
        );
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Message : {}", id);
        messageRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> findByConversation(Long conversationId) {
        LOG.debug("Request to get messages for conversation : {}", conversationId);
        return messageRepository.findByConversation_IdOrderByDateEnvoiAsc(conversationId).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public Optional<MessageDTO> findOne(Long id) {
        LOG.debug("Request to get Message : {}", id);
        return messageRepository.findById(id).map(this::toDTO);
    }

    private MessageDTO toDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setIdMsg(message.getIdMsg());
        dto.setContenu(message.getContenu());
        dto.setDateEnvoi(message.getDateEnvoi());
        dto.setEstLu(message.getEstLu());
        dto.setPieceJointe(message.getPieceJointe());
        dto.setMessageType(message.getMessageType());
        dto.setConversationId(message.getConversation() != null ? message.getConversation().getId() : null);
        if (message.getSender() != null) {
            ConversationParticipantDTO participantDTO = new ConversationParticipantDTO();
            participantDTO.setId(message.getSender().getId());
            participantDTO.setLogin(message.getSender().getLogin());
            participantDTO.setFirstName(message.getSender().getFirstName());
            participantDTO.setLastName(message.getSender().getLastName());
            participantDTO.setEmail(message.getSender().getEmail());
            dto.setSender(participantDTO);
        }
        return dto;
    }
}
