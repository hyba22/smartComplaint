package com.reclamation.chat.web.rest;

import com.reclamation.chat.domain.User;
import com.reclamation.chat.service.MailService;
import com.reclamation.chat.service.UserService;
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

/**
 * REST controller for public user registration.
 */
@RestController
@RequestMapping("/api")
public class RegistrationResource {

    private static final Logger LOG = LoggerFactory.getLogger(RegistrationResource.class);

    @Value("${jhipster.clientApp.name:smartComplaint}")
    private String applicationName;

    private final UserService userService;

    private final MailService mailService;

    public RegistrationResource(UserService userService, MailService mailService) {
        this.userService = userService;
        this.mailService = mailService;
    }

    /**
     * {@code POST  /public/register}  : Register a new user.
     * <p>
     * Creates a new user if the login and email are not already used, and sends a
     * mail with an activation link.
     * The user needs to be activated on creation.
     *
     * @param registrationRequest the user to register.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new user,
     * or with status {@code 400 (Bad Request)} if the login or email is already in use.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) throws URISyntaxException {
        LOG.debug("REST request to register User : {}", registrationRequest);

        try {
            User newUser = userService.registerUser(registrationRequest);
            mailService.sendCreationEmail(newUser);

            return ResponseEntity.created(new URI("/api/register/" + newUser.getLogin())).body(newUser);
        } catch (LoginAlreadyUsedException e) {
            return ResponseEntity.badRequest().body("Login already in use");
        } catch (EmailAlreadyUsedException e) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
    }
}
