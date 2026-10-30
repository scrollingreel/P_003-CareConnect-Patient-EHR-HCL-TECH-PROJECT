package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "secure_messages")
public class SecureMessage {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(name = "sender_id", nullable = false, length = 50)
    private String senderId;

    @Column(name = "sender_name", nullable = false, length = 100)
    private String senderName;

    @Column(name = "sender_role", nullable = false, length = 20)
    private String senderRole;

    @Column(name = "recipient_id", nullable = false, length = 50)
    private String recipientId;

    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    @Column(name = "recipient_role", nullable = false, length = 20)
    private String recipientRole;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public SecureMessage() {}

    public SecureMessage(String id, String patientId, String senderId, String senderName,
                         String senderRole, String recipientId, String recipientName,
                         String recipientRole, String subject, String body) {
        this.id = id;
        this.patientId = patientId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.recipientId = recipientId;
        this.recipientName = recipientName;
        this.recipientRole = recipientRole;
        this.subject = subject;
        this.body = body;
        this.isRead = false;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getSenderId() { return senderId; }
    public String getSenderName() { return senderName; }
    public String getSenderRole() { return senderRole; }
    public String getRecipientId() { return recipientId; }
    public String getRecipientName() { return recipientName; }
    public String getRecipientRole() { return recipientRole; }
    public String getSubject() { return subject; }
    public String getBody() { return body; }
    public Boolean getIsRead() { return isRead; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setBody(String body) { this.body = body; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
