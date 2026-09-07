package com.reclamation.chat.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

public class ReclamationRequestDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "ID reclamation is required")
    @Size(min = 1, max = 100, message = "ID reclamation must be between 1 and 100 characters")
    private String idReclamation;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String titre;

    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;

    private Instant dateDepot;

    private Instant dateResolution;

    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String statut;

    @Size(max = 50, message = "Priority level cannot exceed 50 characters")
    private String niveau;

    @Size(max = 500, message = "Attachment path cannot exceed 500 characters")
    private String pieceJointe;

    @Min(value = 0, message = "Score cannot be negative")
    @Max(value = 100, message = "Score cannot exceed 100")
    private Integer score;

    private Long entrepriseId;

    // Default constructor - required for serialization
    public ReclamationRequestDTO() {}

    public ReclamationRequestDTO(String idReclamation, String titre) {
        this.idReclamation = idReclamation;
        this.titre = titre;
    }

    public String getIdReclamation() {
        return idReclamation;
    }

    public void setIdReclamation(String idReclamation) {
        this.idReclamation = idReclamation;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getDateDepot() {
        return dateDepot;
    }

    public void setDateDepot(Instant dateDepot) {
        this.dateDepot = dateDepot;
    }

    public Instant getDateResolution() {
        return dateResolution;
    }

    public void setDateResolution(Instant dateResolution) {
        this.dateResolution = dateResolution;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getNiveau() {
        return niveau;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public String getPieceJointe() {
        return pieceJointe;
    }

    public void setPieceJointe(String pieceJointe) {
        this.pieceJointe = pieceJointe;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Long getEntrepriseId() {
        return entrepriseId;
    }

    public void setEntrepriseId(Long entrepriseId) {
        this.entrepriseId = entrepriseId;
    }

    @Override
    public String toString() {
        return (
            "ReclamationRequestDTO{" +
            "idReclamation='" +
            idReclamation +
            '\'' +
            ", titre='" +
            titre +
            '\'' +
            ", statut='" +
            statut +
            '\'' +
            ", niveau='" +
            niveau +
            '\'' +
            ", score=" +
            score +
            '}'
        );
    }
}
