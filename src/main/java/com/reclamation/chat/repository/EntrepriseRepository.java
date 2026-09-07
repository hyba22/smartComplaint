package com.reclamation.chat.repository;

import com.reclamation.chat.domain.Entreprise;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    /**
     * Find an enterprise by its business id.
     *
     * @param idEntreprise business id
     * @return
     */
    Optional<Entreprise> findByIdEntreprise(String idEntreprise);
}
