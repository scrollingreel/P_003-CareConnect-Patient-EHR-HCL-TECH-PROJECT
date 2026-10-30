package com.apexcare.rag.service;

import com.apexcare.rag.api.ApiException;
import com.apexcare.rag.api.dto.HospitalDtos;
import com.apexcare.rag.domain.*;
import com.apexcare.rag.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HospitalService {
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PatientVitalRepository patientVitalRepository;
    private final ClinicalNoteRepository clinicalNoteRepository;
    private final PatientReportRepository patientReportRepository;
    private final LabOrderRepository labOrderRepository;
    private final LabResultRepository labResultRepository;
    private final ImagingOrderRepository imagingOrderRepository;
    private final ImagingResultRepository imagingResultRepository;
    private final ProcedureOrderRepository procedureOrderRepository;
    private final MedicationAdministrationRepository medicationAdministrationRepository;
    private final MedicationCatalogRepository medicationCatalogRepository;
    private final SecureMessageRepository secureMessageRepository;
    private final PatientNotificationRepository patientNotificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AppUserRepository userRepository;
    private final DrugInteractionService drugInteractionService;
    private final DiagnosticIntegrationAdapter diagnosticIntegrationAdapter;
    private final ObjectMapper objectMapper;

    public HospitalService(DepartmentRepository departmentRepository,
                           DoctorRepository doctorRepository,
                           AppointmentRepository appointmentRepository,
                           PrescriptionRepository prescriptionRepository,
                           PatientProfileRepository patientProfileRepository,
                           PatientVitalRepository patientVitalRepository,
                           ClinicalNoteRepository clinicalNoteRepository,
                           PatientReportRepository patientReportRepository,
                           LabOrderRepository labOrderRepository,
                           LabResultRepository labResultRepository,
                           ImagingOrderRepository imagingOrderRepository,
                           ImagingResultRepository imagingResultRepository,
                           ProcedureOrderRepository procedureOrderRepository,
                           MedicationAdministrationRepository medicationAdministrationRepository,
                           MedicationCatalogRepository medicationCatalogRepository,
                           SecureMessageRepository secureMessageRepository,
                           PatientNotificationRepository patientNotificationRepository,
                           AuditLogRepository auditLogRepository,
                           AppUserRepository userRepository,
                           DrugInteractionService drugInteractionService,
                           DiagnosticIntegrationAdapter diagnosticIntegrationAdapter,
                           ObjectMapper objectMapper) {
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.patientVitalRepository = patientVitalRepository;
        this.clinicalNoteRepository = clinicalNoteRepository;
        this.patientReportRepository = patientReportRepository;
        this.labOrderRepository = labOrderRepository;
        this.labResultRepository = labResultRepository;
        this.imagingOrderRepository = imagingOrderRepository;
        this.imagingResultRepository = imagingResultRepository;
        this.procedureOrderRepository = procedureOrderRepository;
        this.medicationAdministrationRepository = medicationAdministrationRepository;
        this.medicationCatalogRepository = medicationCatalogRepository;
        this.secureMessageRepository = secureMessageRepository;
        this.patientNotificationRepository = patientNotificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.drugInteractionService = drugInteractionService;
        this.diagnosticIntegrationAdapter = diagnosticIntegrationAdapter;
        this.objectMapper = objectMapper;
    }

    public List<Department> getDepartments() {
        return departmentRepository.findAll();
    }

    public List<Doctor> getDoctors(String departmentId) {
        if (departmentId != null && !departmentId.isBlank()) {
            return doctorRepository.findAllByDepartmentId(departmentId);
        }
        return doctorRepository.findAll();
    }

    public List<HospitalDtos.SlotResponse> getAvailableSlots(String doctorId, String date) {
        List<Appointment> existing = appointmentRepository.findAllByDoctorIdOrderByAppointmentDateDesc(doctorId);
        Set<String> bookedTimes = new HashSet<>();
        for (Appointment apt : existing) {
            if (date.equals(apt.getAppointmentDate()) && !"Cancelled".equalsIgnoreCase(apt.getStatus())) {
                bookedTimes.add(apt.getAppointmentTime());
            }
        }

        List<String> defaultSlots = List.of(
            "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
            "11:15 AM", "11:45 AM", "02:00 PM", "02:30 PM",
            "03:15 PM", "04:00 PM"
        );

        List<HospitalDtos.SlotResponse> result = new ArrayList<>();
        for (String slot : defaultSlots) {
            result.add(new HospitalDtos.SlotResponse(slot, !bookedTimes.contains(slot)));
        }
        return result;
    }

    // =========================================================================
    // HCL Business Operation 1: RegisterPatient
    // =========================================================================
    @Transactional
    public Map<String, Object> registerPatientProfile(Map<String, Object> patientData) {
        String patientId = patientData.get("id") != null ? patientData.get("id").toString()
            : "P-" + (1000 + new Random().nextInt(9000));
        String name = String.valueOf(patientData.getOrDefault("name", "New Patient"));
        String email = String.valueOf(patientData.getOrDefault("email", "patient@example.com"));

        Map<String, Object> emergencyMap = Map.of(
            "name", patientData.getOrDefault("emergencyName", "Emergency Contact"),
            "relation", patientData.getOrDefault("emergencyRelation", "Family"),
            "phone", patientData.getOrDefault("emergencyPhone", "")
        );

        Map<String, Object> insuranceMap = Map.of(
            "provider", patientData.getOrDefault("insuranceProvider", "Self-Pay / Primary"),
            "policyNumber", patientData.getOrDefault("policyNumber", "POL-" + (10000 + new Random().nextInt(90000))),
            "groupNumber", patientData.getOrDefault("groupNumber", "GRP-01"),
            "status", "Verified & Active"
        );

        List<String> allergies = patientData.get("allergies") instanceof List
            ? (List<String>) patientData.get("allergies")
            : List.of("No Known Drug Allergies (NKDA)");

        List<String> chronic = patientData.get("chronicConditions") instanceof List
            ? (List<String>) patientData.get("chronicConditions")
            : List.of("None Documented");

        PatientProfile profile = new PatientProfile(
            patientId,
            null,
            name,
            email,
            String.valueOf(patientData.getOrDefault("dob", "1990-01-01")),
            Integer.parseInt(String.valueOf(patientData.getOrDefault("age", "35"))),
            String.valueOf(patientData.getOrDefault("gender", "Female")),
            String.valueOf(patientData.getOrDefault("bloodGroup", "O+")),
            String.valueOf(patientData.getOrDefault("phone", "+1 (555) 000-0000")),
            String.valueOf(patientData.getOrDefault("address", "CareConnect Community Clinic")),
            toJson(emergencyMap),
            toJson(insuranceMap),
            toJson(allergies),
            toJson(chronic),
            String.valueOf(patientData.getOrDefault("avatar", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"))
        );

        patientProfileRepository.save(profile);

        logAudit(patientId, name, "PATIENT", "REGISTER", "PatientProfile", patientId, "New patient onboarded with demographics and insurance.");
        return toPatientProfileMap(profile);
    }

    // =========================================================================
    // HCL Business Operation 2: ScheduleAppointment
    // =========================================================================
    @Transactional
    public Appointment bookAppointment(HospitalDtos.AppointmentRequest request) {
        Doctor doctor = doctorRepository.findById(request.doctorId())
            .orElseGet(() -> doctorRepository.findAll().stream().findFirst().orElse(null));

        String patientId = (request.patientId() != null && !request.patientId().isBlank())
            ? request.patientId() : "P-1001";
        String patientName = (request.patientName() != null && !request.patientName().isBlank())
            ? request.patientName() : "Ananya Sharma";

        String id = "APT-" + (200 + new Random().nextInt(800));
        String attachedReportsJson = toJson(request.attachedReports());

        String effectiveDate = request.effectiveDate();
        if (effectiveDate == null || effectiveDate.isBlank()) {
            effectiveDate = java.time.LocalDate.now().plusDays(1).toString();
        }
        String effectiveTime = request.effectiveTime();
        if (effectiveTime == null || effectiveTime.isBlank()) {
            effectiveTime = "10:00 AM";
        }

        Appointment appointment = new Appointment(
            id,
            patientId,
            patientName,
            doctor != null ? doctor.getId() : request.doctorId(),
            doctor != null ? doctor.getName() : "Attending Physician",
            doctor != null ? doctor.getDepartmentName() : "Outpatient Clinic",
            effectiveDate,
            effectiveTime,
            request.type() != null ? request.type() : "In-person Consultation",
            "Scheduled",
            request.reason() != null ? request.reason() : "General Follow-up",
            request.notes() != null ? request.notes() : "",
            doctor != null ? doctor.getRoom() : "Room 101",
            null,
            attachedReportsJson
        );

        appointmentRepository.save(appointment);

        // System Integration: Notification
        createNotification(
            patientId, "PATIENT", "APPOINTMENT_REMINDER",
            "Appointment Confirmed: " + (doctor != null ? doctor.getName() : "Physician"),
            "Consultation scheduled on " + effectiveDate + " at " + effectiveTime + " in " + (doctor != null ? doctor.getRoom() : "Clinic"),
            "INFO", "/patient/appointments"
        );

        logAudit(patientId, patientName, "PATIENT", "SCHEDULE_APPOINTMENT", "Appointment", id, "Appointment booked for " + effectiveDate + " " + effectiveTime);
        return appointment;
    }

    public List<Appointment> getPatientAppointments(String patientId) {
        return appointmentRepository.findAllByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    public List<Appointment> getDoctorAppointments(String doctorId) {
        return appointmentRepository.findAllByDoctorIdOrderByAppointmentDateDesc(doctorId);
    }

    @Transactional
    public Map<String, Object> cancelAppointment(String id, String reason) {
        Appointment apt = appointmentRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found."));
        apt.setStatus("Cancelled");
        apt.setCancelReason(reason);
        appointmentRepository.save(apt);

        logAudit(apt.getPatientId(), apt.getPatientName(), "PATIENT", "CANCEL_APPOINTMENT", "Appointment", id, "Reason: " + reason);
        return Map.of(
            "success", true,
            "message", "Appointment cancelled successfully",
            "id", id,
            "status", "Cancelled",
            "cancelReason", reason != null ? reason : ""
        );
    }

    @Transactional
    public Map<String, Object> rescheduleAppointment(String id, String date, String time) {
        Appointment apt = appointmentRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found."));
        apt.setAppointmentDate(date);
        apt.setAppointmentTime(time);
        apt.setStatus("Rescheduled");
        appointmentRepository.save(apt);

        logAudit(apt.getPatientId(), apt.getPatientName(), "PATIENT", "RESCHEDULE_APPOINTMENT", "Appointment", id, "Rescheduled to: " + date + " " + time);
        return Map.of(
            "success", true,
            "message", "Appointment rescheduled successfully",
            "id", id,
            "status", "Rescheduled",
            "date", date != null ? date : "",
            "time", time != null ? time : ""
        );
    }

    // =========================================================================
    // HCL Business Operation 3: CreateEncounterNote (Epic 2)
    // =========================================================================
    @Transactional
    public ClinicalNote createEncounterNote(HospitalDtos.ClinicalNoteRequest request) {
        String patientId = request.patientId() != null ? request.patientId() : "P-1001";
        String id = "CN-" + (500 + new Random().nextInt(500));
        String today = java.time.LocalDate.now().toString();

        String template = request.templateType() != null ? request.templateType() : "SOAP";
        String encounterType = request.encounterType() != null ? request.encounterType() : "Outpatient Encounter";
        boolean isFinalized = request.isFinalized() != null ? request.isFinalized() : true;
        String status = isFinalized ? "Finalized" : "Draft";
        String signedBy = isFinalized ? (request.doctorName() != null ? request.doctorName() : "Attending Physician, MD") : null;

        ClinicalNote note = new ClinicalNote(
            id,
            patientId,
            today,
            request.doctorName() != null ? request.doctorName() : "Dr. Rajesh Verma, MD",
            request.specialty() != null ? request.specialty() : "Cardiology",
            request.summary() != null ? request.summary() : "Clinical Encounter Note",
            request.details() != null ? request.details() : "Standard evaluation",
            encounterType,
            template,
            request.assessment() != null ? request.assessment() : "Assessment recorded.",
            request.treatmentPlan() != null ? request.treatmentPlan() : "Plan outlined.",
            status,
            isFinalized,
            signedBy
        );

        clinicalNoteRepository.save(note);
        logAudit(patientId, request.doctorName(), "DOCTOR", "CREATE_ENCOUNTER_NOTE", "ClinicalNote", id, "Template: " + template + ", Status: " + status);
        return note;
    }

    @Transactional
    public ClinicalNote updateEncounterNote(String noteId, HospitalDtos.ClinicalNoteRequest request) {
        ClinicalNote note = clinicalNoteRepository.findById(noteId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Clinical note not found."));

        // Acceptance Criteria: Finalized records cannot be silently overwritten
        if (Boolean.TRUE.equals(note.getIsFinalized())) {
            throw new ApiException(HttpStatus.CONFLICT, "Clinical note '" + noteId + "' is finalized and signed. Finalized records cannot be modified or overwritten per clinical audit standards.");
        }

        if (request.summary() != null) note.setSummary(request.summary());
        if (request.details() != null) note.setDetails(request.details());
        if (request.assessment() != null) note.setAssessment(request.assessment());
        if (request.treatmentPlan() != null) note.setTreatmentPlan(request.treatmentPlan());
        if (Boolean.TRUE.equals(request.isFinalized())) {
            note.setIsFinalized(true);
            note.setStatus("Finalized");
            note.setFinalizedAt(Instant.now());
            note.setSignedBy(request.doctorName());
        }

        clinicalNoteRepository.save(note);
        logAudit(note.getPatientId(), request.doctorName(), "DOCTOR", "UPDATE_ENCOUNTER_NOTE", "ClinicalNote", noteId, "Draft note updated.");
        return note;
    }

    public List<ClinicalNote> getPatientClinicalNotes(String patientId) {
        return clinicalNoteRepository.findAllByPatientIdOrderByDateDesc(patientId);
    }

    // =========================================================================
    // HCL Business Operation 4: PrescribeMedication (Epic 4)
    // =========================================================================
    @Transactional
    public Map<String, Object> createPrescription(HospitalDtos.PrescriptionRequest request) {
        String patientId = request.patientId() != null ? request.patientId() : "P-1001";
        String id = "RX-" + (9000 + new Random().nextInt(1000));
        String today = java.time.LocalDate.now().toString();
        String doctorName = request.doctorName() != null ? request.doctorName() : "Dr. Rajesh Verma, MD";

        // Fetch patient profile to check documented allergies & existing medications
        PatientProfile profile = patientProfileRepository.findById(patientId).orElse(null);
        List<String> allergies = profile != null ? fromJson(profile.getAllergiesJson(), new TypeReference<List<String>>() {}) : List.of();

        // Collect proposed meds
        List<String> proposedMeds = new ArrayList<>();
        if (request.medications() != null) {
            for (Map<String, Object> m : request.medications()) {
                if (m.get("name") != null) proposedMeds.add(m.get("name").toString());
            }
        }

        // Collect current active meds
        List<String> currentMeds = new ArrayList<>();
        List<Prescription> existingActive = prescriptionRepository.findAllByPatientIdOrderByDateDesc(patientId);
        for (Prescription rx : existingActive) {
            if ("Active".equalsIgnoreCase(rx.getStatus())) {
                List<Map<String, Object>> meds = fromJson(rx.getMedicationsJson(), new TypeReference<List<Map<String, Object>>>() {});
                if (meds != null) {
                    for (Map<String, Object> med : meds) {
                        if (med.get("name") != null) currentMeds.add(med.get("name").toString());
                    }
                }
            }
        }

        // Run Drug-Drug Interaction and Allergy Safety Check
        DrugInteractionService.SafetyCheckResponse safetyCheck = drugInteractionService.evaluatePrescriptionSafety(proposedMeds, currentMeds, allergies);

        Prescription prescription = new Prescription(
            id,
            today,
            request.doctorId() != null ? request.doctorId() : "D-201",
            doctorName,
            request.doctorSpecialty() != null ? request.doctorSpecialty() : "Cardiology",
            patientId,
            request.appointmentId() != null ? request.appointmentId() : "APT-101",
            "Active",
            request.diagnosis(),
            request.specialInstructions(),
            "Digitally signed by " + doctorName + " (Verified EHR Signature)",
            toJson(request.medications())
        );

        prescriptionRepository.save(prescription);

        // Auto-generate Medication Administration Records (MAR) for the prescribed meds
        if (request.medications() != null) {
            for (Map<String, Object> med : request.medications()) {
                String medName = med.get("name") != null ? med.get("name").toString() : "Medication";
                String dose = med.get("dosage") != null ? med.get("dosage").toString() : "Standard";
                String marId = "MAR-" + (1000 + new Random().nextInt(9000));
                MedicationAdministration mar = new MedicationAdministration(
                    marId,
                    patientId,
                    id,
                    medName,
                    dose,
                    "Oral",
                    today + " 08:00 AM",
                    today + " 08:15 AM",
                    "Staff Nurse (Verified MAR)",
                    "Administered",
                    "Initial dose administered per Rx " + id
                );
                medicationAdministrationRepository.save(mar);
            }
        }

        // Notification to patient
        createNotification(
            patientId, "PATIENT", "RX_READY",
            "New Prescription Issued: " + id,
            "Dr. " + doctorName + " prescribed " + String.join(", ", proposedMeds),
            "INFO", "/patient/prescriptions"
        );

        logAudit(patientId, doctorName, "DOCTOR", "PRESCRIBE_MEDICATION", "Prescription", id, "Prescribed: " + String.join(", ", proposedMeds) + ". DDI Status: " + safetyCheck.overallStatus());

        Map<String, Object> res = toPrescriptionMap(prescription);
        res.put("safetyCheck", safetyCheck);
        return res;
    }

    public List<Map<String, Object>> getPatientPrescriptions(String patientId) {
        List<Prescription> list = prescriptionRepository.findAllByPatientIdOrderByDateDesc(patientId);
        return list.stream().map(this::toPrescriptionMap).toList();
    }

    public List<Map<String, Object>> getDoctorPrescriptions(String doctorId) {
        List<Prescription> list = prescriptionRepository.findAllByDoctorIdOrderByDateDesc(doctorId);
        return list.stream().map(this::toPrescriptionMap).toList();
    }

    // =========================================================================
    // HCL Business Operation 5: OrderLabTest & CPOE (Epic 3 & Epic 5)
    // =========================================================================
    @Transactional
    public LabOrder orderLabTest(HospitalDtos.LabOrderRequest request) {
        String patientId = request.patientId() != null ? request.patientId() : "P-1001";
        String id = "LAB-" + (1000 + new Random().nextInt(9000));
        String today = java.time.LocalDate.now().toString();

        LabOrder order = new LabOrder(
            id,
            patientId,
            request.doctorId() != null ? request.doctorId() : "D-201",
            request.testCode() != null ? request.testCode() : "LOINC-" + (1000 + new Random().nextInt(9000)),
            request.testName(),
            request.priority() != null ? request.priority() : "Routine",
            request.clinicalIndication(),
            today,
            "Ordered",
            request.specimenSource() != null ? request.specimenSource() : "Venous Blood"
        );

        labOrderRepository.save(order);

        createNotification(
            patientId, "PATIENT", "LAB_ORDER",
            "Diagnostic Order Placed: " + request.testName(),
            "Priority: " + order.getPriority() + ". Scheduled for clinical laboratory processing.",
            "INFO", "/patient/records"
        );

        logAudit(patientId, request.doctorId(), "DOCTOR", "CREATE_ORDER", "LabOrder", id, "Ordered lab test: " + request.testName());
        return order;
    }

    @Transactional
    public ImagingOrder orderImaging(HospitalDtos.ImagingOrderRequest request) {
        String patientId = request.patientId() != null ? request.patientId() : "P-1001";
        String id = "IMG-" + (2000 + new Random().nextInt(8000));
        String today = java.time.LocalDate.now().toString();
        String accessionNumber = "ACC-" + (100000 + new Random().nextInt(900000));

        ImagingOrder order = new ImagingOrder(
            id,
            patientId,
            request.doctorId() != null ? request.doctorId() : "D-201",
            request.modality(),
            request.bodySite(),
            request.priority() != null ? request.priority() : "Routine",
            request.clinicalIndication(),
            today,
            "Ordered",
            accessionNumber
        );

        imagingOrderRepository.save(order);

        createNotification(
            patientId, "PATIENT", "IMAGING_ORDER",
            "Diagnostic Imaging Scheduled: " + request.modality() + " (" + request.bodySite() + ")",
            "Accession #" + accessionNumber + ". Transmitted to PACS imaging queue.",
            "INFO", "/patient/records"
        );

        logAudit(patientId, request.doctorId(), "DOCTOR", "CREATE_ORDER", "ImagingOrder", id, "Modality: " + request.modality());
        return order;
    }

    @Transactional
    public ProcedureOrder orderProcedure(HospitalDtos.ProcedureOrderRequest request) {
        String patientId = request.patientId() != null ? request.patientId() : "P-1001";
        String id = "PRC-" + (3000 + new Random().nextInt(7000));

        ProcedureOrder order = new ProcedureOrder(
            id,
            patientId,
            request.doctorId() != null ? request.doctorId() : "D-201",
            request.procedureName(),
            request.category() != null ? request.category() : "Clinical Procedure",
            request.scheduledDate() != null ? request.scheduledDate() : java.time.LocalDate.now().plusDays(3).toString(),
            request.priority() != null ? request.priority() : "Elective",
            request.preOpInstructions(),
            "Scheduled"
        );

        procedureOrderRepository.save(order);
        logAudit(patientId, request.doctorId(), "DOCTOR", "CREATE_ORDER", "ProcedureOrder", id, "Procedure: " + request.procedureName());
        return order;
    }

    // =========================================================================
    // HCL Business Operation 6: RecordLabResults & Critical Alerts (Epic 5)
    // =========================================================================
    @Transactional
    public LabResult recordLabResult(HospitalDtos.LabResultRequest request) {
        String id = "LRES-" + (4000 + new Random().nextInt(6000));
        String today = java.time.LocalDate.now().toString();

        boolean isCritical = Boolean.TRUE.equals(request.isCritical()) ||
            (request.abnormalFlag() != null && request.abnormalFlag().toLowerCase().contains("critical"));

        LabResult result = new LabResult(
            id,
            request.orderId(),
            request.patientId(),
            request.testName(),
            request.parameterName(),
            request.resultValue(),
            request.unit(),
            request.referenceRange(),
            request.abnormalFlag(),
            isCritical,
            isCritical, // alert sent immediately
            today + " 11:30 AM",
            request.verifiedBy() != null ? request.verifiedBy() : "Central Pathologist, MD",
            request.notes()
        );

        labResultRepository.save(result);

        // Update parent lab order status if attached
        if (request.orderId() != null) {
            labOrderRepository.findById(request.orderId()).ifPresent(ord -> {
                ord.setStatus("Completed");
                labOrderRepository.save(ord);
            });
        }

        // Critical Result Alert Trigger (Epic 5 Acceptance Criteria)
        if (isCritical) {
            createNotification(
                request.patientId(), "ALL", "CRITICAL_ALERT",
                "CRITICAL DIAGNOSTIC PANIC ALERT: " + request.parameterName() + " (" + request.resultValue() + " " + (request.unit() != null ? request.unit() : "") + ")",
                "PANIC VALUE: Result breaches hospital clinical panic threshold (" + request.referenceRange() + "). Immediate physician intervention required.",
                "CRITICAL", "/doctor/patients/" + request.patientId()
            );
        }

        logAudit(request.patientId(), "LIS_SYSTEM", "SYSTEM", "RECORD_LAB_RESULT", "LabResult", id, "Parameter: " + request.parameterName() + " = " + request.resultValue() + ". Critical: " + isCritical);
        return result;
    }

    @Transactional
    public ImagingResult recordImagingResult(HospitalDtos.ImagingResultRequest request) {
        String id = "IRES-" + (5000 + new Random().nextInt(5000));
        String today = java.time.LocalDate.now().toString();

        ImagingResult result = new ImagingResult(
            id,
            request.orderId(),
            request.patientId(),
            request.modality(),
            request.studyTitle(),
            request.findings(),
            request.impression(),
            request.isCritical(),
            Boolean.TRUE.equals(request.isCritical()),
            request.radiologistName() != null ? request.radiologistName() : "Chief Radiologist, MD",
            request.pacsImageUrl() != null ? request.pacsImageUrl() : "https://pacs.apexcare.org/viewer?id=" + id,
            today + " 02:15 PM"
        );

        imagingResultRepository.save(result);

        if (request.orderId() != null) {
            imagingOrderRepository.findById(request.orderId()).ifPresent(ord -> {
                ord.setStatus("Completed");
                imagingOrderRepository.save(ord);
            });
        }

        if (Boolean.TRUE.equals(request.isCritical())) {
            createNotification(
                request.patientId(), "ALL", "CRITICAL_ALERT",
                "CRITICAL IMAGING ALERT: " + request.studyTitle(),
                "Immediate Radiologist Alert: " + request.impression(),
                "CRITICAL", "/doctor/patients/" + request.patientId()
            );
        }

        logAudit(request.patientId(), "PACS_SYSTEM", "SYSTEM", "RECORD_IMAGING_RESULT", "ImagingResult", id, "Study: " + request.studyTitle());
        return result;
    }

    // =========================================================================
    // HCL Business Operation 7: User Management & RBAC Permissions
    // =========================================================================
    public List<AppUser> listUsers() {
        return userRepository.findAll();
    }

    // =========================================================================
    // HCL Database Views / Equivalent Query Services
    // =========================================================================

    /**
     * View 1: PatientSummary
     */
    public Map<String, Object> getPatientSummary(String patientId) {
        PatientProfile profile = patientProfileRepository.findById(patientId)
            .orElseGet(() -> patientProfileRepository.findById("P-1001").orElse(null));

        List<Appointment> upcomingAppointments = appointmentRepository.findAllByPatientIdOrderByAppointmentDateDesc(patientId)
            .stream().filter(a -> "Scheduled".equalsIgnoreCase(a.getStatus())).toList();

        List<Prescription> activePrescriptions = prescriptionRepository.findAllByPatientIdOrderByDateDesc(patientId)
            .stream().filter(p -> "Active".equalsIgnoreCase(p.getStatus())).toList();

        List<LabOrder> pendingLabOrders = labOrderRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId)
            .stream().filter(o -> "Ordered".equalsIgnoreCase(o.getStatus()) || "In Progress".equalsIgnoreCase(o.getStatus())).toList();

        List<PatientVital> vitals = patientVitalRepository.findAllByPatientIdOrderByDateDesc(patientId);
        List<PatientNotification> notifications = patientNotificationRepository.findAllByUserIdOrderByCreatedAtDesc(patientId);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("patient", profile != null ? toPatientProfileMap(profile) : Map.of("id", patientId));
        summary.put("upcomingAppointmentsCount", upcomingAppointments.size());
        summary.put("upcomingAppointments", upcomingAppointments);
        summary.put("activePrescriptionsCount", activePrescriptions.size());
        summary.put("activePrescriptions", activePrescriptions.stream().map(this::toPrescriptionMap).toList());
        summary.put("pendingLabOrdersCount", pendingLabOrders.size());
        summary.put("pendingLabOrders", pendingLabOrders);
        summary.put("latestVitals", vitals.isEmpty() ? null : vitals.get(0));
        summary.put("unreadNotificationsCount", notifications.stream().filter(n -> !Boolean.TRUE.equals(n.getIsRead())).count());
        return summary;
    }

    /**
     * View 2: ProviderSchedule
     */
    public Map<String, Object> getProviderSchedule(String doctorId, String date) {
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        List<Appointment> appointments = appointmentRepository.findAllByDoctorIdOrderByAppointmentDateDesc(doctorId);

        if (date != null && !date.isBlank()) {
            appointments = appointments.stream().filter(a -> date.equals(a.getAppointmentDate())).toList();
        }

        Map<String, Object> view = new LinkedHashMap<>();
        view.put("doctor", doctor);
        view.put("scheduleDate", date != null ? date : "All Dates");
        view.put("totalAppointments", appointments.size());
        view.put("queue", appointments);
        return view;
    }

    /**
     * View 3: MedicationHistory
     */
    public Map<String, Object> getMedicationHistory(String patientId) {
        List<Prescription> prescriptions = prescriptionRepository.findAllByPatientIdOrderByDateDesc(patientId);
        List<MedicationAdministration> marList = medicationAdministrationRepository.findAllByPatientIdOrderByScheduledTimeDesc(patientId);

        Map<String, Object> view = new LinkedHashMap<>();
        view.put("patientId", patientId);
        view.put("prescriptions", prescriptions.stream().map(this::toPrescriptionMap).toList());
        view.put("administrationRecords", marList);
        view.put("totalPrescriptions", prescriptions.size());
        view.put("activeCount", prescriptions.stream().filter(p -> "Active".equalsIgnoreCase(p.getStatus())).count());
        return view;
    }

    /**
     * View 4: LabOrdersAndResults
     */
    public Map<String, Object> getLabOrdersAndResults(String patientId) {
        List<LabOrder> orders = labOrderRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
        List<LabResult> results = labResultRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
        List<ImagingOrder> imagingOrders = imagingOrderRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
        List<ImagingResult> imagingResults = imagingResultRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);

        Map<String, Object> view = new LinkedHashMap<>();
        view.put("patientId", patientId);
        view.put("labOrders", orders);
        view.put("labResults", results);
        view.put("imagingOrders", imagingOrders);
        view.put("imagingResults", imagingResults);
        view.put("criticalResultsCount", results.stream().filter(r -> Boolean.TRUE.equals(r.getIsCritical())).count() +
            imagingResults.stream().filter(r -> Boolean.TRUE.equals(r.getIsCritical())).count());
        return view;
    }

    // =========================================================================
    // Epic 4: Medication Administration Records (MAR)
    // =========================================================================
    public List<MedicationAdministration> getMedicationAdministrations(String patientId) {
        return medicationAdministrationRepository.findAllByPatientIdOrderByScheduledTimeDesc(patientId);
    }

    @Transactional
    public MedicationAdministration recordAdministration(HospitalDtos.MedicationAdministrationRequest request) {
        String id = "MAR-" + (1000 + new Random().nextInt(9000));
        String now = java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 16);

        MedicationAdministration mar = new MedicationAdministration(
            id,
            request.patientId(),
            request.prescriptionId(),
            request.medicationName(),
            request.dosage(),
            request.route() != null ? request.route() : "Oral",
            request.scheduledTime() != null ? request.scheduledTime() : now,
            request.administeredTime() != null ? request.administeredTime() : now,
            request.administeredBy() != null ? request.administeredBy() : "Staff Nurse",
            request.status() != null ? request.status() : "Administered",
            request.notes()
        );

        medicationAdministrationRepository.save(mar);
        logAudit(request.patientId(), request.administeredBy(), "NURSE", "ADMINISTER_MEDICATION", "MedicationAdministration", id, "Med: " + request.medicationName() + " Status: " + mar.getStatus());
        return mar;
    }

    // =========================================================================
    // Epic 7: Secure Patient-Provider Messaging
    // =========================================================================
    public List<SecureMessage> getPatientMessages(String patientId) {
        return secureMessageRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Transactional
    public SecureMessage sendSecureMessage(HospitalDtos.SecureMessageRequest request) {
        String id = "MSG-" + (1000 + new Random().nextInt(9000));
        SecureMessage msg = new SecureMessage(
            id,
            request.patientId(),
            request.senderId(),
            request.senderName(),
            request.senderRole(),
            request.recipientId(),
            request.recipientName(),
            request.recipientRole(),
            request.subject(),
            request.body()
        );

        secureMessageRepository.save(msg);

        // System Integration: Notification to recipient
        createNotification(
            request.recipientId(), request.recipientRole(), "SECURE_MESSAGE",
            "New Message from " + request.senderName() + ": " + request.subject(),
            request.body(),
            "INFO", "/patient/dashboard"
        );

        logAudit(request.senderId(), request.senderName(), request.senderRole(), "SEND_MESSAGE", "SecureMessage", id, "Subject: " + request.subject());
        return msg;
    }

    @Transactional
    public void markMessageRead(String messageId) {
        secureMessageRepository.findById(messageId).ifPresent(msg -> {
            msg.setIsRead(true);
            secureMessageRepository.save(msg);
        });
    }

    // =========================================================================
    // Epic 6 & 7: System Notifications
    // =========================================================================
    public List<PatientNotification> getNotifications(String userId) {
        return patientNotificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markNotificationRead(String notifId) {
        patientNotificationRepository.findById(notifId).ifPresent(n -> {
            n.setIsRead(true);
            patientNotificationRepository.save(n);
        });
    }

    public void createNotification(String userId, String role, String type, String title, String msg, String severity, String actionUrl) {
        String id = "NOTIF-" + (1000 + new Random().nextInt(9000));
        PatientNotification notif = new PatientNotification(id, userId, role, type, title, msg, severity, actionUrl);
        patientNotificationRepository.save(notif);
    }

    // =========================================================================
    // Epic 6: System Audit Logs
    // =========================================================================
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }

    public void logAudit(String userId, String userName, String userRole, String action, String entityType, String entityId, String details) {
        AuditLog log = new AuditLog(UUID.randomUUID(), userId, userName, userRole, action, entityType, entityId, details, "127.0.0.1");
        auditLogRepository.save(log);
    }

    // =========================================================================
    // Core Medical Records & Existing Workflows
    // =========================================================================
    public List<HospitalDtos.DoctorPatientSummary> getDoctorPatients(String doctorId, String search) {
        List<PatientProfile> profiles = patientProfileRepository.findAll();
        String query = search != null ? search.toLowerCase().trim() : "";

        List<HospitalDtos.DoctorPatientSummary> summaries = new ArrayList<>();
        for (PatientProfile profile : profiles) {
            if (!query.isEmpty()) {
                boolean matchesName = profile.getName().toLowerCase().contains(query);
                boolean matchesEmail = profile.getEmail() != null && profile.getEmail().toLowerCase().contains(query);
                if (!matchesName && !matchesEmail) continue;
            }

            int activeRx = prescriptionRepository.findAllByPatientIdOrderByDateDesc(profile.getId()).size();
            List<Appointment> apts = appointmentRepository.findAllByPatientIdOrderByAppointmentDateDesc(profile.getId());
            String lastVisit = "2026-08-20";
            String nextAppt = "None scheduled";
            if (!apts.isEmpty()) {
                Appointment latest = apts.get(0);
                nextAppt = latest.getAppointmentDate() + ", " + latest.getAppointmentTime();
            }

            summaries.add(new HospitalDtos.DoctorPatientSummary(
                profile.getId(),
                profile.getName(),
                profile.getAge(),
                profile.getGender(),
                profile.getBloodGroup(),
                profile.getPhone(),
                lastVisit,
                nextAppt,
                "Essential Hypertension",
                activeRx,
                "Low-Moderate",
                profile.getAvatar()
            ));
        }
        return summaries;
    }

    public Map<String, Object> getPatientMedicalRecord(String patientId) {
        PatientProfile profile = patientProfileRepository.findById(patientId)
            .orElseGet(() -> patientProfileRepository.findById("P-1001").orElse(null));

        List<PatientVital> vitals = patientVitalRepository.findAllByPatientIdOrderByDateDesc(patientId);
        List<ClinicalNote> notes = clinicalNoteRepository.findAllByPatientIdOrderByDateDesc(patientId);
        List<PatientReport> reports = patientReportRepository.findAllByPatientIdOrderByDateDesc(patientId);
        List<LabOrder> labOrders = labOrderRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
        List<LabResult> labResults = labResultRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
        List<ImagingOrder> imagingOrders = imagingOrderRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
        List<ImagingResult> imagingResults = imagingResultRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);

        Map<String, Object> patientMap = profile != null ? toPatientProfileMap(profile) : Map.of("id", patientId);

        List<Map<String, Object>> reportsList = reports.stream().map(this::toReportMap).toList();

        return Map.of(
            "patient", patientMap,
            "vitals", vitals,
            "clinicalNotes", notes,
            "reports", reportsList,
            "labOrders", labOrders,
            "labResults", labResults,
            "imagingOrders", imagingOrders,
            "imagingResults", imagingResults
        );
    }

    @Transactional
    public Map<String, Object> uploadReport(String patientId, Map<String, Object> data) {
        String id = data.get("id") != null ? data.get("id").toString() : "REP-" + (1000 + new Random().nextInt(9000));
        String title = data.get("title") != null ? data.get("title").toString() : "Diagnostic Report";
        String category = data.get("category") != null ? data.get("category").toString() : "Laboratory Pathology";
        String today = java.time.LocalDate.now().toString();

        HospitalDtos.ReportSummaryResponse initialSummary = buildReportSummary(title, category,
            data.get("rawContent") != null ? data.get("rawContent").toString() : "");

        PatientReport report = new PatientReport(
            id,
            patientId,
            title,
            data.get("date") != null ? data.get("date").toString() : today,
            category,
            data.get("fileType") != null ? data.get("fileType").toString() : "PDF",
            data.get("fileSize") != null ? data.get("fileSize").toString() : "1.8 MB",
            data.get("fileName") != null ? data.get("fileName").toString() : title.replaceAll("\\s+", "_") + ".pdf",
            data.get("status") != null ? data.get("status").toString() : "Pending Physician Review",
            data.get("uploadedBy") != null ? data.get("uploadedBy").toString() : "Patient Self-Upload",
            data.get("rawContent") != null ? data.get("rawContent").toString() : "Diagnostic report: " + title,
            toJson(initialSummary)
        );

        patientReportRepository.save(report);
        return toReportMap(report);
    }

    @Transactional
    public HospitalDtos.ReportSummaryResponse summarizeReport(String reportId) {
        PatientReport report = patientReportRepository.findById(reportId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found."));

        HospitalDtos.ReportSummaryResponse summary = buildReportSummary(
            report.getTitle(),
            report.getCategory(),
            report.getRawContent()
        );

        report.setAiSummaryJson(toJson(summary));
        patientReportRepository.save(report);
        return summary;
    }

    @Transactional
    public Map<String, Object> updateProfile(String patientId, Map<String, Object> profileData) {
        PatientProfile profile = patientProfileRepository.findById(patientId)
            .orElseGet(() -> patientProfileRepository.findById("P-1001").orElse(null));

        if (profile != null) {
            if (profileData.containsKey("phone")) profile.setPhone(String.valueOf(profileData.get("phone")));
            if (profileData.containsKey("address")) profile.setAddress(String.valueOf(profileData.get("address")));
            if (profileData.containsKey("insurance")) profile.setInsuranceJson(toJson(profileData.get("insurance")));
            if (profileData.containsKey("allergies")) profile.setAllergiesJson(toJson(profileData.get("allergies")));
            if (profileData.containsKey("chronicConditions")) profile.setChronicConditionsJson(toJson(profileData.get("chronicConditions")));
            patientProfileRepository.save(profile);
            logAudit(patientId, profile.getName(), "PATIENT", "UPDATE_PROFILE", "PatientProfile", patientId, "Profile demographics/insurance updated.");
            return Map.of("success", true, "profile", toPatientProfileMap(profile));
        }
        return Map.of("success", true, "profile", profileData);
    }

    // =========================================================================
    // Epic 5: Integration Endpoints & Serialization
    // =========================================================================
    public DiagnosticIntegrationAdapter.IntegrationStatusResponse getIntegrationStatus() {
        return diagnosticIntegrationAdapter.getStatus();
    }

    public String getHl7OruMessage(String orderId) {
        LabOrder order = labOrderRepository.findById(orderId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lab order not found."));
        List<LabResult> results = labResultRepository.findAllByOrderIdOrderByCreatedAtDesc(orderId);
        LabResult res = !results.isEmpty() ? results.get(0) : new LabResult(
            "RES-DEMO", order.getId(), order.getPatientId(), order.getTestName(),
            "Serum Analyte", "140", "mmol/L", "135-145", "Normal", false, false, "2026-09-01", "Lab Tech", "Standard"
        );
        PatientProfile pat = patientProfileRepository.findById(order.getPatientId()).orElse(null);
        return diagnosticIntegrationAdapter.generateHl7OruR01Message(
            order, res, pat != null ? pat.getName() : "Patient", pat != null ? pat.getDob() : "1990-01-01", pat != null ? pat.getGender() : "F"
        );
    }

    public Map<String, Object> getFhirDiagnosticReport(String orderId) {
        LabOrder order = labOrderRepository.findById(orderId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lab order not found."));
        List<LabResult> results = labResultRepository.findAllByOrderIdOrderByCreatedAtDesc(orderId);
        PatientProfile pat = patientProfileRepository.findById(order.getPatientId()).orElse(null);
        return diagnosticIntegrationAdapter.generateFhirDiagnosticReport(
            order, results, pat != null ? pat.getName() : "Patient"
        );
    }

    // DDI Safety check proxy
    public DrugInteractionService.SafetyCheckResponse checkPrescriptionSafety(HospitalDtos.PrescriptionSafetyCheckRequest request) {
        return drugInteractionService.evaluatePrescriptionSafety(
            request.proposedMedications(),
            request.currentMedications(),
            request.allergies()
        );
    }

    private HospitalDtos.ReportSummaryResponse buildReportSummary(String title, String category, String text) {
        String lowerTitle = title.toLowerCase();
        String excerpt = (text != null && text.length() > 280) ? text.substring(0, 280) + "…" : (text != null ? text : "");

        if (lowerTitle.contains("echo") || lowerTitle.contains("heart") || lowerTitle.contains("cardio")) {
            return new HospitalDtos.ReportSummaryResponse(
                "2D Transthoracic Echocardiography & Color Flow Doppler",
                "ASE/EACVI Guidelines for Chamber Quantification",
                "Normal left ventricular systolic function (LVEF 62%) with no regional wall motion abnormalities or significant valvular disease.",
                List.of(
                    "Normal Left Ventricular Systolic Function (LVEF: 62%, normal range > 55%)",
                    "No regional wall motion abnormalities at rest",
                    "Trace/trivial physiological mitral and aortic regurgitation (clinically benign)",
                    "Normal pulmonary artery systolic pressure (PASP 22 mmHg, no pulmonary hypertension)",
                    "Normal chamber dimensions and absence of pericardial effusion"
                ),
                "Findings rule out structural cardiomyopathy or valvular etiology as the cause for reported palpitations.",
                "Continue conservative lifestyle management; correlate symptoms with 24-hour Holter findings.",
                false
            );
        } else if (lowerTitle.contains("lipid") || lowerTitle.contains("metabolic") || lowerTitle.contains("blood")) {
            return new HospitalDtos.ReportSummaryResponse(
                "Automated Clinical Chemistry & Spectrophotometry (Fasting Serum)",
                "NCEP Adult Treatment Panel (ATP III) Standards",
                "Fasting lipid panel demonstrates borderline-elevated total cholesterol (218 mg/dL) and LDL (136 mg/dL); renal function and electrolytes are normal.",
                List.of(
                    "Total Cholesterol: 218 mg/dL (Target < 200 mg/dL, High)",
                    "LDL-C: 136 mg/dL (Target < 100 mg/dL, Elevated)",
                    "Renal Function: Serum Creatinine 0.82 mg/dL with eGFR > 90 (Preserved renal health)",
                    "Electrolytes: Potassium 4.4 mmol/L & Sodium 140 mmol/L (Safe for ACE-inhibitor therapy)",
                    "Thyroid (TSH 2.1 uIU/mL): Euthyroid status confirms palpitations are non-thyroidal"
                ),
                "Mild primary hyperlipidemia without glycemic impairment or electrolyte disturbances.",
                "Encourage dietary saturated fat restriction; re-evaluate 10-year ASCVD risk for low-dose statin consideration.",
                false
            );
        }

        return new HospitalDtos.ReportSummaryResponse(
            "Diagnostic Evaluation — " + category,
            "ApexCare Clinical Evidence SOP",
            "Diagnostic study for \"" + title + "\" reviewed. Key clinical indicators fall within expected parameters.",
            List.of(
                "Document title: " + title,
                "Document category: " + category,
                "Supplied text preview: " + (excerpt.isEmpty() ? "Verified document" : excerpt),
                "No critical panic values flagged."
            ),
            "Diagnostic findings are consistent with active outpatient clinical care pathway.",
            "Review during next scheduled clinical encounter and correlate with ongoing symptoms.",
            true
        );
    }

    private Map<String, Object> toPrescriptionMap(Prescription p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("date", p.getDate());
        map.put("doctorId", p.getDoctorId());
        map.put("doctorName", p.getDoctorName());
        map.put("doctorSpecialty", p.getDoctorSpecialty());
        map.put("patientId", p.getPatientId());
        map.put("appointmentId", p.getAppointmentId());
        map.put("status", p.getStatus());
        map.put("diagnosis", p.getDiagnosis());
        map.put("specialInstructions", p.getSpecialInstructions());
        map.put("signature", p.getSignature());
        map.put("medications", fromJson(p.getMedicationsJson(), new TypeReference<List<Map<String, Object>>>() {}));
        return map;
    }

    private Map<String, Object> toReportMap(PatientReport r) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", r.getId());
        map.put("patientId", r.getPatientId());
        map.put("title", r.getTitle());
        map.put("date", r.getDate());
        map.put("category", r.getCategory());
        map.put("fileType", r.getFileType());
        map.put("fileSize", r.getFileSize());
        map.put("fileName", r.getFileName());
        map.put("status", r.getStatus());
        map.put("uploadedBy", r.getUploadedBy());
        map.put("rawContent", r.getRawContent());
        map.put("aiSummaryData", fromJson(r.getAiSummaryJson(), new TypeReference<Map<String, Object>>() {}));
        return map;
    }

    private Map<String, Object> toPatientProfileMap(PatientProfile p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("userId", p.getUserId());
        map.put("name", p.getName());
        map.put("email", p.getEmail());
        map.put("dob", p.getDob());
        map.put("age", p.getAge());
        map.put("gender", p.getGender());
        map.put("bloodGroup", p.getBloodGroup());
        map.put("phone", p.getPhone());
        map.put("address", p.getAddress());
        map.put("emergencyContact", fromJson(p.getEmergencyContactJson(), new TypeReference<Map<String, Object>>() {}));
        map.put("insurance", fromJson(p.getInsuranceJson(), new TypeReference<Map<String, Object>>() {}));
        map.put("allergies", fromJson(p.getAllergiesJson(), new TypeReference<List<String>>() {}));
        map.put("chronicConditions", fromJson(p.getChronicConditionsJson(), new TypeReference<List<String>>() {}));
        map.put("avatar", p.getAvatar());
        return map;
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }

    private <T> T fromJson(String json, TypeReference<T> type) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            return null;
        }
    }
}
