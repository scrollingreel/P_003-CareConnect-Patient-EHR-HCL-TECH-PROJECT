package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "lab_results")
public class LabResult {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "order_id", length = 50)
    private String orderId;

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Column(name = "parameter_name", nullable = false, length = 100)
    private String parameterName;

    @Column(name = "result_value", nullable = false, length = 50)
    private String resultValue;

    @Column(length = 30)
    private String unit;

    @Column(name = "reference_range", length = 50)
    private String referenceRange;

    @Column(name = "abnormal_flag", length = 20)
    private String abnormalFlag; // Normal, High, Low, Critical High, Critical Low

    @Column(name = "is_critical", nullable = false)
    private Boolean isCritical = false;

    @Column(name = "critical_alert_sent", nullable = false)
    private Boolean criticalAlertSent = false;

    @Column(name = "performed_at", length = 30)
    private String performedAt;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public LabResult() {}

    public LabResult(String id, String orderId, String patientId, String testName,
                     String parameterName, String resultValue, String unit,
                     String referenceRange, String abnormalFlag, Boolean isCritical,
                     Boolean criticalAlertSent, String performedAt, String verifiedBy, String notes) {
        this.id = id;
        this.orderId = orderId;
        this.patientId = patientId;
        this.testName = testName;
        this.parameterName = parameterName;
        this.resultValue = resultValue;
        this.unit = unit;
        this.referenceRange = referenceRange;
        this.abnormalFlag = abnormalFlag;
        this.isCritical = isCritical != null ? isCritical : false;
        this.criticalAlertSent = criticalAlertSent != null ? criticalAlertSent : false;
        this.performedAt = performedAt;
        this.verifiedBy = verifiedBy;
        this.notes = notes;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getOrderId() { return orderId; }
    public String getPatientId() { return patientId; }
    public String getTestName() { return testName; }
    public String getParameterName() { return parameterName; }
    public String getResultValue() { return resultValue; }
    public String getUnit() { return unit; }
    public String getReferenceRange() { return referenceRange; }
    public String getAbnormalFlag() { return abnormalFlag; }
    public Boolean getIsCritical() { return isCritical; }
    public Boolean getCriticalAlertSent() { return criticalAlertSent; }
    public String getPerformedAt() { return performedAt; }
    public String getVerifiedBy() { return verifiedBy; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public void setTestName(String testName) { this.testName = testName; }
    public void setParameterName(String parameterName) { this.parameterName = parameterName; }
    public void setResultValue(String resultValue) { this.resultValue = resultValue; }
    public void setUnit(String unit) { this.unit = unit; }
    public void setReferenceRange(String referenceRange) { this.referenceRange = referenceRange; }
    public void setAbnormalFlag(String abnormalFlag) { this.abnormalFlag = abnormalFlag; }
    public void setIsCritical(Boolean isCritical) { this.isCritical = isCritical; }
    public void setCriticalAlertSent(Boolean criticalAlertSent) { this.criticalAlertSent = criticalAlertSent; }
    public void setPerformedAt(String performedAt) { this.performedAt = performedAt; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
