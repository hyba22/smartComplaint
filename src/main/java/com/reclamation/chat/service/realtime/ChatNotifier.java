package com.reclamation.chat.service.realtime;

import com.reclamation.chat.service.dto.MessageDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class ChatNotifier {

    private static final Logger LOG = LoggerFactory.getLogger(ChatNotifier.class);

    private final SimpMessagingTemplate messagingTemplate;

    public ChatNotifier(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastMessage(MessageDTO messageDTO) {
        if (messageDTO.getConversationId() == null) {
            LOG.warn("Attempted to broadcast message without conversation id: {}", messageDTO);
            return;
        }
        messagingTemplate.convertAndSend("/topic/conversations/" + messageDTO.getConversationId(), messageDTO);
    }

    public void broadcastReadReceipt(Long conversationId, Long messageId, Long readerId) {
        if (conversationId == null || messageId == null) {
            LOG.warn("Attempted to broadcast read receipt without ids conversationId={}, messageId={}", conversationId, messageId);
            return;
        }
        ChatReadReceipt receipt = new ChatReadReceipt(messageId, readerId);
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId + "/read", receipt);
    }

    public record ChatReadReceipt(Long messageId, Long readerId) {}
}
