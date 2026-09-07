package com.reclamation.chat.service;

import com.reclamation.chat.domain.Conversation;
import com.reclamation.chat.domain.Message;
import com.reclamation.chat.domain.Reclamation;
import com.reclamation.chat.domain.Role;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.ConversationRepository;
import com.reclamation.chat.repository.ReclamationRepository;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.service.dto.ConversationDTO;
import com.reclamation.chat.service.dto.ConversationParticipantDTO;
import com.reclamation.chat.service.dto.ConversationRequestDTO;
import com.reclamation.chat.service.dto.MessageDTO;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConversationService {

    private static final Logger LOG = LoggerFactory.getLogger(ConversationService.class);

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ReclamationRepository reclamationRepository;

    public ConversationService(
        ConversationRepository conversationRepository,
        UserRepository userRepository,
        ReclamationRepository reclamationRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.reclamationRepository = reclamationRepository;
    }

    public ConversationDTO create(ConversationRequestDTO requestDTO) {
        LOG.debug("Request to create Conversation : {}", requestDTO.getIdConversation());
        Conversation conversation = new Conversation();
        conversation.setIdConversation(requestDTO.getIdConversation());
        conversation.setDateDebut(Optional.ofNullable(requestDTO.getDateDebut()).orElse(Instant.now()));
        conversation.setDateFin(requestDTO.getDateFin());
        conversation.setStatut(Optional.ofNullable(requestDTO.getStatut()).orElse("OPEN"));

        Set<User> participants = Optional.ofNullable(requestDTO.getParticipantIds())
            .orElseGet(Set::of)
            .stream()
            .map(id -> userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Participant not found with id " + id)))
            .collect(Collectors.toSet());
        conversation.setParticipants(participants);

        Conversation saved = conversationRepository.save(conversation);
        return toDTO(saved);
    }

    public Optional<ConversationDTO> partialUpdate(Long id, ConversationRequestDTO requestDTO) {
        LOG.debug("Request to partially update Conversation : {}", id);
        return conversationRepository
            .findById(id)
            .map(existing -> {
                if (requestDTO.getIdConversation() != null) {
                    existing.setIdConversation(requestDTO.getIdConversation());
                }
                if (requestDTO.getDateDebut() != null) {
                    existing.setDateDebut(requestDTO.getDateDebut());
                }
                if (requestDTO.getDateFin() != null) {
                    existing.setDateFin(requestDTO.getDateFin());
                }
                if (requestDTO.getStatut() != null) {
                    existing.setStatut(requestDTO.getStatut());
                }
                if (requestDTO.getParticipantIds() != null) {
                    Set<User> participants = requestDTO
                        .getParticipantIds()
                        .stream()
                        .map(userId ->
                            userRepository
                                .findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("Participant not found with id " + userId))
                        )
                        .collect(Collectors.toSet());
                    existing.setParticipants(participants);
                }
                return existing;
            })
            .map(conversationRepository::save)
            .map(this::toDTO);
    }

    public ConversationDTO update(Long id, ConversationRequestDTO requestDTO) {
        LOG.debug("Request to update Conversation : {}", id);
        Conversation conversation = conversationRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found with id " + id));

        conversation.setIdConversation(requestDTO.getIdConversation());
        conversation.setDateDebut(requestDTO.getDateDebut());
        conversation.setDateFin(requestDTO.getDateFin());
        conversation.setStatut(requestDTO.getStatut());

        Set<User> participants = Optional.ofNullable(requestDTO.getParticipantIds())
            .orElseGet(Set::of)
            .stream()
            .map(userId ->
                userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Participant not found with id " + userId))
            )
            .collect(Collectors.toSet());
        conversation.setParticipants(participants);

        Conversation saved = conversationRepository.save(conversation);
        return toDTO(saved);
    }

    public Optional<ConversationDTO> findOne(Long id) {
        LOG.debug("Request to get Conversation : {}", id);
        return conversationRepository.findWithDetailsById(id).map(this::toDTO);
    }

    public Optional<ConversationDTO> findByIdentifier(String identifier) {
        LOG.debug("Request to get Conversation by identifier : {}", identifier);
        return conversationRepository.findByIdConversation(identifier).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ConversationDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get paginated conversations");
        return conversationRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> findByParticipantLogin(String login) {
        LOG.debug("Request to get conversations for participant : {}", login);
        return conversationRepository.findAllByParticipants_Login(login).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> findConversationsForUser(String login) {
        LOG.debug("Request to get filtered conversations for user: {}", login);

        // Get the current user
        User user = userRepository.findOneByLogin(login).orElseThrow(() -> new IllegalArgumentException("User not found: " + login));

        LOG.info(
            "User {} has role: {}, entreprise: {}",
            login,
            user.getRole(),
            user.getEntreprise() != null ? user.getEntreprise().getId() : "null"
        );

        // get all conversations where user is a participant
        List<Conversation> userConversations = conversationRepository.findAllByParticipants_Login(login);

        LOG.info("Found {} total conversations for user {}", userConversations.size(), login);

        // filter based on role and entreprise
        List<ConversationDTO> filteredConversations = userConversations
            .stream()
            .filter(conv -> {
                boolean allowed = isConversationAllowedForUser(conv, user);
                LOG.info("Conversation {} allowed for user {}: {}", conv.getIdConversation(), login, allowed);
                return allowed;
            })
            .map(this::toDTO)
            .toList();

        LOG.info("After filtering: {} conversations allowed for user {}", filteredConversations.size(), login);

        return filteredConversations;
    }

    private boolean isConversationAllowedForUser(Conversation conversation, User user) {
        Long userEntrepriseId = getUserEntrepriseId(user);

        if (userEntrepriseId == null) {
            LOG.warn("User {} has no entreprise, denying conversation access", user.getLogin());
            return false;
        }

        // get other participants (not the current user)
        List<User> otherParticipants = conversation
            .getParticipants()
            .stream()
            .filter(p -> !p.getLogin().equals(user.getLogin()))
            .toList();

        // check each other participant
        for (User other : otherParticipants) {
            Long otherEntrepriseId = getUserEntrepriseId(other);

            if (otherEntrepriseId == null || !userEntrepriseId.equals(otherEntrepriseId)) {
                boolean hasSharedReclamations = hasSharedReclamationContext(user, other, userEntrepriseId, otherEntrepriseId);
                if (!hasSharedReclamations) {
                    LOG.debug(
                        "Conversation {} denied: different entreprise (user: {}, other: {}) and no shared reclamation context",
                        conversation.getIdConversation(),
                        userEntrepriseId,
                        otherEntrepriseId
                    );
                    return false;
                } else {
                    LOG.info("Conversation {} allowed: conseiller and client share reclamation context", conversation.getIdConversation());
                }
            }

            switch (user.getRole()) {
                case CLIENT:
                    if (other.getRole() != Role.CONSEILLER && other.getRole() != Role.ADMIN) {
                        LOG.debug(
                            "Conversation {} denied: CLIENT {} cannot chat with role {}",
                            conversation.getIdConversation(),
                            user.getLogin(),
                            other.getRole()
                        );
                        return false;
                    }
                    break;
                case CONSEILLER:
                    // conseillers can chat with CLIENT or ADMIN from the same entreprise
                    if (other.getRole() != Role.CLIENT && other.getRole() != Role.ADMIN) {
                        LOG.debug(
                            "Conversation {} denied: CONSEILLER {} cannot chat with role {}",
                            conversation.getIdConversation(),
                            user.getLogin(),
                            other.getRole()
                        );
                        return false;
                    }
                    break;
                case ADMIN:
                    // admin can chat with anyone from their entreprise
                    LOG.debug("Conversation {} allowed: ADMIN has full access", conversation.getIdConversation());
                    break;
                default:
                    LOG.warn(
                        "Conversation {} denied: unknown role {} for user {}",
                        conversation.getIdConversation(),
                        user.getRole(),
                        user.getLogin()
                    );
                    return false;
            }
        }

        LOG.debug("Conversation {} allowed for user {}", conversation.getIdConversation(), user.getLogin());
        return true;
    }

    /**
     *  allows chat when conseiller's entreprise matches the client's reclamation entreprise.
     *
     * @param user1
     * @param user2
     * @param entreprise1
     * @param entreprise2
     * @return true if they share reclamation context
     */
    private boolean hasSharedReclamationContext(User user1, User user2, Long entreprise1, Long entreprise2) {
        final User conseiller;
        final User client;
        final Long conseillerEntrepriseId;

        // Determine who is the conseiller and who is the client
        if (user1.getRole() == Role.CONSEILLER && user2.getRole() == Role.CLIENT) {
            conseiller = user1;
            client = user2;
            conseillerEntrepriseId = entreprise1;
        } else if (user2.getRole() == Role.CONSEILLER && user1.getRole() == Role.CLIENT) {
            conseiller = user2;
            client = user1;
            conseillerEntrepriseId = entreprise2;
        } else {
            // Not a conseiller-client relationship
            return false;
        }

        // Check if any of the client's reclamations belong to the conseiller's entreprise
        List<Reclamation> clientReclamations = reclamationRepository.findByCreatedBy(client.getLogin());
        boolean hasMatchingReclamation = clientReclamations
            .stream()
            .anyMatch(rec -> rec.getEntreprise() != null && rec.getEntreprise().getId().equals(conseillerEntrepriseId));

        if (hasMatchingReclamation) {
            LOG.info(
                "Conseiller {} and client {} share reclamation context (entreprise {})",
                conseiller.getLogin(),
                client.getLogin(),
                conseillerEntrepriseId
            );
        }

        return hasMatchingReclamation;
    }

    /**
     * for clients without an entreprise in their user record, look up their reclamations.
     *
     * @param user
     * @return
     */
    private Long getUserEntrepriseId(User user) {
        // check if user has entreprise directly
        if (user.getEntreprise() != null) {
            Long entrepriseId = user.getEntreprise().getId();
            LOG.info("User {} has direct entreprise: {}", user.getLogin(), entrepriseId);
            return entrepriseId;
        }

        // check clients reclamations
        if (user.getRole() == Role.CLIENT) {
            LOG.info("Client {} has no direct entreprise, checking reclamations", user.getLogin());
            List<Reclamation> reclamations = reclamationRepository.findByCreatedBy(user.getLogin());
            LOG.info("Found {} reclamations for client {}", reclamations.size(), user.getLogin());

            if (!reclamations.isEmpty()) {
                // get entreprise from first reclamation
                Reclamation firstReclamation = reclamations.get(0);
                if (firstReclamation.getEntreprise() != null) {
                    Long entrepriseId = firstReclamation.getEntreprise().getId();
                    LOG.info(
                        "Found entreprise {} for client {} from reclamation {}",
                        entrepriseId,
                        user.getLogin(),
                        firstReclamation.getIdReclamation()
                    );
                    return entrepriseId;
                } else {
                    LOG.warn("Reclamation {} has no entreprise", firstReclamation.getIdReclamation());
                }
            } else {
                LOG.warn("No reclamations found for client {}", user.getLogin());
            }
        }

        LOG.warn("No entreprise found for user {}", user.getLogin());
        return null;
    }

    public void closeConversation(Long id) {
        LOG.debug("Request to close Conversation : {}", id);
        Conversation conversation = conversationRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found with id " + id));
        conversation.setStatut("CLOSED");
        conversation.setDateFin(Instant.now());
        conversationRepository.save(conversation);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Conversation : {}", id);
        conversationRepository.deleteById(id);
    }

    private ConversationDTO toDTO(Conversation conversation) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setIdConversation(conversation.getIdConversation());
        dto.setDateDebut(conversation.getDateDebut());
        dto.setDateFin(conversation.getDateFin());
        dto.setStatut(conversation.getStatut());
        dto.setCreatedBy(conversation.getCreatedBy());
        dto.setCreatedDate(conversation.getCreatedDate());
        dto.setLastModifiedBy(conversation.getLastModifiedBy());
        dto.setLastModifiedDate(conversation.getLastModifiedDate());

        Set<ConversationParticipantDTO> participantDTOs = conversation
            .getParticipants()
            .stream()
            .map(this::toParticipantDTO)
            .collect(Collectors.toSet());
        dto.setParticipants(participantDTOs);

        List<MessageDTO> messageDTOs = conversation.getMessages().stream().sorted().map(this::toMessageDTO).toList();
        dto.setMessages(messageDTOs);

        return dto;
    }

    private ConversationParticipantDTO toParticipantDTO(User user) {
        ConversationParticipantDTO dto = new ConversationParticipantDTO();
        dto.setId(user.getId());
        dto.setLogin(user.getLogin());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        return dto;
    }

    private MessageDTO toMessageDTO(Message message) {
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
            dto.setSender(toParticipantDTO(message.getSender()));
        }
        return dto;
    }
}
