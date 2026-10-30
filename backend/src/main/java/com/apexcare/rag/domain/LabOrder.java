package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "lab_orders")
public class LabOrder {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(name = "doctor_id", length = 50)
    private String doctorId;

    @Column(name = "test_code", length = 50)
    private String testCode;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Column(nullable = false, length = 20)
    private String priority = "Routine"; // Routine, Urgent, STAT

    @Column(name = "clinical_indication", columnDefinition = "TEXT")
    private String clinicalIndication;

    @Column(name = "order_date", nullable = false, length = 20)
    private String orderDate;

    @Column(nullable = false, length = 30)
    private String status = "Ordered"; // Ordered, In Progress, Completed, Cancelled

    @Column(name = "specimen_source", length = 100)
    private String specimenSource;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public LabOrder() {}

    public LabOrder(String id, String patientId, String doctorId, String testCode,
                    String testName, String priority, String clinicalIndication,
                    String orderDate, String status, String specimenSource) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.testCode = testCode;
        this.testName = testName;
        this.priority = priority != null ? priority : "Routine";
        this.clinicalIndication = clinicalIndication;
        this.orderDate = orderDate;
        this.status = status != null ? status : "Ordered";
        this.specimenSource = specimenSource;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getDoctorId() { return doctorId; }
    public String getTestCode() { return testCode; }
    public String getTestName() { return testName; }
    public String getPriority() { return priority; }
    public String getClinicalIndication() { return clinicalIndication; }
    public String getOrderDate() { return orderDate; }
    public String getStatus() { return status; }
    public String getSpecimenSource() { return specimenSource; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public void setTestCode(String testCode) { this.testCode = testCode; }
    public void setTestName(String testName) { this.testName = testName; }
    public void setPriority(String priority) { this.priority = priority; }
    public void setClinicalIndication(String clinicalIndication) { this.clinicalIndication = clinicalIndication; }
    public void setOrderDate(String orderDate) { this.orderDate = orderDate; }
    public void setStatus(String status) { this.status = status; }
    public void setSpecimenSource(String specimenSource) { this.specimenSource = specimenSource; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
