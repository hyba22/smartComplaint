package com.reclamation.chat.web.websocket;

import com.reclamation.chat.service.MessageService;
import com.reclamation.chat.service.dto.MessageRequestDTO;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

/**
 * STOMP endpoints for realtime chat messaging.
 */
@Controller
public class ChatWebsocketResource {

    private static final Logger LOG = LoggerFactory.getLogger(ChatWebsocketResource.class);

    private final MessageService messageService;

    public ChatWebsocketResource(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * Handle inbound chat messages sent via WebSocket.
     * Clients should send payloads to /app/chat/{conversationId}
     */
    @MessageMapping("/chat/{conversationId}")
    public void postMessage(@DestinationVariable Long conversationId, @Valid @Payload MessageRequestDTO requestDTO) {
        LOG.debug("Websocket message received for conversation {}", conversationId);
        requestDTO.setConversationId(conversationId);
        messageService.sendMessage(requestDTO);
    }
}
