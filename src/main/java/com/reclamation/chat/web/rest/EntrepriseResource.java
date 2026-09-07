package com.reclamation.chat.web.rest;

import com.reclamation.chat.service.EntrepriseService;
import com.reclamation.chat.service.dto.EntrepriseDTO;
import com.reclamation.chat.service.dto.EntrepriseRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/entreprises")
public class EntrepriseResource {

    private static final Logger LOG = LoggerFactory.getLogger(EntrepriseResource.class);

    private final EntrepriseService entrepriseService;

    private final String applicationName = "speedComplaintApp";

    public EntrepriseResource(EntrepriseService entrepriseService) {
        this.entrepriseService = entrepriseService;
    }

    @PostMapping
    public ResponseEntity<EntrepriseDTO> createEntreprise(@Valid @RequestBody EntrepriseRequestDTO requestDTO) throws URISyntaxException {
        LOG.debug("REST request to save Entreprise : {}", requestDTO);
        EntrepriseDTO result = entrepriseService.create(requestDTO);
        return ResponseEntity.created(new URI("/api/entreprises/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "entreprise", result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntrepriseDTO> updateEntreprise(
        @PathVariable("id") Long id,
        @Valid @RequestBody EntrepriseRequestDTO requestDTO
    ) {
        LOG.debug("REST request to update Entreprise : {}, {}", id, requestDTO);
        EntrepriseDTO result = entrepriseService.update(id, requestDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, "entreprise", id.toString()))
            .body(result);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<EntrepriseDTO> partialUpdateEntreprise(
        @PathVariable("id") Long id,
        @NotNull @RequestBody EntrepriseRequestDTO requestDTO
    ) {
        LOG.debug("REST request to partially update Entreprise : {}, {}", id, requestDTO);
        Optional<EntrepriseDTO> result = entrepriseService.partialUpdate(id, requestDTO);
        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, "entreprise", id.toString()));
    }

    @GetMapping
    public ResponseEntity<List<EntrepriseDTO>> getAllEntreprises(Pageable pageable) {
        LOG.debug("REST request to get a page of Enterprises");
        Page<EntrepriseDTO> page = entrepriseService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/list")
    public ResponseEntity<List<EntrepriseDTO>> listEntreprises() {
        LOG.debug("REST request to get list of Enterprises");
        List<EntrepriseDTO> result = entrepriseService.findAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntrepriseDTO> getEntreprise(@PathVariable Long id) {
        LOG.debug("REST request to get Entreprise : {}", id);
        Optional<EntrepriseDTO> entrepriseDTO = entrepriseService.findOne(id);
        return ResponseUtil.wrapOrNotFound(entrepriseDTO);
    }

    @GetMapping("/identifier/{idEntreprise}")
    public ResponseEntity<EntrepriseDTO> getEntrepriseByIdentifier(@PathVariable String idEntreprise) {
        LOG.debug("REST request to get Entreprise by identifier : {}", idEntreprise);
        Optional<EntrepriseDTO> entrepriseDTO = entrepriseService.findByIdEntreprise(idEntreprise);
        return ResponseUtil.wrapOrNotFound(entrepriseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntreprise(@PathVariable Long id) {
        LOG.debug("REST request to delete Entreprise : {}", id);
        entrepriseService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, "entreprise", id.toString()))
            .build();
    }
}
