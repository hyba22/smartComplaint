package com.reclamation.chat.service.dto;

import java.io.Serial;
import java.io.Serializable;

public class ConseillerStatusDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String login;
    private String firstName;
    private String lastName;
    private String email;
    private boolean online;
    private int activeReclamationsCount;

    public ConseillerStatusDTO() {}

    public ConseillerStatusDTO(
        Long id,
        String login,
        String firstName,
        String lastName,
        String email,
        boolean online,
        int activeReclamationsCount
    ) {
        this.id = id;
        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.online = online;
        this.activeReclamationsCount = activeReclamationsCount;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }

    public int getActiveReclamationsCount() {
        return activeReclamationsCount;
    }

    public void setActiveReclamationsCount(int activeReclamationsCount) {
        this.activeReclamationsCount = activeReclamationsCount;
    }
}
