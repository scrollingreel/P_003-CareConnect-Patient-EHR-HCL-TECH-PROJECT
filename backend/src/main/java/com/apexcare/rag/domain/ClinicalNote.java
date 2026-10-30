package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "clinical_notes")
public class ClinicalNote {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(nullable = false, length = 20)
    private String date;

    @Column(name = "doctor_name", length = 100)
    private String doctorName;

    @Column(length = 100)
    private String specialty;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "encounter_type", length = 50)
    private String encounterType = "Outpatient Follow-up";

    @Column(name = "template_type", length = 50)
    private String templateType = "SOAP";

    @Column(columnDefinition = "TEXT")
    private String assessment;

    @Column(name = "treatment_plan", columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(length = 30)
    private String status = "Finalized";

    @Column(name = "is_finalized")
    private Boolean isFinalized = true;

    @Column(name = "finalized_at")
    private Instant finalizedAt = Instant.now();

    @Column(name = "signed_by", length = 150)
    private String signedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public ClinicalNote() {}

    public ClinicalNote(String id, String patientId, String date, String doctorName,
                        String specialty, String summary, String details) {
        this.id = id;
        this.patientId = patientId;
        this.date = date;
        this.doctorName = doctorName;
        this.specialty = specialty;
        this.summary = summary;
        this.details = details;
        this.encounterType = "Outpatient Follow-up";
        this.templateType = "SOAP";
        this.status = "Finalized";
        this.isFinalized = true;
        this.finalizedAt = Instant.now();
        this.signedBy = doctorName;
        this.createdAt = Instant.now();
    }

    public ClinicalNote(String id, String patientId, String date, String doctorName,
                        String specialty, String summary, String details,
                        String encounterType, String templateType, String assessment,
                        String treatmentPlan, String status, Boolean isFinalized, String signedBy) {
        this.id = id;
        this.patientId = patientId;
        this.date = date;
        this.doctorName = doctorName;
        this.specialty = specialty;
        this.summary = summary;
        this.details = details;
        this.encounterType = encounterType;
        this.templateType = templateType;
        this.assessment = assessment;
        this.treatmentPlan = treatmentPlan;
        this.status = status;
        this.isFinalized = isFinalized;
        this.finalizedAt = Boolean.TRUE.equals(isFinalized) ? Instant.now() : null;
        this.signedBy = signedBy;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getDate() { return date; }
    public String getDoctorName() { return doctorName; }
    public String getSpecialty() { return specialty; }
    public String getSummary() { return summary; }
    public String getDetails() { return details; }
    public String getEncounterType() { return encounterType; }
    public String getTemplateType() { return templateType; }
    public String getAssessment() { return assessment; }
    public String getTreatmentPlan() { return treatmentPlan; }
    public String getStatus() { return status; }
    public Boolean getIsFinalized() { return isFinalized; }
    public Instant getFinalizedAt() { return finalizedAt; }
    public String getSignedBy() { return signedBy; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setDate(String date) { this.date = date; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public void setSummary(String summary) { this.summary = summary; }
    public void setDetails(String details) { this.details = details; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }
    public void setTemplateType(String templateType) { this.templateType = templateType; }
    public void setAssessment(String assessment) { this.assessment = assessment; }
    public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }
    public void setStatus(String status) { this.status = status; }
    public void setIsFinalized(Boolean isFinalized) { this.isFinalized = isFinalized; }
    public void setFinalizedAt(Instant finalizedAt) { this.finalizedAt = finalizedAt; }
    public void setSignedBy(String signedBy) { this.signedBy = signedBy; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
