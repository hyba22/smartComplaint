package com.reclamation.chat.service;

import com.reclamation.chat.domain.Reclamation;
import com.reclamation.chat.domain.Role;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.EntrepriseRepository;
import com.reclamation.chat.repository.ReclamationRepository;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.service.dto.ConseillerStatusDTO;
import com.reclamation.chat.service.dto.NotificationType;
import com.reclamation.chat.service.dto.ReclamationDTO;
import com.reclamation.chat.service.dto.ReclamationRequestDTO;
import com.reclamation.chat.web.websocket.ActivityService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@Transactional
public class ReclamationService {

    private final Logger log = LoggerFactory.getLogger(ReclamationService.class);

    private final ReclamationRepository reclamationRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final UserRepository userRepository;
    private final CloudflareAIService cloudflareAIService;
    private final KeywordClassificationService keywordClassificationService;
    private final ReclamationNotificationService notificationService;
    private final NotificationService notificationWebSocketService;
    private final ActivityService activityService;
    private final Executor taskExecutor;

    public ReclamationService(
        ReclamationRepository reclamationRepository,
        EntrepriseRepository entrepriseRepository,
        UserRepository userRepository,
        CloudflareAIService cloudflareAIService,
        KeywordClassificationService keywordClassificationService,
        ReclamationNotificationService notificationService,
        NotificationService notificationWebSocketService,
        ActivityService activityService,
        @Autowired(required = false) @Qualifier("taskExecutor") Executor taskExecutor
    ) {
        this.reclamationRepository = reclamationRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.userRepository = userRepository;
        this.cloudflareAIService = cloudflareAIService;
        this.keywordClassificationService = keywordClassificationService;
        this.notificationService = notificationService;
        this.notificationWebSocketService = notificationWebSocketService;
        this.activityService = activityService;
        this.taskExecutor = taskExecutor != null ? taskExecutor : Runnable::run;
    }

    public Reclamation save(Reclamation reclamation) {
        log.debug("Request to save Reclamation : {}", reclamation);
        return reclamationRepository.save(reclamation);
    }

    @Transactional
    public Reclamation update(Long id, ReclamationRequestDTO reclamationRequestDTO) {
        log.debug("Request to update Reclamation : {}", id);

        Reclamation reclamation = reclamationRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));

        reclamation.setIdReclamation(reclamationRequestDTO.getIdReclamation());
        reclamation.setTitre(reclamationRequestDTO.getTitre());
        reclamation.setDescription(reclamationRequestDTO.getDescription());
        reclamation.setDateDepot(reclamationRequestDTO.getDateDepot());
        reclamation.setDateResolution(reclamationRequestDTO.getDateResolution());
        reclamation.setStatut(reclamationRequestDTO.getStatut());
        reclamation.setNiveau(reclamationRequestDTO.getNiveau());
        reclamation.setPieceJointe(reclamationRequestDTO.getPieceJointe());
        reclamation.setScore(reclamationRequestDTO.getScore());

        return reclamationRepository.save(reclamation);
    }

    @Transactional(readOnly = true)
    public Page<ReclamationDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Reclamations");

        String currentLogin = com.reclamation.chat.security.SecurityUtils.getCurrentUserLogin().orElse(null);

        if (currentLogin != null) {
            User currentUser = userRepository.findOneByLogin(currentLogin).orElse(null);

            if (currentUser != null && currentUser.getEntreprise() != null) {
                Long entrepriseId = currentUser.getEntreprise().getId();
                log.info("Filtering reclamations for user {} with entreprise {}", currentLogin, entrepriseId);

                if (
                    currentUser.getRole() == Role.CONSEILLER ||
                    currentUser.getRole() == Role.ADMIN ||
                    currentUser.getRole() == Role.RESPONSABLE
                ) {
                    return reclamationRepository.findByEntreprise_Id(entrepriseId, pageable).map(this::toDTO);
                }
            }
        }

        return reclamationRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<ReclamationDTO> findOne(Long id) {
        log.debug("Request to get Reclamation : {}", id);
        return reclamationRepository.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<ReclamationDTO> findByIdReclamation(String idReclamation) {
        log.debug("Request to get Reclamation by ID : {}", idReclamation);
        return reclamationRepository.findByIdReclamation(idReclamation).map(this::toDTO);
    }

    public void delete(Long id) {
        log.debug("Request to delete Reclamation : {}", id);
        reclamationRepository.deleteById(id);
    }

    public Reclamation creerReclamation(ReclamationRequestDTO reclamationRequestDTO) {
        log.debug("Request to create Reclamation : {}", reclamationRequestDTO);

        Reclamation reclamation = new Reclamation();

        reclamation.setIdReclamation(reclamationRequestDTO.getIdReclamation());
        reclamation.setTitre(reclamationRequestDTO.getTitre());
        reclamation.setDescription(reclamationRequestDTO.getDescription());
        reclamation.setDateDepot(Instant.now());
        reclamation.setStatut("PENDING");

        String niveau = reclamationRequestDTO.getNiveau();
        String classificationMethod = "MANUAL";
        Double classificationConfidence = null;

        if (niveau == null || niveau.isEmpty()) {
            log.debug("Attempting keyword-based classification...");
            KeywordClassificationService.ClassificationResult keywordResult = keywordClassificationService.classify(
                reclamationRequestDTO.getTitre(),
                reclamationRequestDTO.getDescription()
            );

            if (keywordResult.isHighConfidence()) {
                niveau = keywordResult.getLevel();
                classificationMethod = "KEYWORD";
                classificationConfidence = keywordResult.getConfidence();
                log.debug("Keyword classification: {} ({}% confidence)", niveau, String.format("%.1f", keywordResult.getConfidence()));
            } else {
                log.debug("Low keyword confidence ({}%), calling AI...", String.format("%.1f", keywordResult.getConfidence()));
                niveau = cloudflareAIService.classifyReclamation(reclamationRequestDTO.getTitre(), reclamationRequestDTO.getDescription());
                classificationMethod = "AI";
                classificationConfidence = 95.0;
                log.debug("AI classified reclamation as: {}", niveau);
            }
        }
        reclamation.setNiveau(niveau);
        reclamation.setClassificationMethod(classificationMethod);
        reclamation.setClassificationConfidence(classificationConfidence);

        reclamation.setPieceJointe(reclamationRequestDTO.getPieceJointe());
        reclamation.setScore(0);

        if (reclamationRequestDTO.getEntrepriseId() != null) {
            entrepriseRepository.findById(reclamationRequestDTO.getEntrepriseId()).ifPresent(reclamation::setEntreprise);
        }

        Reclamation savedReclamation = reclamationRepository.save(reclamation);

        notifyAdminsOfNewReclamation(savedReclamation);

        log.info("Scheduling async AI-based assignment for reclamation {}", savedReclamation.getIdReclamation());
        Long reclamationId = savedReclamation.getId();

        Runnable assignmentTask = () -> performAiAssignment(reclamationId);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        taskExecutor.execute(assignmentTask);
                    }
                }
            );
        } else {
            taskExecutor.execute(assignmentTask);
        }

        return savedReclamation;
    }

    @Transactional
    public Reclamation modifierStatut(Long id, String newStatut) {
        log.debug("Request to modify status of Reclamation : {} to {}", id, newStatut);

        Reclamation reclamation = reclamationRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));

        String oldStatut = reclamation.getStatut();

        reclamation.setStatut(newStatut);

        if ("RESOLVED".equals(newStatut)) {
            reclamation.setDateResolution(Instant.now());
        }

        Reclamation saved = reclamationRepository.save(reclamation);

        sendStatusUpdateNotification(saved, oldStatut, newStatut);

        return saved;
    }

    private void sendStatusUpdateNotification(Reclamation reclamation, String oldStatut, String newStatut) {
        try {
            if (reclamation.getCreatedBy() != null) {
                String statusMessage = getStatusChangeMessage(oldStatut, newStatut);

                notificationWebSocketService.sendNotificationByLogin(
                    reclamation.getCreatedBy(),
                    NotificationType.STATUS_UPDATE,
                    "Mise à jour de réclamation",
                    statusMessage,
                    null,
                    reclamation.getId(),
                    null
                );

                log.info(
                    "Sent status update notification for reclamation {} to user {}",
                    reclamation.getIdReclamation(),
                    reclamation.getCreatedBy()
                );
            }
        } catch (Exception e) {
            log.error("Error sending status update notification: {}", e.getMessage(), e);
        }
    }

    private String getStatusChangeMessage(String oldStatut, String newStatut) {
        String statusLabel = getStatusLabel(newStatut);
        return String.format("Votre réclamation a été mise à jour: %s", statusLabel);
    }

    private String getStatusLabel(String statut) {
        if (statut == null) return "En attente";
        return switch (statut) {
            case "PENDING" -> "En attente";
            case "IN_PROGRESS" -> "En cours de traitement";
            case "RESOLVED" -> "Résolue";
            case "CLOSED" -> "Fermée";
            default -> statut;
        };
    }

    @Transactional
    public Reclamation gererPrioriteAuto(Long id) {
        log.debug("Request to auto-manage priority for Reclamation : {}", id);

        Reclamation reclamation = reclamationRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));

        Integer score = reclamation.getScore();
        if (score != null) {
            if (score >= 80) {
                reclamation.setNiveau("NIVEAU_3");
            } else if (score >= 50) {
                reclamation.setNiveau("NIVEAU_2");
            } else {
                reclamation.setNiveau("NIVEAU_1");
            }
        }

        return reclamationRepository.save(reclamation);
    }

    @Transactional(readOnly = true)
    public List<ReclamationDTO> findByStatut(String statut) {
        log.debug("Request to get Reclamations by status : {}", statut);
        return reclamationRepository.findByStatut(statut).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ReclamationDTO> findByNiveau(String niveau) {
        log.debug("Request to get Reclamations by priority level : {}", niveau);
        return reclamationRepository.findByNiveau(niveau).stream().map(this::toDTO).toList();
    }

    private ReclamationDTO toDTO(Reclamation reclamation) {
        ReclamationDTO dto = new ReclamationDTO();
        dto.setId(reclamation.getId());
        dto.setIdReclamation(reclamation.getIdReclamation());
        dto.setTitre(reclamation.getTitre());
        dto.setDescription(reclamation.getDescription());
        dto.setDateDepot(reclamation.getDateDepot());
        dto.setDateResolution(reclamation.getDateResolution());
        dto.setStatut(reclamation.getStatut());
        dto.setNiveau(reclamation.getNiveau());
        dto.setPieceJointe(reclamation.getPieceJointe());
        dto.setScore(reclamation.getScore());
        dto.setCreatedBy(reclamation.getCreatedBy());
        dto.setCreatedDate(reclamation.getCreatedDate());
        dto.setLastModifiedBy(reclamation.getLastModifiedBy());
        dto.setLastModifiedDate(reclamation.getLastModifiedDate());
        dto.setClassificationMethod(reclamation.getClassificationMethod());
        dto.setClassificationConfidence(reclamation.getClassificationConfidence());

        if (reclamation.getAssignedTo() != null) {
            User assignedUser = reclamation.getAssignedTo();
            dto.setAssignedTo(
                new ReclamationDTO.AssignedUserDTO(
                    assignedUser.getId(),
                    assignedUser.getLogin(),
                    assignedUser.getFirstName(),
                    assignedUser.getLastName()
                )
            );
        }

        if (reclamation.getLastModifiedBy() != null) {
            userRepository
                .findOneByLogin(reclamation.getLastModifiedBy())
                .ifPresent(admin -> {
                    dto.setTransferredBy(
                        new ReclamationDTO.AssignedUserDTO(admin.getId(), admin.getLogin(), admin.getFirstName(), admin.getLastName())
                    );
                });
        }

        if (reclamation.getEntreprise() != null) {
            dto.setEntreprise(
                new ReclamationDTO.EntrepriseDTO(reclamation.getEntreprise().getId(), reclamation.getEntreprise().getNomEntreprise())
            );
            dto.setEntrepriseId(reclamation.getEntreprise().getId());
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<ConseillerStatusDTO> getConseillersWithStatus() {
        log.debug("Request to get all Conseillers with online status");

        String currentLogin = com.reclamation.chat.security.SecurityUtils.getCurrentUserLogin().orElse(null);

        List<User> conseillers;

        if (currentLogin != null) {
            User currentUser = userRepository.findOneByLogin(currentLogin).orElse(null);

            if (currentUser != null && currentUser.getEntreprise() != null) {
                Long entrepriseId = currentUser.getEntreprise().getId();
                log.info("Filtering conseillers for entreprise {}", entrepriseId);
                conseillers = userRepository.findAllByEntrepriseIdAndRole(entrepriseId, Role.CONSEILLER);
            } else {
                conseillers = userRepository.findAllByRole(Role.CONSEILLER);
            }
        } else {
            conseillers = userRepository.findAllByRole(Role.CONSEILLER);
        }

        return conseillers
            .stream()
            .map(conseiller -> {
                boolean isOnline = activityService.isUserOnline(conseiller.getLogin());
                int activeCount = reclamationRepository.countActiveReclamationsByAssignedTo(conseiller.getId());

                return new ConseillerStatusDTO(
                    conseiller.getId(),
                    conseiller.getLogin(),
                    conseiller.getFirstName(),
                    conseiller.getLastName(),
                    conseiller.getEmail(),
                    isOnline,
                    activeCount
                );
            })
            .toList();
    }

    @Transactional
    public Reclamation transferReclamation(Long reclamationId, Long conseillerId) {
        log.debug("Request to transfer Reclamation {} to Conseiller {}", reclamationId, conseillerId);

        Reclamation reclamation = reclamationRepository
            .findById(reclamationId)
            .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + reclamationId));

        User conseiller = userRepository
            .findById(conseillerId)
            .orElseThrow(() -> new RuntimeException("Conseiller not found with id: " + conseillerId));

        if (conseiller.getRole() != Role.CONSEILLER) {
            throw new RuntimeException("User is not a conseiller");
        }

        reclamation.setAssignedTo(conseiller);
        reclamation.setAssignedDate(Instant.now());

        log.info("Transferred reclamation {} to conseiller {}", reclamation.getIdReclamation(), conseiller.getLogin());

        return reclamationRepository.save(reclamation);
    }

    private void notifyAdminsOfNewReclamation(Reclamation reclamation) {
        try {
            if (reclamation.getEntreprise() == null) {
                log.debug("No entreprise associated with reclamation {}, skipping admin notification", reclamation.getIdReclamation());
                return;
            }

            Long entrepriseId = reclamation.getEntreprise().getId();
            String entrepriseName = reclamation.getEntreprise().getNomEntreprise();

            List<User> admins = userRepository.findAllByEntrepriseIdAndRole(entrepriseId, Role.ADMIN);

            if (admins.isEmpty()) {
                log.debug("No admins found for entreprise {}, skipping notification", entrepriseId);
                return;
            }

            String clientName = "Un client";
            if (reclamation.getCreatedBy() != null) {
                Optional<User> clientOpt = userRepository.findOneByLogin(reclamation.getCreatedBy());
                if (clientOpt.isPresent()) {
                    User client = clientOpt.orElseThrow();
                    clientName =
                        client.getFirstName() != null && client.getLastName() != null
                            ? client.getFirstName() + " " + client.getLastName()
                            : client.getLogin();
                }
            }

            for (User admin : admins) {
                String notificationMessage = String.format(
                    "Nouvelle réclamation déposée pour %s: %s",
                    entrepriseName,
                    reclamation.getTitre()
                );

                notificationWebSocketService.sendNotification(
                    admin.getId(),
                    NotificationType.RECLAMATION_CREATED,
                    "Nouvelle réclamation",
                    notificationMessage,
                    null,
                    reclamation.getId(),
                    clientName
                );

                log.info(
                    "Sent new reclamation notification to admin {} for reclamation {}",
                    admin.getLogin(),
                    reclamation.getIdReclamation()
                );
            }
        } catch (Exception e) {
            log.error("Error notifying admins of new reclamation: {}", e.getMessage(), e);
        }
    }

    private void performAiAssignment(Long reclamationId) {
        try {
            Optional<Reclamation> reclamationOpt = reclamationRepository.findById(reclamationId);
            if (reclamationOpt.isEmpty()) {
                log.error("Reclamation {} not found for async assignment", reclamationId);
                return;
            }

            Reclamation reclamationToAssign = reclamationOpt.orElseThrow();

            log.info("Starting async AI assignment for reclamation {}", reclamationToAssign.getIdReclamation());
            CloudflareAIService.AssignmentResult assignmentResult = cloudflareAIService.assignReclamationWithAI(reclamationToAssign);

            if (assignmentResult.getAssignedConseiller() != null) {
                User assignedConseiller = assignmentResult.getAssignedConseiller();
                log.info(
                    "AI assigned reclamation {} to conseiller: {}",
                    reclamationToAssign.getIdReclamation(),
                    assignedConseiller.getLogin()
                );

                reclamationRepository.save(reclamationToAssign);

                String createdByLogin = reclamationToAssign.getCreatedBy();
                if (createdByLogin != null) {
                    Optional<User> clientOpt = userRepository.findOneByLogin(createdByLogin);
                    if (clientOpt.isPresent()) {
                        User client = clientOpt.orElseThrow();
                        notificationService.sendAssignmentNotification(
                            reclamationToAssign,
                            client,
                            assignedConseiller,
                            assignmentResult.getFrenchMessage()
                        );
                        log.info("Sent French notification to client: {}", client.getLogin());
                    } else {
                        log.warn("Cannot send notification: client user not found with login {}", createdByLogin);
                    }
                } else {
                    log.warn("Cannot send notification: reclamation {} has no createdBy", reclamationToAssign.getIdReclamation());
                }
            } else {
                log.warn(
                    "AI assignment failed for reclamation {}: {}",
                    reclamationToAssign.getIdReclamation(),
                    assignmentResult.getFrenchMessage()
                );
            }
        } catch (Exception e) {
            log.error("Error in async AI assignment for reclamation {}: {}", reclamationId, e.getMessage(), e);
        }
    }
}
