package com.reclamation.chat.service;

import com.reclamation.chat.domain.Entreprise;
import com.reclamation.chat.repository.EntrepriseRepository;
import com.reclamation.chat.service.dto.EntrepriseDTO;
import com.reclamation.chat.service.dto.EntrepriseRequestDTO;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EntrepriseService {

    private static final Logger LOG = LoggerFactory.getLogger(EntrepriseService.class);

    private final EntrepriseRepository entrepriseRepository;

    public EntrepriseService(EntrepriseRepository entrepriseRepository) {
        this.entrepriseRepository = entrepriseRepository;
    }

    public EntrepriseDTO create(EntrepriseRequestDTO requestDTO) {
        LOG.debug("Request to create Entreprise : {}", requestDTO.getNomEntreprise());

        Entreprise entreprise = new Entreprise();
        entreprise.setIdEntreprise(requestDTO.getIdEntreprise());
        entreprise.setNomEntreprise(requestDTO.getNomEntreprise());
        entreprise.setSecteur(requestDTO.getSecteur());
        entreprise.setAdresseEntreprise(requestDTO.getAdresseEntreprise());
        entreprise.setTel(requestDTO.getTel());
        entreprise.setEmailEntreprise(requestDTO.getEmailEntreprise());
        entreprise.setDateCreation(Optional.ofNullable(requestDTO.getDateCreation()).orElse(Instant.now()));
        entreprise.setStatutEntreprise(requestDTO.getStatutEntreprise());

        Entreprise saved = entrepriseRepository.save(entreprise);
        return toDTO(saved);
    }

    // Update all fields of an existing enterprise

    public EntrepriseDTO update(Long id, EntrepriseRequestDTO requestDTO) {
        LOG.debug("Request to update Entreprise : {}", id);

        Entreprise entreprise = entrepriseRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Entreprise not found with id: " + id));

        entreprise.setIdEntreprise(requestDTO.getIdEntreprise());
        entreprise.setNomEntreprise(requestDTO.getNomEntreprise());
        entreprise.setSecteur(requestDTO.getSecteur());
        entreprise.setAdresseEntreprise(requestDTO.getAdresseEntreprise());
        entreprise.setTel(requestDTO.getTel());
        entreprise.setEmailEntreprise(requestDTO.getEmailEntreprise());
        entreprise.setDateCreation(requestDTO.getDateCreation());
        entreprise.setStatutEntreprise(requestDTO.getStatutEntreprise());

        Entreprise updated = entrepriseRepository.save(entreprise);
        return toDTO(updated);
    }

    //partially update an enterprise
    public Optional<EntrepriseDTO> partialUpdate(Long id, EntrepriseRequestDTO requestDTO) {
        LOG.debug("Request to partially update Entreprise : {}", id);
        return entrepriseRepository
            .findById(id)
            .map(existing -> {
                if (requestDTO.getIdEntreprise() != null) {
                    existing.setIdEntreprise(requestDTO.getIdEntreprise());
                }
                if (requestDTO.getNomEntreprise() != null) {
                    existing.setNomEntreprise(requestDTO.getNomEntreprise());
                }
                if (requestDTO.getSecteur() != null) {
                    existing.setSecteur(requestDTO.getSecteur());
                }
                if (requestDTO.getAdresseEntreprise() != null) {
                    existing.setAdresseEntreprise(requestDTO.getAdresseEntreprise());
                }
                if (requestDTO.getTel() != null) {
                    existing.setTel(requestDTO.getTel());
                }
                if (requestDTO.getEmailEntreprise() != null) {
                    existing.setEmailEntreprise(requestDTO.getEmailEntreprise());
                }
                if (requestDTO.getDateCreation() != null) {
                    existing.setDateCreation(requestDTO.getDateCreation());
                }
                if (requestDTO.getStatutEntreprise() != null) {
                    existing.setStatutEntreprise(requestDTO.getStatutEntreprise());
                }
                return existing;
            })
            .map(entrepriseRepository::save)
            .map(this::toDTO);
    }

    //get paginated enterprises

    @Transactional(readOnly = true)
    public Page<EntrepriseDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get enterprises page");
        return entrepriseRepository.findAll(pageable).map(this::toDTO);
    }

    //list all enterprises

    @Transactional(readOnly = true)
    public List<EntrepriseDTO> findAll() {
        LOG.debug("Request to get all enterprises");
        return entrepriseRepository.findAll().stream().map(this::toDTO).toList();
    }

    //get one enterprise by id

    @Transactional(readOnly = true)
    public Optional<EntrepriseDTO> findOne(Long id) {
        LOG.debug("Request to get Entreprise : {}", id);
        return entrepriseRepository.findById(id).map(this::toDTO);
    }

    //get enterprise by id

    @Transactional(readOnly = true)
    public Optional<EntrepriseDTO> findByIdEntreprise(String idEntreprise) {
        LOG.debug("Request to get Entreprise by identifier : {}", idEntreprise);
        return entrepriseRepository.findByIdEntreprise(idEntreprise).map(this::toDTO);
    }

    //delete enterprise by id

    public void delete(Long id) {
        LOG.debug("Request to delete Entreprise : {}", id);
        entrepriseRepository.deleteById(id);
    }

    //map entity to DTO
    private EntrepriseDTO toDTO(Entreprise entreprise) {
        EntrepriseDTO dto = new EntrepriseDTO();
        dto.setId(entreprise.getId());
        dto.setIdEntreprise(entreprise.getIdEntreprise());
        dto.setNomEntreprise(entreprise.getNomEntreprise());
        dto.setSecteur(entreprise.getSecteur());
        dto.setAdresseEntreprise(entreprise.getAdresseEntreprise());
        dto.setTel(entreprise.getTel());
        dto.setEmailEntreprise(entreprise.getEmailEntreprise());
        dto.setDateCreation(entreprise.getDateCreation());
        dto.setStatutEntreprise(entreprise.getStatutEntreprise());
        dto.setCreatedBy(entreprise.getCreatedBy());
        dto.setCreatedDate(entreprise.getCreatedDate());
        dto.setLastModifiedBy(entreprise.getLastModifiedBy());
        dto.setLastModifiedDate(entreprise.getLastModifiedDate());
        return dto;
    }
}
