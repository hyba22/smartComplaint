package com.reclamation.chat.web.rest;

import com.reclamation.chat.domain.User;
import com.reclamation.chat.service.EntrepriseSignupService;
import com.reclamation.chat.service.MailService;
import com.reclamation.chat.service.UserService;
import com.reclamation.chat.service.UsernameAlreadyUsedException;
import com.reclamation.chat.service.dto.EntrepriseSignupRequest;
import com.reclamation.chat.service.dto.RegistrationRequest;
import com.reclamation.chat.web.rest.errors.EmailAlreadyUsedException;
import com.reclamation.chat.web.rest.errors.LoginAlreadyUsedException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RegistrationResource {

    private static final Logger LOG = LoggerFactory.getLogger(RegistrationResource.class);

    @Value("${jhipster.clientApp.name:speedComplaintApp}")
    private String applicationName;

    private final UserService userService;

    private final MailService mailService;

    private final EntrepriseSignupService entrepriseSignupService;

    public RegistrationResource(UserService userService, MailService mailService, EntrepriseSignupService entrepriseSignupService) {
        this.userService = userService;
        this.mailService = mailService;
        this.entrepriseSignupService = entrepriseSignupService;
    }

    /**
     *
     * @param registrationRequest
     * @return
     * @throws URISyntaxException
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) throws URISyntaxException {
        LOG.debug("REST request to register User : {}", registrationRequest);

        try {
            User newUser = userService.registerUser(registrationRequest);
            mailService.sendActivationEmail(newUser);

            return ResponseEntity.created(new URI("/api/register/" + newUser.getLogin())).body(newUser);
        } catch (UsernameAlreadyUsedException | LoginAlreadyUsedException e) {
            return ResponseEntity.badRequest().body("Login already in use");
        } catch (EmailAlreadyUsedException e) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
    }

    @PostMapping("/signup/entreprise")
    public ResponseEntity<?> registerEntreprise(@Valid @RequestBody EntrepriseSignupRequest request) throws URISyntaxException {
        LOG.debug("REST request to register Entreprise : {}", request.getNomEntreprise());

        try {
            User adminUser = entrepriseSignupService.registerEntreprise(request);
            mailService.sendActivationEmail(adminUser);
            return ResponseEntity.created(new URI("/api/register/" + adminUser.getLogin())).body(adminUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UsernameAlreadyUsedException | LoginAlreadyUsedException e) {
            return ResponseEntity.badRequest().body("Login already in use");
        } catch (EmailAlreadyUsedException e) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
    }
}
