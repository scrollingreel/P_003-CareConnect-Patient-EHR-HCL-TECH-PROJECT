package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(name = "patient_name", length = 100)
    private String patientName;

    @Column(name = "doctor_id", nullable = false, length = 50)
    private String doctorId;

    @Column(name = "doctor_name", length = 100)
    private String doctorName;

    @Column(name = "department_name", length = 100)
    private String departmentName;

    @Column(name = "appointment_date", nullable = false, length = 20)
    private String appointmentDate;

    @Column(name = "appointment_time", nullable = false, length = 20)
    private String appointmentTime;

    @Column(length = 50)
    private String type;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 100)
    private String room;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "attached_reports_json", columnDefinition = "TEXT")
    private String attachedReportsJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Appointment() {}

    public Appointment(String id, String patientId, String patientName, String doctorId,
                       String doctorName, String departmentName, String appointmentDate,
                       String appointmentTime, String type, String status, String reason,
                       String notes, String room, String cancelReason, String attachedReportsJson) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.departmentName = departmentName;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.type = type;
        this.status = status;
        this.reason = reason;
        this.notes = notes;
        this.room = room;
        this.cancelReason = cancelReason;
        this.attachedReportsJson = attachedReportsJson;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public String getDoctorId() { return doctorId; }
    public String getDoctorName() { return doctorName; }
    public String getDepartmentName() { return departmentName; }
    public String getAppointmentDate() { return appointmentDate; }
    public String getAppointmentTime() { return appointmentTime; }
    public String getType() { return type; }
    public String getStatus() { return status; }
    public String getReason() { return reason; }
    public String getNotes() { return notes; }
    public String getRoom() { return room; }
    public String getCancelReason() { return cancelReason; }
    public String getAttachedReportsJson() { return attachedReportsJson; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
    public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }
    public void setType(String type) { this.type = type; }
    public void setStatus(String status) { this.status = status; }
    public void setReason(String reason) { this.reason = reason; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setRoom(String room) { this.room = room; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
    public void setAttachedReportsJson(String attachedReportsJson) { this.attachedReportsJson = attachedReportsJson; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getDate() { return appointmentDate; }
    public void setDate(String date) { this.appointmentDate = date; }
    public String getTime() { return appointmentTime; }
    public void setTime(String time) { this.appointmentTime = time; }

    public List<Map<String, Object>> getAttachedReports() {
        if (attachedReportsJson == null || attachedReportsJson.isBlank()) {
            return List.of();
        }
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                attachedReportsJson,
                new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {}
            );
        } catch (Exception e) {
            return List.of();
        }
    }
}
