package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "procedure_orders")
public class ProcedureOrder {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(name = "doctor_id", length = 50)
    private String doctorId;

    @Column(name = "procedure_name", nullable = false, length = 200)
    private String procedureName;

    @Column(length = 100)
    private String category;

    @Column(name = "scheduled_date", length = 20)
    private String scheduledDate;

    @Column(length = 20)
    private String priority = "Elective";

    @Column(name = "pre_op_instructions", columnDefinition = "TEXT")
    private String preOpInstructions;

    @Column(length = 30)
    private String status = "Scheduled";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public ProcedureOrder() {}

    public ProcedureOrder(String id, String patientId, String doctorId, String procedureName,
                          String category, String scheduledDate, String priority,
                          String preOpInstructions, String status) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.procedureName = procedureName;
        this.category = category;
        this.scheduledDate = scheduledDate;
        this.priority = priority != null ? priority : "Elective";
        this.preOpInstructions = preOpInstructions;
        this.status = status != null ? status : "Scheduled";
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getDoctorId() { return doctorId; }
    public String getProcedureName() { return procedureName; }
    public String getCategory() { return category; }
    public String getScheduledDate() { return scheduledDate; }
    public String getPriority() { return priority; }
    public String getPreOpInstructions() { return preOpInstructions; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public void setProcedureName(String procedureName) { this.procedureName = procedureName; }
    public void setCategory(String category) { this.category = category; }
    public void setScheduledDate(String scheduledDate) { this.scheduledDate = scheduledDate; }
    public void setPriority(String priority) { this.priority = priority; }
    public void setPreOpInstructions(String preOpInstructions) { this.preOpInstructions = preOpInstructions; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
