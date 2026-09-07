package com.reclamation.chat.repository;

import com.reclamation.chat.domain.Reclamation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {
    /**
     * Find a reclamation by its id.
     * @param idReclamation
     * @return Optional containing the reclamation if found, empty otherwise
     */
    Optional<Reclamation> findByIdReclamation(String idReclamation);

    /**
     * Find reclamations by status.
     * @param statut
     * @return
     */
    List<Reclamation> findByStatut(String statut);

    /**
     * Find all reclamations by priority level.
     * @param niveau
     * @return
     */
    List<Reclamation> findByNiveau(String niveau);

    /**
     * Find with pagination support (page number, size, sort)
     * @param pageable
     * @return Page
     */
    Page<Reclamation> findAll(Pageable pageable);

    /**
     * Find by status with pagination.
     * @param statut
     * @param pageable
     * @return Page
     */
    Page<Reclamation> findByStatut(String statut, Pageable pageable);

    /**
     * Custom query to find reclamations by score greater than a threshold.
     * @param score the minimum score threshold
     * @return List of reclamations with score greater than the threshold
     */
    @Query("SELECT r FROM Reclamation r WHERE r.score > :score")
    List<Reclamation> findByScoreGreaterThan(@Param("score") Integer score);

    /**
     * Custom query to count reclamations by status.
     * @param statut the status to count
     * @return the count of reclamations with the given status
     */
    @Query("SELECT COUNT(r) FROM Reclamation r WHERE r.statut = :statut")
    long countByStatut(@Param("statut") String statut);

    /**
     * Count active reclamations assigned to a specific conseiller
     * @param conseillerId
     * @return
     */
    @Query("SELECT COUNT(r) FROM Reclamation r WHERE r.assignedTo.id = :conseillerId AND r.statut IN ('PENDING', 'IN_PROGRESS')")
    int countActiveReclamationsByConseiller(@Param("conseillerId") Long conseillerId);

    /**
     * Count active reclamations assigned to a specific user (alias for countActiveReclamationsByConseiller)
     * @param userId
     * @return
     */
    @Query("SELECT COUNT(r) FROM Reclamation r WHERE r.assignedTo.id = :userId AND r.statut IN ('PENDING', 'IN_PROGRESS')")
    int countActiveReclamationsByAssignedTo(@Param("userId") Long userId);

    /**
     * Find all reclamations created by a specific user (by login).
     * Used to determine client's entreprise from their reclamations.
     * @param createdBy
     * @return List of reclamations created by the user
     */
    List<Reclamation> findByCreatedBy(String createdBy);

    /**
     * Find all reclamations by entreprise with pagination.
     * Used to filter reclamations for conseillers and admins.
     *
     * @param entrepriseId
     * @param pageable
     * @return
     */
    Page<Reclamation> findByEntreprise_Id(Long entrepriseId, Pageable pageable);
}
