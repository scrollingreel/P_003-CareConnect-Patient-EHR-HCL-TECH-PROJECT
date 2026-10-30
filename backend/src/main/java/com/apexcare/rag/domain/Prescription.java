package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "prescriptions")
public class Prescription {
    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 20)
    private String date;

    @Column(name = "doctor_id", length = 50)
    private String doctorId;

    @Column(name = "doctor_name", length = 100)
    private String doctorName;

    @Column(name = "doctor_specialty", length = 100)
    private String doctorSpecialty;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(name = "appointment_id", length = 50)
    private String appointmentId;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(columnDefinition = "TEXT")
    private String signature;

    @Column(name = "medications_json", columnDefinition = "TEXT")
    private String medicationsJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Prescription() {}

    public Prescription(String id, String date, String doctorId, String doctorName,
                        String doctorSpecialty, String patientId, String appointmentId,
                        String status, String diagnosis, String specialInstructions,
                        String signature, String medicationsJson) {
        this.id = id;
        this.date = date;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.doctorSpecialty = doctorSpecialty;
        this.patientId = patientId;
        this.appointmentId = appointmentId;
        this.status = status;
        this.diagnosis = diagnosis;
        this.specialInstructions = specialInstructions;
        this.signature = signature;
        this.medicationsJson = medicationsJson;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getDate() { return date; }
    public String getDoctorId() { return doctorId; }
    public String getDoctorName() { return doctorName; }
    public String getDoctorSpecialty() { return doctorSpecialty; }
    public String getPatientId() { return patientId; }
    public String getAppointmentId() { return appointmentId; }
    public String getStatus() { return status; }
    public String getDiagnosis() { return diagnosis; }
    public String getSpecialInstructions() { return specialInstructions; }
    public String getSignature() { return signature; }
    public String getMedicationsJson() { return medicationsJson; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setDate(String date) { this.date = date; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setDoctorSpecialty(String doctorSpecialty) { this.doctorSpecialty = doctorSpecialty; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }
    public void setStatus(String status) { this.status = status; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    public void setSignature(String signature) { this.signature = signature; }
    public void setMedicationsJson(String medicationsJson) { this.medicationsJson = medicationsJson; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
