package com.reclamation.chat.service;

import com.reclamation.chat.domain.Entreprise;
import com.reclamation.chat.domain.Role;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.EntrepriseRepository;
import com.reclamation.chat.service.dto.EntrepriseSignupRequest;
import com.reclamation.chat.service.dto.RegistrationRequest;
import java.time.Instant;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EntrepriseSignupService {

    private static final Logger LOG = LoggerFactory.getLogger(EntrepriseSignupService.class);

    private static final String STATUS_PENDING = "PENDING";

    private final EntrepriseRepository entrepriseRepository;

    private final UserService userService;

    public EntrepriseSignupService(EntrepriseRepository entrepriseRepository, UserService userService) {
        this.entrepriseRepository = entrepriseRepository;
        this.userService = userService;
    }

    public User registerEntreprise(EntrepriseSignupRequest request) {
        LOG.debug("Registering new enterprise {}", request.getNomEntreprise());
        entrepriseRepository
            .findByIdEntreprise(request.getIdEntreprise())
            .ifPresent(existing -> {
                throw new IllegalArgumentException("Une entreprise avec cet identifiant existe déjà.");
            });

        String adminLogin = Optional.ofNullable(request.getAdminLogin())
            .filter(StringUtils::isNotBlank)
            .map(StringUtils::lowerCase)
            .orElse(StringUtils.lowerCase(request.getAdminEmail()));

        Entreprise entreprise = new Entreprise();
        entreprise.setIdEntreprise(request.getIdEntreprise());
        entreprise.setNomEntreprise(request.getNomEntreprise());
        entreprise.setSecteur(request.getSecteur());
        entreprise.setAdresseEntreprise(request.getAdresseEntreprise());
        entreprise.setTel(request.getTel());
        entreprise.setEmailEntreprise(request.getEmailEntreprise());
        entreprise.setDateCreation(Instant.now());
        entreprise.setStatutEntreprise(STATUS_PENDING);
        entreprise.setCreatedBy(adminLogin);
        entreprise.setLastModifiedBy(adminLogin);
        entreprise.setLastModifiedDate(Instant.now());

        Entreprise savedEntreprise = entrepriseRepository.save(entreprise);

        RegistrationRequest adminRequest = new RegistrationRequest();
        adminRequest.setLogin(adminLogin);
        adminRequest.setPassword(request.getAdminPassword());
        adminRequest.setFirstName(request.getAdminFirstName());
        adminRequest.setLastName(request.getAdminLastName());
        adminRequest.setEmail(request.getAdminEmail());
        adminRequest.setAddress(request.getAdresseEntreprise());
        adminRequest.setRole(Role.ADMIN);
        adminRequest.setEntrepriseId(savedEntreprise.getId());

        return userService.registerUser(adminRequest, request.getAdminEmail());
    }
}
