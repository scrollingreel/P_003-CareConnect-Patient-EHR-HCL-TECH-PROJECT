package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "medication_administrations")
public class MedicationAdministration {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(name = "prescription_id", length = 50)
    private String prescriptionId;

    @Column(name = "medication_name", nullable = false, length = 150)
    private String medicationName;

    @Column(nullable = false, length = 50)
    private String dosage;

    @Column(length = 50)
    private String route = "Oral";

    @Column(name = "scheduled_time", nullable = false, length = 30)
    private String scheduledTime;

    @Column(name = "administered_time", length = 30)
    private String administeredTime;

    @Column(name = "administered_by", nullable = false, length = 100)
    private String administeredBy;

    @Column(nullable = false, length = 30)
    private String status = "Administered"; // Administered, Missed, Held, Refused

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public MedicationAdministration() {}

    public MedicationAdministration(String id, String patientId, String prescriptionId,
                                    String medicationName, String dosage, String route,
                                    String scheduledTime, String administeredTime,
                                    String administeredBy, String status, String notes) {
        this.id = id;
        this.patientId = patientId;
        this.prescriptionId = prescriptionId;
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.route = route != null ? route : "Oral";
        this.scheduledTime = scheduledTime;
        this.administeredTime = administeredTime;
        this.administeredBy = administeredBy;
        this.status = status != null ? status : "Administered";
        this.notes = notes;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getPrescriptionId() { return prescriptionId; }
    public String getMedicationName() { return medicationName; }
    public String getDosage() { return dosage; }
    public String getRoute() { return route; }
    public String getScheduledTime() { return scheduledTime; }
    public String getAdministeredTime() { return administeredTime; }
    public String getAdministeredBy() { return administeredBy; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setPrescriptionId(String prescriptionId) { this.prescriptionId = prescriptionId; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public void setRoute(String route) { this.route = route; }
    public void setScheduledTime(String scheduledTime) { this.scheduledTime = scheduledTime; }
    public void setAdministeredTime(String administeredTime) { this.administeredTime = administeredTime; }
    public void setAdministeredBy(String administeredBy) { this.administeredBy = administeredBy; }
    public void setStatus(String status) { this.status = status; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
