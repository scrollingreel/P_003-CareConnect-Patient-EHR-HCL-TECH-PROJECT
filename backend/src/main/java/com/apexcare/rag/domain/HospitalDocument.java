package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hospital_documents")
public class HospitalDocument {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "section_label")
    private String sectionLabel;

    @Column(name = "source_file_name")
    private String sourceFileName;

    @Column(name = "document_version", nullable = false)
    private String documentVersion;

    @Column(name = "content_hash", nullable = false, unique = true, length = 64)
    private String contentHash;

    @Lob
    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "indexed_at")
    private Instant indexedAt;

    protected HospitalDocument() {}

    public HospitalDocument(UUID id, String title, String documentType, String sectionLabel, String sourceFileName,
                            String documentVersion, String contentHash, String content, DocumentStatus status,
                            UUID createdBy, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.documentType = documentType;
        this.sectionLabel = sectionLabel;
        this.sourceFileName = sourceFileName;
        this.documentVersion = documentVersion;
        this.contentHash = contentHash;
        this.content = content;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getDocumentType() { return documentType; }
    public String getSectionLabel() { return sectionLabel; }
    public String getSourceFileName() { return sourceFileName; }
    public String getDocumentVersion() { return documentVersion; }
    public String getContentHash() { return contentHash; }
    public String getContent() { return content; }
    public DocumentStatus getStatus() { return status; }
    public UUID getCreatedBy() { return createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getIndexedAt() { return indexedAt; }
    public void markIndexed(Instant at) { this.status = DocumentStatus.INDEXED; this.indexedAt = at; }
    public void markFailed() { this.status = DocumentStatus.FAILED; }
}
