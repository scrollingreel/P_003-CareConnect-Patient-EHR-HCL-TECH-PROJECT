package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "imaging_orders")
public class ImagingOrder {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(name = "doctor_id", length = 50)
    private String doctorId;

    @Column(nullable = false, length = 50)
    private String modality; // X-Ray, MRI, CT, Ultrasound, Echocardiography

    @Column(name = "body_site", nullable = false, length = 100)
    private String bodySite;

    @Column(nullable = false, length = 20)
    private String priority = "Routine"; // Routine, Urgent, STAT

    @Column(name = "clinical_indication", columnDefinition = "TEXT")
    private String clinicalIndication;

    @Column(name = "order_date", nullable = false, length = 20)
    private String orderDate;

    @Column(nullable = false, length = 30)
    private String status = "Ordered"; // Ordered, In Progress, Completed, Cancelled

    @Column(name = "pacs_accession_number", length = 50)
    private String pacsAccessionNumber;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public ImagingOrder() {}

    public ImagingOrder(String id, String patientId, String doctorId, String modality,
                        String bodySite, String priority, String clinicalIndication,
                        String orderDate, String status, String pacsAccessionNumber) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.modality = modality;
        this.bodySite = bodySite;
        this.priority = priority != null ? priority : "Routine";
        this.clinicalIndication = clinicalIndication;
        this.orderDate = orderDate;
        this.status = status != null ? status : "Ordered";
        this.pacsAccessionNumber = pacsAccessionNumber;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getDoctorId() { return doctorId; }
    public String getModality() { return modality; }
    public String getBodySite() { return bodySite; }
    public String getPriority() { return priority; }
    public String getClinicalIndication() { return clinicalIndication; }
    public String getOrderDate() { return orderDate; }
    public String getStatus() { return status; }
    public String getPacsAccessionNumber() { return pacsAccessionNumber; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public void setModality(String modality) { this.modality = modality; }
    public void setBodySite(String bodySite) { this.bodySite = bodySite; }
    public void setPriority(String priority) { this.priority = priority; }
    public void setClinicalIndication(String clinicalIndication) { this.clinicalIndication = clinicalIndication; }
    public void setOrderDate(String orderDate) { this.orderDate = orderDate; }
    public void setStatus(String status) { this.status = status; }
    public void setPacsAccessionNumber(String pacsAccessionNumber) { this.pacsAccessionNumber = pacsAccessionNumber; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
