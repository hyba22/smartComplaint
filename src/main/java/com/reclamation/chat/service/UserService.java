package com.reclamation.chat.service;

import com.reclamation.chat.config.Constants;
import com.reclamation.chat.domain.Authority;
import com.reclamation.chat.domain.Conversation;
import com.reclamation.chat.domain.Entreprise;
import com.reclamation.chat.domain.Role;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.AuthorityRepository;
import com.reclamation.chat.repository.ConversationRepository;
import com.reclamation.chat.repository.EntrepriseRepository;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.security.AuthoritiesConstants;
import com.reclamation.chat.security.SecurityUtils;
import com.reclamation.chat.service.dto.AdminUserDTO;
import com.reclamation.chat.service.dto.RegistrationRequest;
import com.reclamation.chat.service.dto.UserDTO;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.security.RandomUtil;

@Service
@Transactional
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthorityRepository authorityRepository;

    private final CacheManager cacheManager;

    private final EntrepriseRepository entrepriseRepository;

    private final ConversationRepository conversationRepository;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthorityRepository authorityRepository,
        CacheManager cacheManager,
        EntrepriseRepository entrepriseRepository,
        ConversationRepository conversationRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorityRepository = authorityRepository;
        this.cacheManager = cacheManager;
        this.entrepriseRepository = entrepriseRepository;
        this.conversationRepository = conversationRepository;
    }

    public Optional<User> activateRegistration(String key) {
        LOG.debug("Activating user for activation key {}", key);
        return userRepository
            .findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                this.clearUserCaches(user);
                if (user.getEntreprise() != null) {
                    Entreprise entreprise = user.getEntreprise();
                    entreprise.setStatutEntreprise("ACTIVE");
                    entrepriseRepository.save(entreprise);
                }
                LOG.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
        LOG.debug("Reset user password for reset key {}", key);
        return userRepository
            .findOneByResetKey(key)
            .filter(user -> user.getResetDate().isAfter(Instant.now().minus(1, ChronoUnit.DAYS)))
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                this.clearUserCaches(user);
                return user;
            });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository
            .findOneByEmailIgnoreCase(mail)
            .filter(User::isActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(Instant.now());
                this.clearUserCaches(user);
                return user;
            });
    }

    public User registerUser(RegistrationRequest registrationRequest) {
        return registerUser(registrationRequest, null);
    }

    public User registerUser(RegistrationRequest registrationRequest, String createdBy) {
        userRepository
            .findOneByLogin(registrationRequest.getLogin().toLowerCase())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new UsernameAlreadyUsedException();
                }
            });
        userRepository
            .findOneByEmailIgnoreCase(registrationRequest.getEmail())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new EmailAlreadyUsedException();
                }
            });
        Entreprise linkedEntreprise = null;
        if (registrationRequest.getEntrepriseId() != null) {
            linkedEntreprise = entrepriseRepository
                .findById(registrationRequest.getEntrepriseId())
                .orElseThrow(() -> new IllegalArgumentException("Entreprise not found with id: " + registrationRequest.getEntrepriseId()));
        }

        User newUser = new User();
        String encryptedPassword = passwordEncoder.encode(registrationRequest.getPassword());
        newUser.setLogin(registrationRequest.getLogin().toLowerCase());
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(registrationRequest.getFirstName());
        newUser.setLastName(registrationRequest.getLastName());
        if (registrationRequest.getEmail() != null) {
            newUser.setEmail(registrationRequest.getEmail().toLowerCase());
        }
        newUser.setAddress(registrationRequest.getAddress());
        newUser.setRole(registrationRequest.getRole());
        newUser.setLangKey(Constants.DEFAULT_LANGUAGE);
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        Set<Authority> authorities = getAuthoritiesForRole(registrationRequest.getRole());
        newUser.setAuthorities(authorities);
        if (linkedEntreprise != null) {
            newUser.setEntreprise(linkedEntreprise);
        }
        // Set audit fields manually to avoid anonymousUser for public registration
        if (createdBy != null) {
            newUser.setCreatedBy(createdBy);
            newUser.setLastModifiedBy(createdBy);
            newUser.setCreatedDate(Instant.now());
            newUser.setLastModifiedDate(Instant.now());
        }
        userRepository.save(newUser);
        this.clearUserCaches(newUser);
        LOG.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    public User registerUser(AdminUserDTO userDTO, String password) {
        userRepository
            .findOneByLogin(userDTO.getLogin().toLowerCase())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new UsernameAlreadyUsedException();
                }
            });
        userRepository
            .findOneByEmailIgnoreCase(userDTO.getEmail())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new EmailAlreadyUsedException();
                }
            });
        User newUser = new User();
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setLogin(userDTO.getLogin().toLowerCase());
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null) {
            newUser.setEmail(userDTO.getEmail().toLowerCase());
        }
        newUser.setAddress(userDTO.getAddress());
        newUser.setImageUrl(userDTO.getImageUrl());
        newUser.setLangKey(userDTO.getLangKey());
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(authorities::add);
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);
        this.clearUserCaches(newUser);
        LOG.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    private boolean removeNonActivatedUser(User existingUser) {
        if (existingUser.isActivated()) {
            return false;
        }
        userRepository.delete(existingUser);
        userRepository.flush();
        this.clearUserCaches(existingUser);
        return true;
    }

    public User createUser(AdminUserDTO userDTO) {
        User user = new User();
        user.setLogin(userDTO.getLogin().toLowerCase());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail().toLowerCase());
        }
        user.setAddress(userDTO.getAddress());
        user.setImageUrl(userDTO.getImageUrl());
        if (userDTO.getLangKey() == null) {
            user.setLangKey(Constants.DEFAULT_LANGUAGE); // default language
        } else {
            user.setLangKey(userDTO.getLangKey());
        }
        String temporaryPassword = RandomUtil.generatePassword();
        String encryptedPassword = passwordEncoder.encode(temporaryPassword);
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now());
        user.setActivated(true);
        if (userDTO.getRole() != null) {
            user.setRole(userDTO.getRole());
        }
        if (userDTO.getAuthorities() != null) {
            Set<Authority> authorities = userDTO
                .getAuthorities()
                .stream()
                .map(authorityRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setAuthorities(authorities);
        }
        if (userDTO.getEntrepriseId() != null) {
            entrepriseRepository.findById(userDTO.getEntrepriseId()).ifPresent(user::setEntreprise);
        }
        userRepository.save(user);
        this.clearUserCaches(user);
        LOG.debug("Created Information for User: {}", user);
        // Store temporary password in user object for email sending
        user.setTemporaryPassword(temporaryPassword);
        return user;
    }

    /**
     * Update all information for a specific user, and return the modified user.
     *
     * @param userDTO
     * @return
     */
    public Optional<AdminUserDTO> updateUser(AdminUserDTO userDTO) {
        return Optional.of(userRepository.findById(userDTO.getId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(user -> {
                this.clearUserCaches(user);
                user.setLogin(userDTO.getLogin().toLowerCase());
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                if (userDTO.getEmail() != null) {
                    user.setEmail(userDTO.getEmail().toLowerCase());
                }
                user.setAddress(userDTO.getAddress());
                user.setImageUrl(userDTO.getImageUrl());
                user.setActivated(userDTO.isActivated());
                user.setLangKey(userDTO.getLangKey());
                Set<Authority> managedAuthorities = user.getAuthorities();
                managedAuthorities.clear();
                userDTO
                    .getAuthorities()
                    .stream()
                    .map(authorityRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .forEach(managedAuthorities::add);
                userRepository.save(user);
                this.clearUserCaches(user);
                LOG.debug("Changed Information for User: {}", user);
                return user;
            })
            .map(AdminUserDTO::new);
    }

    public void deleteUser(String login) {
        userRepository
            .findOneByLogin(login)
            .ifPresent(user -> {
                // Remove user from all conversations to avoid foreign key constraint violation
                List<Conversation> conversations = conversationRepository.findAllByParticipants_Login(login);
                for (Conversation conversation : conversations) {
                    conversation.getParticipants().remove(user);
                    conversationRepository.save(conversation);
                }
                userRepository.delete(user);
                this.clearUserCaches(user);
                LOG.debug("Deleted User: {}", user);
            });
    }

    /**
     * Update basic information
     *
     * @param firstName
     * @param lastName
     * @param email
     * @param langKey
     * @param imageUrl
     */
    public void updateUser(String firstName, String lastName, String email, String langKey, String imageUrl) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                userRepository.save(user);
                this.clearUserCaches(user);
                LOG.debug("Changed Information for User: {}", user);
            });
    }

    @Transactional
    public void changePassword(String currentClearTextPassword, String newPassword) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                String currentEncryptedPassword = user.getPassword();
                if (!passwordEncoder.matches(currentClearTextPassword, currentEncryptedPassword)) {
                    throw new InvalidPasswordException();
                }
                String encryptedPassword = passwordEncoder.encode(newPassword);
                user.setPassword(encryptedPassword);
                this.clearUserCaches(user);
                LOG.debug("Changed password for User: {}", user);
            });
    }

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getAllManagedUsers(Pageable pageable) {
        User currentUser = SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin).orElse(null);

        if (currentUser == null) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            return userRepository.findAll(pageable).map(AdminUserDTO::new);
        }

        if (currentUser.getRole() == Role.ADMIN) {
            if (currentUser.getEntreprise() == null) {
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }
            return userRepository.findAllByEntrepriseId(currentUser.getEntreprise().getId(), pageable).map(AdminUserDTO::new);
        }

        if (currentUser.getRole() == Role.CONSEILLER) {
            if (currentUser.getEntreprise() == null) {
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }

            // Get admins from the same entreprise
            Page<User> admins = userRepository.findAdminsByEntrepriseId(currentUser.getEntreprise().getId(), Role.ADMIN, pageable);

            // Get clients assigned to this conseiller
            Page<User> assignedClients = userRepository.findClientsAssignedToConseiller(currentUser.getId(), pageable);

            // Combine both lists
            List<AdminUserDTO> combinedList = new java.util.ArrayList<>();
            combinedList.addAll(admins.getContent().stream().map(AdminUserDTO::new).collect(Collectors.toList()));
            combinedList.addAll(assignedClients.getContent().stream().map(AdminUserDTO::new).collect(Collectors.toList()));

            // Remove duplicates based on user ID
            List<AdminUserDTO> uniqueUsers = combinedList
                .stream()
                .collect(Collectors.toMap(AdminUserDTO::getId, user -> user, (existing, replacement) -> existing))
                .values()
                .stream()
                .collect(Collectors.toList());

            return new PageImpl<>(uniqueUsers, pageable, uniqueUsers.size());
        }

        return new PageImpl<>(Collections.emptyList(), pageable, 0);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllPublicUsers(Pageable pageable) {
        LOG.debug("Enter: getAllPublicUsers() with argument[s] = [{}]", pageable);

        // Get current user
        Optional<User> currentUserOpt = getUserWithAuthorities();

        if (currentUserOpt.isPresent()) {
            User currentUser = currentUserOpt.get();

            // If user is ADMIN, filter by entreprise_id
            if (currentUser.getRole() == Role.ADMIN && currentUser.getEntreprise() != null) {
                LOG.debug("Filtering users by entreprise_id: {}", currentUser.getEntreprise().getId());
                Page<UserDTO> result = userRepository
                    .findAllByEntrepriseId(currentUser.getEntreprise().getId(), pageable)
                    .map(UserDTO::new);
                LOG.debug("Exit: getAllPublicUsers() with result = {}", result);
                return result;
            }

            // If user is CONSEILLER, show only admins from their entreprise and assigned clients
            if (currentUser.getRole() == Role.CONSEILLER && currentUser.getEntreprise() != null) {
                LOG.debug("Filtering users for CONSEILLER: {}", currentUser.getLogin());

                // Get admins from the same entreprise
                Page<User> admins = userRepository.findAdminsByEntrepriseId(currentUser.getEntreprise().getId(), Role.ADMIN, pageable);

                // Get clients assigned to this conseiller
                Page<User> assignedClients = userRepository.findClientsAssignedToConseiller(currentUser.getId(), pageable);

                // Combine both lists
                List<UserDTO> combinedList = new java.util.ArrayList<>();
                combinedList.addAll(admins.getContent().stream().map(UserDTO::new).collect(Collectors.toList()));
                combinedList.addAll(assignedClients.getContent().stream().map(UserDTO::new).collect(Collectors.toList()));

                // Remove duplicates based on user ID
                List<UserDTO> uniqueUsers = combinedList
                    .stream()
                    .collect(Collectors.toMap(UserDTO::getId, user -> user, (existing, replacement) -> existing))
                    .values()
                    .stream()
                    .collect(Collectors.toList());

                Page<UserDTO> result = new PageImpl<>(uniqueUsers, pageable, uniqueUsers.size());
                LOG.debug("Exit: getAllPublicUsers() with result = {}", result);
                return result;
            }
        }

        // For SUPERADMIN, CLIENT or unauthenticated users, return all active users
        Page<UserDTO> result = userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(UserDTO::new);
        LOG.debug("Exit: getAllPublicUsers() with result = {}", result);
        return result;
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthorities() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
    }

    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        userRepository
            .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
            .forEach(user -> {
                LOG.debug("Deleting not activated user {}", user.getLogin());
                userRepository.delete(user);
                this.clearUserCaches(user);
            });
    }

    /**
     * Gets a list of all the authorities.
     * @return
     */
    @Transactional(readOnly = true)
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).toList();
    }

    private void clearUserCaches(User user) {
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE)).evictIfPresent(user.getLogin());
        if (user.getEmail() != null) {
            Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE)).evictIfPresent(user.getEmail());
        }
    }

    private Set<Authority> getAuthoritiesForRole(Role role) {
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(authorities::add);

        switch (role) {
            case ADMIN:
                authorityRepository.findById(AuthoritiesConstants.ADMIN).ifPresent(authorities::add);
                break;
            case SUPER_ADMIN:
                authorityRepository.findById(AuthoritiesConstants.ADMIN).ifPresent(authorities::add);
                authorityRepository.findById(AuthoritiesConstants.SUPER_ADMIN).ifPresent(authorities::add);
                break;
            case RESPONSABLE:
                authorityRepository.findById(AuthoritiesConstants.ADMIN).ifPresent(authorities::add);
                authorityRepository.findById(AuthoritiesConstants.RESPONSABLE).ifPresent(authorities::add);
                break;
            case CLIENT:
            case CONSEILLER:
            default:
                // Only USER authority
                break;
        }
        return authorities;
    }
}
