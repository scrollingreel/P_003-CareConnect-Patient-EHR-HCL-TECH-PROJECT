package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "imaging_results")
public class ImagingResult {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "order_id", length = 50)
    private String orderId;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(nullable = false, length = 50)
    private String modality;

    @Column(name = "study_title", nullable = false, length = 200)
    private String studyTitle;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String findings;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String impression;

    @Column(name = "is_critical", nullable = false)
    private Boolean isCritical = false;

    @Column(name = "critical_alert_sent", nullable = false)
    private Boolean criticalAlertSent = false;

    @Column(name = "radiologist_name", length = 100)
    private String radiologistName;

    @Column(name = "pacs_image_url")
    private String pacsImageUrl;

    @Column(name = "performed_at", length = 30)
    private String performedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public ImagingResult() {}

    public ImagingResult(String id, String orderId, String patientId, String modality,
                         String studyTitle, String findings, String impression,
                         Boolean isCritical, Boolean criticalAlertSent,
                         String radiologistName, String pacsImageUrl, String performedAt) {
        this.id = id;
        this.orderId = orderId;
        this.patientId = patientId;
        this.modality = modality;
        this.studyTitle = studyTitle;
        this.findings = findings;
        this.impression = impression;
        this.isCritical = isCritical != null ? isCritical : false;
        this.criticalAlertSent = criticalAlertSent != null ? criticalAlertSent : false;
        this.radiologistName = radiologistName;
        this.pacsImageUrl = pacsImageUrl;
        this.performedAt = performedAt;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getOrderId() { return orderId; }
    public String getPatientId() { return patientId; }
    public String getModality() { return modality; }
    public String getStudyTitle() { return studyTitle; }
    public String getFindings() { return findings; }
    public String getImpression() { return impression; }
    public Boolean getIsCritical() { return isCritical; }
    public Boolean getCriticalAlertSent() { return criticalAlertSent; }
    public String getRadiologistName() { return radiologistName; }
    public String getPacsImageUrl() { return pacsImageUrl; }
    public String getPerformedAt() { return performedAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setModality(String modality) { this.modality = modality; }
    public void setStudyTitle(String studyTitle) { this.studyTitle = studyTitle; }
    public void setFindings(String findings) { this.findings = findings; }
    public void setImpression(String impression) { this.impression = impression; }
    public void setIsCritical(Boolean isCritical) { this.isCritical = isCritical; }
    public void setCriticalAlertSent(Boolean criticalAlertSent) { this.criticalAlertSent = criticalAlertSent; }
    public void setRadiologistName(String radiologistName) { this.radiologistName = radiologistName; }
    public void setPacsImageUrl(String pacsImageUrl) { this.pacsImageUrl = pacsImageUrl; }
    public void setPerformedAt(String performedAt) { this.performedAt = performedAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
