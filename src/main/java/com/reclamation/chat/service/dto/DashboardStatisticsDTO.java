package com.reclamation.chat.service.dto;

import java.util.Map;

public class DashboardStatisticsDTO {

    private long totalReclamations;
    private long pendingReclamations;
    private long inProgressReclamations;
    private long resolvedReclamations;
    private long closedReclamations;

    private long totalUsers;
    private long totalClients;
    private long totalConseillers;
    private long totalAdmins;
    private long activeUsers;

    private long totalConversations;
    private long activeConversations;
    private long totalMessages;

    private Map<String, Long> reclamationsByLevel;
    private Map<String, Long> reclamationsByStatus;
    private Map<String, Long> usersByRole;

    // Time series data for charts
    private Map<String, Long> reclamationsOverTime;
    private Map<String, Long> conversationsOverTime;

    public DashboardStatisticsDTO() {}

    public long getTotalReclamations() {
        return totalReclamations;
    }

    public void setTotalReclamations(long totalReclamations) {
        this.totalReclamations = totalReclamations;
    }

    public long getPendingReclamations() {
        return pendingReclamations;
    }

    public void setPendingReclamations(long pendingReclamations) {
        this.pendingReclamations = pendingReclamations;
    }

    public long getInProgressReclamations() {
        return inProgressReclamations;
    }

    public void setInProgressReclamations(long inProgressReclamations) {
        this.inProgressReclamations = inProgressReclamations;
    }

    public long getResolvedReclamations() {
        return resolvedReclamations;
    }

    public void setResolvedReclamations(long resolvedReclamations) {
        this.resolvedReclamations = resolvedReclamations;
    }

    public long getClosedReclamations() {
        return closedReclamations;
    }

    public void setClosedReclamations(long closedReclamations) {
        this.closedReclamations = closedReclamations;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalClients() {
        return totalClients;
    }

    public void setTotalClients(long totalClients) {
        this.totalClients = totalClients;
    }

    public long getTotalConseillers() {
        return totalConseillers;
    }

    public void setTotalConseillers(long totalConseillers) {
        this.totalConseillers = totalConseillers;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTotalConversations() {
        return totalConversations;
    }

    public void setTotalConversations(long totalConversations) {
        this.totalConversations = totalConversations;
    }

    public long getActiveConversations() {
        return activeConversations;
    }

    public void setActiveConversations(long activeConversations) {
        this.activeConversations = activeConversations;
    }

    public long getTotalMessages() {
        return totalMessages;
    }

    public void setTotalMessages(long totalMessages) {
        this.totalMessages = totalMessages;
    }

    public Map<String, Long> getReclamationsByLevel() {
        return reclamationsByLevel;
    }

    public void setReclamationsByLevel(Map<String, Long> reclamationsByLevel) {
        this.reclamationsByLevel = reclamationsByLevel;
    }

    public Map<String, Long> getReclamationsByStatus() {
        return reclamationsByStatus;
    }

    public void setReclamationsByStatus(Map<String, Long> reclamationsByStatus) {
        this.reclamationsByStatus = reclamationsByStatus;
    }

    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }

    public Map<String, Long> getReclamationsOverTime() {
        return reclamationsOverTime;
    }

    public void setReclamationsOverTime(Map<String, Long> reclamationsOverTime) {
        this.reclamationsOverTime = reclamationsOverTime;
    }

    public Map<String, Long> getConversationsOverTime() {
        return conversationsOverTime;
    }

    public void setConversationsOverTime(Map<String, Long> conversationsOverTime) {
        this.conversationsOverTime = conversationsOverTime;
    }
}
