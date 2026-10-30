package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "patient_notifications")
public class PatientNotification {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "recipient_role", nullable = false, length = 20)
    private String recipientRole;

    @Column(nullable = false, length = 50)
    private String type; // CRITICAL_ALERT, APPOINTMENT_REMINDER, LAB_RESULT, RX_READY, SYSTEM

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 20)
    private String severity = "INFO"; // INFO, WARNING, CRITICAL

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "action_url", length = 200)
    private String actionUrl;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public PatientNotification() {}

    public PatientNotification(String id, String userId, String recipientRole, String type,
                               String title, String message, String severity, String actionUrl) {
        this.id = id;
        this.userId = userId;
        this.recipientRole = recipientRole;
        this.type = type;
        this.title = title;
        this.message = message;
        this.severity = severity != null ? severity : "INFO";
        this.isRead = false;
        this.actionUrl = actionUrl;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getRecipientRole() { return recipientRole; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getSeverity() { return severity; }
    public Boolean getIsRead() { return isRead; }
    public String getActionUrl() { return actionUrl; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    public void setType(String type) { this.type = type; }
    public void setTitle(String title) { this.title = title; }
    public void setMessage(String message) { this.message = message; }
    public void setSeverity(String severity) { this.severity = severity; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
