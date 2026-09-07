package com.reclamation.chat.repository;

import com.reclamation.chat.domain.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    String USERS_BY_LOGIN_CACHE = "usersByLogin";

    String USERS_BY_EMAIL_CACHE = "usersByEmail";
    Optional<User> findOneByActivationKey(String activationKey);
    List<User> findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant dateTime);
    Optional<User> findOneByResetKey(String resetKey);
    Optional<User> findOneByEmailIgnoreCase(String email);
    Optional<User> findOneByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    @Cacheable(cacheNames = USERS_BY_LOGIN_CACHE, unless = "#result == null")
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    @Cacheable(cacheNames = USERS_BY_EMAIL_CACHE, unless = "#result == null")
    Optional<User> findOneWithAuthoritiesByEmailIgnoreCase(String email);

    Page<User> findAllByIdNotNullAndActivatedIsTrue(Pageable pageable);

    @Query("select u from User u where u.entreprise.id = :entrepriseId and u.activated = true")
    Page<User> findAllByEntrepriseId(@Param("entrepriseId") Long entrepriseId, Pageable pageable);

    @Query("select u from User u where u.entreprise.id = :entrepriseId and u.role = :role and u.activated = true")
    List<User> findAllByEntrepriseIdAndRole(@Param("entrepriseId") Long entrepriseId, @Param("role") com.reclamation.chat.domain.Role role);

    @Query("select u from User u where u.role = :role and u.activated = true")
    List<User> findAllByRole(@Param("role") com.reclamation.chat.domain.Role role);

    @Query(
        "SELECT DISTINCT u FROM User u, Reclamation r WHERE r.createdBy = u.login AND r.assignedTo.id = :conseillerId AND u.activated = true"
    )
    Page<User> findClientsAssignedToConseiller(@Param("conseillerId") Long conseillerId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.entreprise.id = :entrepriseId AND u.role = :adminRole AND u.activated = true")
    Page<User> findAdminsByEntrepriseId(
        @Param("entrepriseId") Long entrepriseId,
        @Param("adminRole") com.reclamation.chat.domain.Role adminRole,
        Pageable pageable
    );
}
