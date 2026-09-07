package com.reclamation.chat.web.rest;

import com.reclamation.chat.service.ConversationService;
import com.reclamation.chat.service.dto.ConversationDTO;
import com.reclamation.chat.service.dto.ConversationRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/conversations")
public class ConversationResource {

    private static final Logger LOG = LoggerFactory.getLogger(ConversationResource.class);
    private static final String ENTITY_NAME = "conversation";

    private final ConversationService conversationService;
    private final String applicationName = "speedComplaintApp";

    public ConversationResource(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public ResponseEntity<ConversationDTO> createConversation(@Valid @RequestBody ConversationRequestDTO requestDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save Conversation : {}", requestDTO);
        ConversationDTO result = conversationService.create(requestDTO);
        return ResponseEntity.created(new URI("/api/conversations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConversationDTO> updateConversation(
        @PathVariable("id") Long id,
        @Valid @RequestBody ConversationRequestDTO requestDTO
    ) {
        LOG.debug("REST request to update Conversation : {}, {}", id, requestDTO);
        ConversationDTO result = conversationService.update(id, requestDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ConversationDTO> partialUpdateConversation(
        @PathVariable("id") Long id,
        @NotNull @RequestBody ConversationRequestDTO requestDTO
    ) {
        LOG.debug("REST request to partially update Conversation : {}, {}", id, requestDTO);
        Optional<ConversationDTO> result = conversationService.partialUpdate(id, requestDTO);
        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()));
    }

    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getAllConversations(Pageable pageable) {
        LOG.debug("REST request to get a page of Conversations");
        Page<ConversationDTO> page = conversationService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/participant/{login}")
    public ResponseEntity<List<ConversationDTO>> getConversationsByParticipant(@PathVariable String login) {
        LOG.debug("REST request to get Conversations for participant : {}", login);
        List<ConversationDTO> conversations = conversationService.findByParticipantLogin(login);
        return ResponseEntity.ok(conversations);
    }

    /**
     *should be used by frontend
     * @param principal The authenticated user
     * @return List of conversations the user is allowed to see
     */
    @GetMapping("/my-conversations")
    public ResponseEntity<List<ConversationDTO>> getMyConversations(Principal principal) {
        if (principal == null) {
            LOG.warn("Unauthenticated request to /my-conversations");
            return ResponseEntity.status(401).build();
        }

        String login = principal.getName();
        LOG.debug("REST request to get filtered conversations for current user: {}", login);

        List<ConversationDTO> conversations = conversationService.findConversationsForUser(login);

        LOG.info("Returning {} conversations for user {}", conversations.size(), login);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDTO> getConversation(@PathVariable Long id) {
        LOG.debug("REST request to get Conversation : {}", id);
        Optional<ConversationDTO> conversationDTO = conversationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(conversationDTO);
    }

    @GetMapping("/identifier/{identifier}")
    public ResponseEntity<ConversationDTO> getConversationByIdentifier(@PathVariable String identifier) {
        LOG.debug("REST request to get Conversation by identifier : {}", identifier);
        Optional<ConversationDTO> conversationDTO = conversationService.findByIdentifier(identifier);
        return ResponseUtil.wrapOrNotFound(conversationDTO);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> closeConversation(@PathVariable Long id) {
        LOG.debug("REST request to close Conversation : {}", id);
        conversationService.closeConversation(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        LOG.debug("REST request to delete Conversation : {}", id);
        conversationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
