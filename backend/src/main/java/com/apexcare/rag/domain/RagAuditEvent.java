package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rag_audit_events")
public class RagAuditEvent {
    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, columnDefinition = "text")
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(name = "response_status", nullable = false)
    private RagResponseStatus responseStatus;

    @Column(name = "source_document_ids", nullable = false, columnDefinition = "text")
    private String sourceDocumentIds;

    @Column(name = "top_score")
    private Double topScore;

    @Column(name = "latency_ms", nullable = false)
    private long latencyMs;

    @Column
    private String feedback;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected RagAuditEvent() {}

    public RagAuditEvent(UUID id, UUID userId, String question, RagResponseStatus responseStatus,
                         String sourceDocumentIds, Double topScore, long latencyMs, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.question = question;
        this.responseStatus = responseStatus;
        this.sourceDocumentIds = sourceDocumentIds;
        this.topScore = topScore;
        this.latencyMs = latencyMs;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getQuestion() { return question; }
    public RagResponseStatus getResponseStatus() { return responseStatus; }
    public String getSourceDocumentIds() { return sourceDocumentIds; }
    public Double getTopScore() { return topScore; }
    public long getLatencyMs() { return latencyMs; }
    public String getFeedback() { return feedback; }
    public Instant getCreatedAt() { return createdAt; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
