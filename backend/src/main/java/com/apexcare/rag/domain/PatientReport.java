package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "patient_reports")
public class PatientReport {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 20)
    private String date;

    @Column(length = 100)
    private String category;

    @Column(name = "file_type", length = 50)
    private String fileType;

    @Column(name = "file_size", length = 50)
    private String fileSize;

    @Column(name = "file_name", length = 200)
    private String fileName;

    @Column(length = 50)
    private String status;

    @Column(name = "uploaded_by", length = 150)
    private String uploadedBy;

    @Column(name = "raw_content", columnDefinition = "TEXT")
    private String rawContent;

    @Column(name = "ai_summary_json", columnDefinition = "TEXT")
    private String aiSummaryJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public PatientReport() {}

    public PatientReport(String id, String patientId, String title, String date, String category,
                         String fileType, String fileSize, String fileName, String status,
                         String uploadedBy, String rawContent, String aiSummaryJson) {
        this.id = id;
        this.patientId = patientId;
        this.title = title;
        this.date = date;
        this.category = category;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.fileName = fileName;
        this.status = status;
        this.uploadedBy = uploadedBy;
        this.rawContent = rawContent;
        this.aiSummaryJson = aiSummaryJson;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getTitle() { return title; }
    public String getDate() { return date; }
    public String getCategory() { return category; }
    public String getFileType() { return fileType; }
    public String getFileSize() { return fileSize; }
    public String getFileName() { return fileName; }
    public String getStatus() { return status; }
    public String getUploadedBy() { return uploadedBy; }
    public String getRawContent() { return rawContent; }
    public String getAiSummaryJson() { return aiSummaryJson; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setTitle(String title) { this.title = title; }
    public void setDate(String date) { this.date = date; }
    public void setCategory(String category) { this.category = category; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setStatus(String status) { this.status = status; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    public void setRawContent(String rawContent) { this.rawContent = rawContent; }
    public void setAiSummaryJson(String aiSummaryJson) { this.aiSummaryJson = aiSummaryJson; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
