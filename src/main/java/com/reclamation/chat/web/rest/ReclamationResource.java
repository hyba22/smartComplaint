package com.reclamation.chat.web.rest;

import com.reclamation.chat.domain.Reclamation;
import com.reclamation.chat.service.ReclamationService;
import com.reclamation.chat.service.dto.ConseillerStatusDTO;
import com.reclamation.chat.service.dto.ReclamationDTO;
import com.reclamation.chat.service.dto.ReclamationRequestDTO;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/reclamations")
public class ReclamationResource {

    private final Logger log = LoggerFactory.getLogger(ReclamationResource.class);

    private final ReclamationService reclamationService;

    public ReclamationResource(ReclamationService reclamationService) {
        this.reclamationService = reclamationService;
    }

    @PostMapping
    public ResponseEntity<ReclamationDTO> createReclamation(@Valid @RequestBody ReclamationRequestDTO reclamationRequestDTO) {
        log.debug("REST request to save Reclamation : {}", reclamationRequestDTO);

        Reclamation reclamation = reclamationService.creerReclamation(reclamationRequestDTO);
        ReclamationDTO reclamationDTO = toDTO(reclamation);

        return ResponseEntity.status(HttpStatus.CREATED).body(reclamationDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReclamationDTO> updateReclamation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ReclamationRequestDTO reclamationRequestDTO
    ) {
        log.debug("REST request to update Reclamation : {}, {}", id, reclamationRequestDTO);

        Reclamation reclamation = reclamationService.update(id, reclamationRequestDTO);
        ReclamationDTO reclamationDTO = toDTO(reclamation);

        return ResponseEntity.ok(reclamationDTO);
    }

    @GetMapping
    public ResponseEntity<List<ReclamationDTO>> getAllReclamations(Pageable pageable) {
        log.debug("REST request to get a page of Reclamations");

        Page<ReclamationDTO> page = reclamationService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);

        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReclamationDTO> getReclamation(@PathVariable Long id) {
        log.debug("REST request to get Reclamation : {}", id);

        Optional<ReclamationDTO> reclamationDTO = reclamationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(reclamationDTO);
    }

    @GetMapping("/id/{idReclamation}")
    public ResponseEntity<ReclamationDTO> getReclamationById(@PathVariable String idReclamation) {
        log.debug("REST request to get Reclamation by ID : {}", idReclamation);

        Optional<ReclamationDTO> reclamationDTO = reclamationService.findByIdReclamation(idReclamation);
        return ResponseUtil.wrapOrNotFound(reclamationDTO);
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<ReclamationDTO>> getReclamationsByStatut(@PathVariable String statut) {
        log.debug("REST request to get Reclamations by status : {}", statut);

        List<ReclamationDTO> reclamations = reclamationService.findByStatut(statut);
        return ResponseEntity.ok(reclamations);
    }

    @GetMapping("/niveau/{niveau}")
    public ResponseEntity<List<ReclamationDTO>> getReclamationsByNiveau(@PathVariable String niveau) {
        log.debug("REST request to get Reclamations by priority level : {}", niveau);

        List<ReclamationDTO> reclamations = reclamationService.findByNiveau(niveau);
        return ResponseEntity.ok(reclamations);
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<ReclamationDTO> modifierStatut(@PathVariable Long id, @RequestBody String newStatut) {
        log.debug("REST request to modify status of Reclamation : {} to {}", id, newStatut);

        Reclamation reclamation = reclamationService.modifierStatut(id, newStatut);
        ReclamationDTO reclamationDTO = toDTO(reclamation);

        return ResponseEntity.ok(reclamationDTO);
    }

    @PutMapping("/{id}/priorite")
    public ResponseEntity<ReclamationDTO> gererPrioriteAuto(@PathVariable Long id) {
        log.debug("REST request to auto-manage priority for Reclamation : {}", id);

        Reclamation reclamation = reclamationService.gererPrioriteAuto(id);
        ReclamationDTO reclamationDTO = toDTO(reclamation);

        return ResponseEntity.ok(reclamationDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReclamation(@PathVariable Long id) {
        log.debug("REST request to delete Reclamation : {}", id);

        reclamationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/conseillers")
    public ResponseEntity<List<ConseillerStatusDTO>> getConseillersWithStatus() {
        log.debug("REST request to get all Conseillers with online status");

        List<ConseillerStatusDTO> conseillers = reclamationService.getConseillersWithStatus();
        return ResponseEntity.ok(conseillers);
    }

    @PutMapping("/{id}/transfer/{conseillerId}")
    public ResponseEntity<ReclamationDTO> transferReclamation(@PathVariable Long id, @PathVariable Long conseillerId) {
        log.debug("REST request to transfer Reclamation {} to Conseiller {}", id, conseillerId);

        Reclamation reclamation = reclamationService.transferReclamation(id, conseillerId);
        ReclamationDTO reclamationDTO = toDTO(reclamation);

        return ResponseEntity.ok(reclamationDTO);
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
            com.reclamation.chat.domain.User assignedUser = reclamation.getAssignedTo();
            dto.setAssignedTo(
                new ReclamationDTO.AssignedUserDTO(
                    assignedUser.getId(),
                    assignedUser.getLogin(),
                    assignedUser.getFirstName(),
                    assignedUser.getLastName()
                )
            );
        }

        if (reclamation.getEntreprise() != null) {
            dto.setEntreprise(
                new ReclamationDTO.EntrepriseDTO(reclamation.getEntreprise().getId(), reclamation.getEntreprise().getNomEntreprise())
            );
            dto.setEntrepriseId(reclamation.getEntreprise().getId());
        }

        return dto;
    }
}
