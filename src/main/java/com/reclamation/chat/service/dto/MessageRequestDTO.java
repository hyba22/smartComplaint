package com.reclamation.chat.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serial;
import java.io.Serializable;

public class MessageRequestDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Conversation id is required")
    private Long conversationId;

    @NotBlank(message = "Message identifier is required")
    @Size(max = 60, message = "Message identifier cannot exceed 60 characters")
    private String idMsg;

    @Size(max = 10000, message = "Message content cannot exceed 10000 characters")
    private String contenu;

    private Boolean estLu;

    @Size(max = 500, message = "Attachment path cannot exceed 500 characters")
    private String pieceJointe;

    @Size(max = 20, message = "Message type cannot exceed 20 characters")
    private String messageType;

    @NotNull(message = "Sender id is required")
    private Long senderId;

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
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

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }
}
