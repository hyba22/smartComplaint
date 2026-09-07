package com.reclamation.chat.domain;

import jakarta.persistence.*;
import java.io.Serial;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Reclamation entity - represents a complaint/claim in the system
 * Extends AbstractAuditingEntity to automatically track who created/modified the record and when
 */
@Entity
@Table(name = "reclamation")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE) // Enables second-level caching for better performance
public class Reclamation extends AbstractAuditingEntity<Long> {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "id_reclamation", unique = true, nullable = false, length = 100)
    private String idReclamation;

    @Column(name = "titre", nullable = false, length = 255)
    private String titre;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_depot")
    private Instant dateDepot;

    @Column(name = "date_resolution")
    private Instant dateResolution;

    @Column(name = "statut", length = 50)
    private String statut;

    @Column(name = "niveau", length = 50)
    private String niveau;

    @Column(name = "piece_jointe", length = 500)
    private String pieceJointe;

    @Column(name = "score")
    private Integer score;

    @Column(name = "feedback_comment", length = 255)
    private String feedbackComment;

    @Column(name = "classification_method", length = 20)
    private String classificationMethod;

    @Column(name = "classification_confidence")
    private Double classificationConfidence;

    @Column(name = "assigned_date")
    private Instant assignedDate;

    @ManyToOne
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    public Reclamation() {}

    public Reclamation(String idReclamation, String titre, String description) {
        this.idReclamation = idReclamation;
        this.titre = titre;
        this.description = description;
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

    public String getFeedbackComment() {
        return feedbackComment;
    }

    public void setFeedbackComment(String feedbackComment) {
        this.feedbackComment = feedbackComment;
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

    public Instant getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(Instant assignedDate) {
        this.assignedDate = assignedDate;
    }

    public Entreprise getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(Entreprise entreprise) {
        this.entreprise = entreprise;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Reclamation)) {
            return false;
        }
        return id != null && id.equals(((Reclamation) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "Reclamation{" +
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
