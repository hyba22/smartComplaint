package com.reclamation.chat.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

public class MessageDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "Message identifier is required")
    @Size(max = 60, message = "Message identifier cannot exceed 60 characters")
    private String idMsg;

    @Size(max = 10000, message = "Message content cannot exceed 10000 characters")
    private String contenu;

    private Instant dateEnvoi;

    private Boolean estLu;

    @Size(max = 500, message = "Attachment path cannot exceed 500 characters")
    private String pieceJointe;

    @Size(max = 20, message = "Message type cannot exceed 20 characters")
    private String messageType = "TEXT";

    private Long conversationId;

    private ConversationParticipantDTO sender;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdMsg() {
        return idMsg;
    }

    public void setIdMsg(String idMsg) {
        this.idMsg = idMsg;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public Instant getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(Instant dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public Boolean getEstLu() {
        return estLu;
    }

    public void setEstLu(Boolean estLu) {
        this.estLu = estLu;
    }

    public String getPieceJointe() {
        return pieceJointe;
    }

    public void setPieceJointe(String pieceJointe) {
        this.pieceJointe = pieceJointe;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public ConversationParticipantDTO getSender() {
        return sender;
    }

    public void setSender(ConversationParticipantDTO sender) {
        this.sender = sender;
    }
}
