package com.apexcare.rag.api.dto;

import java.util.List;
import java.util.Map;

public final class HospitalDtos {
    private HospitalDtos() {}

    public record AppointmentRequest(
        String doctorId,
        String patientId,
        String patientName,
        String date,
        String appointmentDate,
        String time,
        String appointmentTime,
        String type,
        String reason,
        String notes,
        List<Map<String, Object>> attachedReports
    ) {
        public String effectiveDate() {
            return (date != null && !date.isBlank()) ? date : appointmentDate;
        }
        public String effectiveTime() {
            return (time != null && !time.isBlank()) ? time : appointmentTime;
        }
    }

    public record AppointmentCancelRequest(String reason, String cancelReason) {
        public String effectiveReason() {
            return (reason != null && !reason.isBlank()) ? reason : (cancelReason != null ? cancelReason : "Cancelled by patient");
        }
    }

    public record AppointmentRescheduleRequest(String date, String appointmentDate, String time, String appointmentTime) {
        public String effectiveDate() {
            return (date != null && !date.isBlank()) ? date : appointmentDate;
        }
        public String effectiveTime() {
            return (time != null && !time.isBlank()) ? time : appointmentTime;
        }
    }

    public record PrescriptionRequest(
        String patientId,
        String appointmentId,
        String doctorId,
        String doctorName,
        String doctorSpecialty,
        String diagnosis,
        String specialInstructions,
        List<Map<String, Object>> medications
    ) {}

    public record ReportSummaryResponse(
        String modalityBasis,
        String groundingProtocol,
        String executiveSummary,
        List<String> keyFindings,
        String clinicalSignificance,
        String recommendations,
        boolean isPrototype
    ) {}

    public record DoctorPatientSummary(
        String patientId,
        String name,
        Integer age,
        String gender,
        String bloodGroup,
        String phone,
        String lastVisit,
        String nextAppointment,
        String primaryDiagnosis,
        Integer activePrescriptionCount,
        String riskLevel,
        String avatar
    ) {}

    public record SlotResponse(String time, boolean available) {}

    // --- CPOE & Clinical Documentation Requests ---

    public record ClinicalNoteRequest(
        String patientId,
        String doctorName,
        String specialty,
        String encounterType,
        String templateType, // SOAP, CARDIOLOGY_CONSULT, GENERAL_FOLLOWUP, DISCHARGE_SUMMARY
        String summary,
        String details,
        String assessment,
        String treatmentPlan,
        Boolean isFinalized
    ) {}

    public record LabOrderRequest(
        String patientId,
        String doctorId,
        String testCode,
        String testName,
        String priority, // Routine, Urgent, STAT
        String clinicalIndication,
        String specimenSource
    ) {}

    public record LabResultRequest(
        String orderId,
        String patientId,
        String testName,
        String parameterName,
        String resultValue,
        String unit,
        String referenceRange,
        String abnormalFlag,
        Boolean isCritical,
        String verifiedBy,
        String notes
    ) {}

    public record ImagingOrderRequest(
        String patientId,
        String doctorId,
        String modality,
        String bodySite,
        String priority,
        String clinicalIndication
    ) {}

    public record ImagingResultRequest(
        String orderId,
        String patientId,
        String modality,
        String studyTitle,
        String findings,
        String impression,
        Boolean isCritical,
        String radiologistName,
        String pacsImageUrl
    ) {}

    public record ProcedureOrderRequest(
        String patientId,
        String doctorId,
        String procedureName,
        String category,
        String scheduledDate,
        String priority,
        String preOpInstructions
    ) {}

    public record MedicationAdministrationRequest(
        String patientId,
        String prescriptionId,
        String medicationName,
        String dosage,
        String route,
        String scheduledTime,
        String administeredTime,
        String administeredBy,
        String status, // Administered, Missed, Held, Refused
        String notes
    ) {}

    public record SecureMessageRequest(
        String patientId,
        String senderId,
        String senderName,
        String senderRole,
        String recipientId,
        String recipientName,
        String recipientRole,
        String subject,
        String body
    ) {}

    public record PrescriptionSafetyCheckRequest(
        List<String> proposedMedications,
        List<String> currentMedications,
        List<String> allergies
    ) {}
}
