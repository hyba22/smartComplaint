package com.reclamation.chat.service;

import com.reclamation.chat.domain.Reclamation;
import com.reclamation.chat.domain.Role;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.ReclamationRepository;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.web.websocket.ActivityService;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReclamationAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(ReclamationAssignmentService.class);

    private final UserRepository userRepository;
    private final ReclamationRepository reclamationRepository;
    private final ActivityService activityService;

    public ReclamationAssignmentService(
        UserRepository userRepository,
        ReclamationRepository reclamationRepository,
        ActivityService activityService
    ) {
        this.userRepository = userRepository;
        this.reclamationRepository = reclamationRepository;
        this.activityService = activityService;
    }

    /**
     * Auto-assign a reclamation to an available Conseiller
     *
     * @param reclamation
     * @return
     */
    public Optional<User> autoAssignReclamation(Reclamation reclamation) {
        log.debug("Attempting to auto-assign reclamation: {}", reclamation.getIdReclamation());

        // Get entreprise id from claim
        Long entrepriseId = reclamation.getEntreprise() != null ? reclamation.getEntreprise().getId() : null;

        if (entrepriseId == null) {
            log.warn("Cannot auto-assign: reclamation has no entreprise");
            return Optional.empty();
        }

        // find all conseillers for this entreprise
        List<User> conseillers = userRepository.findAllByEntrepriseIdAndRole(entrepriseId, Role.CONSEILLER);

        if (conseillers.isEmpty()) {
            log.warn("No Conseillers found for entreprise ID: {}", entrepriseId);
            return Optional.empty();
        }

        // filter to only online cc
        List<User> onlineConseillers = conseillers.stream().filter(this::isConseillerOnline).toList();

        if (onlineConseillers.isEmpty()) {
            log.warn("No online Conseillers available for entreprise ID: {}", entrepriseId);
            return Optional.empty();
        }

        // Get workload for each conseiller and assign to the one with least workload
        User selectedConseiller = onlineConseillers.stream().min(Comparator.comparingInt(this::getConseillerWorkload)).orElse(null);

        if (selectedConseiller != null) {
            log.info(
                "Auto-assigned reclamation {} to Conseiller: {} (workload: {})",
                reclamation.getIdReclamation(),
                selectedConseiller.getLogin(),
                getConseillerWorkload(selectedConseiller)
            );

            reclamation.setAssignedTo(selectedConseiller);
            reclamation.setAssignedDate(Instant.now());

            return Optional.of(selectedConseiller);
        }

        return Optional.empty();
    }

    //check if a conseiller is currently online
    private boolean isConseillerOnline(User conseiller) {
        // Check if user has active WebSocket session
        return activityService.isUserOnline(conseiller.getLogin());
    }

    //Get current workload for a Conseiller
    private int getConseillerWorkload(User conseiller) {
        return reclamationRepository.countActiveReclamationsByConseiller(conseiller.getId());
    }

    // manually assign a reclamation to a specific cc
    public void assignToConseiller(Reclamation reclamation, User conseiller) {
        log.info("Manually assigning reclamation {} to Conseiller: {}", reclamation.getIdReclamation(), conseiller.getLogin());

        reclamation.setAssignedTo(conseiller);
        reclamation.setAssignedDate(Instant.now());
    }

    // unassign a reclamation
    public void unassignReclamation(Reclamation reclamation) {
        log.info("Unassigning reclamation: {}", reclamation.getIdReclamation());
        reclamation.setAssignedTo(null);
        reclamation.setAssignedDate(null);
    }
}
