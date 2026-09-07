package com.reclamation.chat.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

public class ReclamationDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

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

    private String createdBy;
    private Instant createdDate;
    private String lastModifiedBy;
    private Instant lastModifiedDate;
    private Long entrepriseId;

    private String classificationMethod;
    private Double classificationConfidence;

    private AssignedUserDTO assignedTo;
    private AssignedUserDTO transferredBy;
    private EntrepriseDTO entreprise;

    public static class AssignedUserDTO implements Serializable {

        private Long id;
        private String login;
        private String firstName;
        private String lastName;

        public AssignedUserDTO() {}

        public AssignedUserDTO(Long id, String login, String firstName, String lastName) {
            this.id = id;
            this.login = login;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getLogin() {
            return login;
        }

        public void setLogin(String login) {
            this.login = login;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    public static class EntrepriseDTO implements Serializable {

        private Long id;
        private String nom;

        public EntrepriseDTO() {}

        public EntrepriseDTO(Long id, String nom) {
            this.id = id;
            this.nom = nom;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNom() {
            return nom;
        }

        public void setNom(String nom) {
            this.nom = nom;
        }
    }

    public ReclamationDTO() {}

    public ReclamationDTO(String idReclamation, String titre) {
        this.idReclamation = idReclamation;
        this.titre = titre;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public Instant getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public Long getEntrepriseId() {
        return entrepriseId;
    }

    public void setEntrepriseId(Long entrepriseId) {
        this.entrepriseId = entrepriseId;
    }

    public String getClassificationMethod() {
        return classificationMethod;
    }

    public void setClassificationMethod(String classificationMethod) {
        this.classificationMethod = classificationMethod;
    }

    public Double getClassificationConfidence() {
        return classificationConfidence;
    }

    public void setClassificationConfidence(Double classificationConfidence) {
        this.classificationConfidence = classificationConfidence;
    }

    public AssignedUserDTO getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(AssignedUserDTO assignedTo) {
        this.assignedTo = assignedTo;
    }

    public AssignedUserDTO getTransferredBy() {
        return transferredBy;
    }

    public void setTransferredBy(AssignedUserDTO transferredBy) {
        this.transferredBy = transferredBy;
    }

    public EntrepriseDTO getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(EntrepriseDTO entreprise) {
        this.entreprise = entreprise;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ReclamationDTO)) {
            return false;
        }
        return id != null && id.equals(((ReclamationDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "ReclamationDTO{" +
            "id=" +
            id +
            ", idReclamation='" +
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
