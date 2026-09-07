package com.reclamation.chat.web.rest;

import com.reclamation.chat.service.MessageService;
import com.reclamation.chat.service.dto.MessageDTO;
import com.reclamation.chat.service.dto.MessageRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/messages")
public class MessageResource {

    private static final Logger LOG = LoggerFactory.getLogger(MessageResource.class);
    private static final String ENTITY_NAME = "message";

    private final MessageService messageService;
    private final String applicationName = "speedComplaintApp";

    public MessageResource(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody MessageRequestDTO requestDTO) throws URISyntaxException {
        LOG.debug("REST request to send Message : {}", requestDTO);
        MessageDTO result = messageService.sendMessage(requestDTO);
        return ResponseEntity.created(new URI("/api/messages/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageDTO> updateMessage(@PathVariable Long id, @Valid @RequestBody MessageRequestDTO requestDTO) {
        LOG.debug("REST request to update Message : {}, {}", id, requestDTO);
        MessageDTO result = messageService.updateMessage(id, requestDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<MessageDTO> partialUpdateMessage(@PathVariable Long id, @NotNull @RequestBody MessageRequestDTO requestDTO) {
        LOG.debug("REST request to partially update Message : {}, {}", id, requestDTO);
        Optional<MessageDTO> result = messageService.partialUpdate(id, requestDTO);
        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDTO> getMessage(@PathVariable Long id) {
        LOG.debug("REST request to get Message : {}", id);
        Optional<MessageDTO> messageDTO = messageService.findOne(id);
        return ResponseUtil.wrapOrNotFound(messageDTO);
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByConversation(@PathVariable Long conversationId) {
        LOG.debug("REST request to get messages for conversation : {}", conversationId);
        List<MessageDTO> messages = messageService.findByConversation(conversationId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        LOG.debug("REST request to mark Message as read : {}", id);
        messageService.markAsRead(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        LOG.debug("REST request to delete Message : {}", id);
        messageService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
