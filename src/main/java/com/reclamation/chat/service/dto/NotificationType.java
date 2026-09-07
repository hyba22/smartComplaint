package com.reclamation.chat.service.dto;

public enum NotificationType {
    CHAT_MESSAGE("CHAT_MESSAGE", "Nouveau message"),
    STATUS_UPDATE("STATUS_UPDATE", "Mise à jour de statut"),
    CONVERSATION_ASSIGNED("CONVERSATION_ASSIGNED", "Conversation assignée"),
    RECLAMATION_ASSIGNED("RECLAMATION_ASSIGNED", "Réclamation assignée"),
    RECLAMATION_CREATED("RECLAMATION_CREATED", "Nouvelle réclamation"),
    SYSTEM("SYSTEM", "Notification système");

    private final String code;
    private final String label;

    NotificationType(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static NotificationType fromCode(String code) {
        for (NotificationType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return SYSTEM;
    }
}
