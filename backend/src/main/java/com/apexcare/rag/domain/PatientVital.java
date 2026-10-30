package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "patient_vitals")
public class PatientVital {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(nullable = false, length = 20)
    private String date;

    @Column(length = 30)
    private String bp;

    @Column(length = 30)
    private String hr;

    @Column(length = 30)
    private String spo2;

    @Column(length = 30)
    private String temp;

    @Column(length = 30)
    private String weight;

    @Column(length = 30)
    private String bmi;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public PatientVital() {}

    public PatientVital(UUID id, String patientId, String date, String bp, String hr,
                        String spo2, String temp, String weight, String bmi) {
        this.id = id;
        this.patientId = patientId;
        this.date = date;
        this.bp = bp;
        this.hr = hr;
        this.spo2 = spo2;
        this.temp = temp;
        this.weight = weight;
        this.bmi = bmi;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getPatientId() { return patientId; }
    public String getDate() { return date; }
    public String getBp() { return bp; }
    public String getHr() { return hr; }
    public String getSpo2() { return spo2; }
    public String getTemp() { return temp; }
    public String getWeight() { return weight; }
    public String getBmi() { return bmi; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(UUID id) { this.id = id; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setDate(String date) { this.date = date; }
    public void setBp(String bp) { this.bp = bp; }
    public void setHr(String hr) { this.hr = hr; }
    public void setSpo2(String spo2) { this.spo2 = spo2; }
    public void setTemp(String temp) { this.temp = temp; }
    public void setWeight(String weight) { this.weight = weight; }
    public void setBmi(String bmi) { this.bmi = bmi; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
