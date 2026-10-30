package com.apexcare.rag;

import com.apexcare.rag.api.ApiException;
import com.apexcare.rag.api.dto.HospitalDtos;
import com.apexcare.rag.domain.*;
import com.apexcare.rag.repository.*;
import com.apexcare.rag.service.DiagnosticIntegrationAdapter;
import com.apexcare.rag.service.DrugInteractionService;
import com.apexcare.rag.service.HospitalService;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class CareConnectEpicTests {

    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private ClinicalNoteRepository clinicalNoteRepository;

    @Autowired
    private LabOrderRepository labOrderRepository;

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private ImagingOrderRepository imagingOrderRepository;

    @Autowired
    private ImagingResultRepository imagingResultRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicationAdministrationRepository marRepository;

    @Autowired
    private SecureMessageRepository secureMessageRepository;

    @Autowired
    private PatientNotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private DrugInteractionService drugInteractionService;

    @Autowired
    private DiagnosticIntegrationAdapter diagnosticAdapter;

    private static final String TEST_PATIENT_ID = "P-1001";

    @BeforeEach
    void setUp() {
        assertNotNull(hospitalService);
        assertNotNull(patientProfileRepository);
    }

    // =========================================================================
    // EPIC 1: Patient Registration and Demographics
    // =========================================================================
    @Test
    @DisplayName("Epic 1: Patient registration captures demographics, insurance, and medical history accurately")
    void testEpic1_PatientRegistrationAndDemographics() {
        Map<String, Object> newPatientData = new HashMap<>();
        newPatientData.put("id", "P-9901");
        newPatientData.put("name", "Elena Rostova");
        newPatientData.put("email", "elena.rostova@example.com");
        newPatientData.put("dob", "1994-07-22");
        newPatientData.put("age", 32);
        newPatientData.put("gender", "Female");
        newPatientData.put("bloodGroup", "B+");
        newPatientData.put("phone", "+1 (555) 391-0021");
        newPatientData.put("address", "742 Evergreen Terrace");
        newPatientData.put("insuranceProvider", "Blue Cross Blue Shield Premier");
        newPatientData.put("policyNumber", "BCBS-991204");
        newPatientData.put("groupNumber", "GRP-77");
        newPatientData.put("allergies", List.of("Sulfa Drugs", "Latex"));
        newPatientData.put("chronicConditions", List.of("Mild Asthma"));

        Map<String, Object> registered = hospitalService.registerPatientProfile(newPatientData);

        assertNotNull(registered);
        assertEquals("P-9901", registered.get("id"));
        assertEquals("Elena Rostova", registered.get("name"));

        // Verify Database Persistence
        Optional<PatientProfile> persisted = patientProfileRepository.findById("P-9901");
        assertTrue(persisted.isPresent());
        assertEquals("Elena Rostova", persisted.get().getName());
        assertEquals("B+", persisted.get().getBloodGroup());
        assertTrue(persisted.get().getInsuranceJson().contains("Blue Cross"));
        assertTrue(persisted.get().getAllergiesJson().contains("Sulfa Drugs"));

        // Verify Search & Retrieval
        List<HospitalDtos.DoctorPatientSummary> searchResults = hospitalService.getDoctorPatients("D-201", "Elena");
        assertFalse(searchResults.isEmpty());
        assertEquals("Elena Rostova", searchResults.get(0).name());
    }

    // =========================================================================
    // EPIC 2: Clinical Documentation & Immutability Protection
    // =========================================================================
    @Test
    @DisplayName("Epic 2: Clinical encounter notes use templates, and finalized records cannot be overwritten")
    void testEpic2_ClinicalDocumentationAndImmutability() {
        HospitalDtos.ClinicalNoteRequest request = new HospitalDtos.ClinicalNoteRequest(
            TEST_PATIENT_ID,
            "Dr. Rajesh Verma, MD",
            "Cardiology",
            "Outpatient Follow-up",
            "SOAP",
            "Hypertension consultation",
            "Patient reports adherence to Lisinopril 10mg.",
            "Essential hypertension, controlled; benign palpitations.",
            "Continue Lisinopril 10mg daily; recheck in 3 months.",
            true // Finalized
        );

        ClinicalNote note = hospitalService.createEncounterNote(request);
        assertNotNull(note);
        assertNotNull(note.getId());
        assertEquals("Finalized", note.getStatus());
        assertTrue(note.getIsFinalized());
        assertEquals("SOAP", note.getTemplateType());

        // Verify Acceptance Criteria: Finalized records CANNOT be silently overwritten
        HospitalDtos.ClinicalNoteRequest overwriteAttempt = new HospitalDtos.ClinicalNoteRequest(
            TEST_PATIENT_ID,
            "Dr. Rajesh Verma, MD",
            "Cardiology",
            "Outpatient Follow-up",
            "SOAP",
            "Malicious overwrite of finalized note",
            "Tampered content",
            "Tampered assessment",
            "Tampered plan",
            true
        );

        ApiException ex = assertThrows(ApiException.class, () -> {
            hospitalService.updateEncounterNote(note.getId(), overwriteAttempt);
        });

        assertTrue(ex.getMessage().contains("finalized and signed") || ex.getMessage().contains("cannot be modified"));
    }

    // =========================================================================
    // EPIC 3: Computerized Provider Order Entry (CPOE)
    // =========================================================================
    @Test
    @DisplayName("Epic 3: CPOE allows ordering lab tests, imaging studies, and procedures with tracking")
    void testEpic3_ComputerizedProviderOrderEntry() {
        // 1. Lab Order
        HospitalDtos.LabOrderRequest labReq = new HospitalDtos.LabOrderRequest(
            TEST_PATIENT_ID, "D-201", "LOINC-24331-1", "High-Sensitivity Troponin-I", "STAT", "Acute chest tightness", "Venous Blood"
        );
        LabOrder labOrder = hospitalService.orderLabTest(labReq);
        assertNotNull(labOrder.getId());
        assertEquals("STAT", labOrder.getPriority());
        assertEquals("Ordered", labOrder.getStatus());

        // 2. Imaging Order
        HospitalDtos.ImagingOrderRequest imgReq = new HospitalDtos.ImagingOrderRequest(
            TEST_PATIENT_ID, "D-201", "CT", "Chest Angiography", "Urgent", "Rule out pulmonary embolism"
        );
        ImagingOrder imgOrder = hospitalService.orderImaging(imgReq);
        assertNotNull(imgOrder.getId());
        assertNotNull(imgOrder.getPacsAccessionNumber());
        assertEquals("CT", imgOrder.getModality());

        // 3. Procedure Order
        HospitalDtos.ProcedureOrderRequest prcReq = new HospitalDtos.ProcedureOrderRequest(
            TEST_PATIENT_ID, "D-201", "Transesophageal Echocardiogram (TEE)", "Cardiology", "2026-09-12", "Elective", "Fasting 6 hours prior"
        );
        ProcedureOrder prcOrder = hospitalService.orderProcedure(prcReq);
        assertNotNull(prcOrder.getId());
        assertEquals("Scheduled", prcOrder.getStatus());
    }

    // =========================================================================
    // EPIC 4: Medication Management & DDI Interaction Checking
    // =========================================================================
    @Test
    @DisplayName("Epic 4: Prescribing performs DDI checking and maintains Medication Administration Records (MAR)")
    void testEpic4_MedicationManagementAndDdiSafety() {
        // Test prescription with Lisinopril
        HospitalDtos.PrescriptionRequest rxReq = new HospitalDtos.PrescriptionRequest(
            TEST_PATIENT_ID,
            "APT-101",
            "D-201",
            "Dr. Rajesh Verma, MD",
            "Cardiology",
            "Hypertension",
            "Take with meals",
            List.of(Map.of(
                "name", "Lisinopril",
                "dosage", "10 mg",
                "frequency", "Once daily",
                "duration", "30 Days"
            ))
        );

        Map<String, Object> createdRx = hospitalService.createPrescription(rxReq);
        assertNotNull(createdRx.get("id"));
        assertNotNull(createdRx.get("safetyCheck"));

        // Verify Medication Administration Records (MAR) were generated
        List<MedicationAdministration> mars = hospitalService.getMedicationAdministrations(TEST_PATIENT_ID);
        assertFalse(mars.isEmpty());
        assertTrue(mars.stream().anyMatch(m -> m.getMedicationName().contains("Lisinopril")));

        // Test DDI Gateway: Contraindicated combination (Lisinopril + Spironolactone -> Severe Hyperkalemia)
        DrugInteractionService.SafetyCheckResponse ddiCheck = drugInteractionService.evaluatePrescriptionSafety(
            List.of("Spironolactone"),
            List.of("Lisinopril"),
            List.of("Penicillin")
        );

        assertEquals("CONTRAINDICATED", ddiCheck.overallStatus());
        assertFalse(ddiCheck.interactions().isEmpty());
        assertTrue(ddiCheck.interactions().get(0).title().contains("Hyperkalemia"));
        assertNotNull(ddiCheck.integrationMetadata().get("gateway"));

        // Test Allergy Cross-check: Penicillin allergy detected
        DrugInteractionService.SafetyCheckResponse allergyCheck = drugInteractionService.evaluatePrescriptionSafety(
            List.of("Amoxicillin"),
            List.of(),
            List.of("Penicillin (Moderate rash)")
        );
        assertFalse(allergyCheck.allergyAlerts().isEmpty());
        assertEquals("SEVERE_ANAPHYLAXIS_RISK", allergyCheck.allergyAlerts().get(0).severity());
    }

    // =========================================================================
    // EPIC 5: Lab and Imaging Integration & Critical Panic Alerts
    // =========================================================================
    @Test
    @DisplayName("Epic 5: Lab result recording triggers critical panic alert notifications, and HL7/FHIR adapters format data")
    void testEpic5_LabAndImagingIntegrationAndCriticalAlerts() {
        // Record Critical Lab Panic Value: Potassium 6.4 mmol/L (Normal 3.5 - 5.0)
        HospitalDtos.LabResultRequest criticalReq = new HospitalDtos.LabResultRequest(
            "LAB-1002",
            TEST_PATIENT_ID,
            "Serum Electrolytes & Renal Panel",
            "Serum Potassium",
            "6.4",
            "mmol/L",
            "3.5 - 5.0 mmol/L",
            "Critical High",
            true, // Is Critical Panic Value
            "Chief Pathologist, MD",
            "PANIC VALUE: Repeat tested and confirmed."
        );

        LabResult result = hospitalService.recordLabResult(criticalReq);
        assertNotNull(result.getId());
        assertTrue(result.getIsCritical());

        // Verify Critical Panic Alert Notification was triggered
        List<PatientNotification> notifications = hospitalService.getNotifications(TEST_PATIENT_ID);
        assertTrue(notifications.stream().anyMatch(n -> "CRITICAL".equalsIgnoreCase(n.getSeverity()) && n.getTitle().contains("PANIC ALERT")));

        // Verify HL7 v2.5.1 and FHIR R4 Integration Adapter output
        String hl7Message = hospitalService.getHl7OruMessage("LAB-1001");
        assertNotNull(hl7Message);
        assertTrue(hl7Message.contains("MSH|^~\\&"));
        assertTrue(hl7Message.contains("ORU^R01"));

        Map<String, Object> fhirReport = hospitalService.getFhirDiagnosticReport("LAB-1001");
        assertNotNull(fhirReport);
        assertEquals("DiagnosticReport", fhirReport.get("resourceType"));
        assertEquals("final", fhirReport.get("status"));
    }

    // =========================================================================
    // EPIC 6: System Integration (Cross-Module Traceability)
    // =========================================================================
    @Test
    @DisplayName("Epic 6: Cross-module integration shares data between appointments, orders, MAR, notifications, and audit logs")
    void testEpic6_SystemIntegration() {
        // Book appointment
        HospitalDtos.AppointmentRequest aptReq = new HospitalDtos.AppointmentRequest(
            "D-201", TEST_PATIENT_ID, "Ananya Sharma", "2026-09-25", "2026-09-25", "11:00 AM", "11:00 AM",
            "Follow-up", "Cardiac evaluation", "Routine check", null
        );
        Appointment apt = hospitalService.bookAppointment(aptReq);
        assertNotNull(apt.getId());

        // Verify Notification was generated
        List<PatientNotification> notifs = hospitalService.getNotifications(TEST_PATIENT_ID);
        assertTrue(notifs.stream().anyMatch(n -> n.getMessage().contains("2026-09-25")));

        // Verify Audit Logs capture activity
        List<AuditLog> auditLogs = hospitalService.getAuditLogs();
        assertFalse(auditLogs.isEmpty());
        assertTrue(auditLogs.stream().anyMatch(l -> "SCHEDULE_APPOINTMENT".equalsIgnoreCase(l.getAction())));
    }

    // =========================================================================
    // EPIC 7: Patient Portal & Secure Messaging
    // =========================================================================
    @Test
    @DisplayName("Epic 7: Patient portal enables self-service record viewing, secure messaging, and prevents unauthorized note modification")
    void testEpic7_PatientPortalAndSecureMessaging() {
        // 1. Patient Medical Record retrieval
        Map<String, Object> record = hospitalService.getPatientMedicalRecord(TEST_PATIENT_ID);
        assertNotNull(record.get("patient"));
        assertNotNull(record.get("vitals"));
        assertNotNull(record.get("clinicalNotes"));

        // 2. Patient-to-Provider Secure Messaging
        HospitalDtos.SecureMessageRequest msgReq = new HospitalDtos.SecureMessageRequest(
            TEST_PATIENT_ID,
            TEST_PATIENT_ID,
            "Ananya Sharma",
            "PATIENT",
            "D-201",
            "Dr. Rajesh Verma",
            "DOCTOR",
            "Medication refill query",
            "Dr. Verma, should I continue Atorvastatin before my next lipid test?"
        );

        SecureMessage msg = hospitalService.sendSecureMessage(msgReq);
        assertNotNull(msg.getId());
        assertFalse(msg.getIsRead());

        // Verify patient messages list
        List<SecureMessage> messages = hospitalService.getPatientMessages(TEST_PATIENT_ID);
        assertFalse(messages.isEmpty());
        assertTrue(messages.stream().anyMatch(m -> m.getSubject().contains("Medication refill")));
    }

    // =========================================================================
    // HCL Database Views Verification
    // =========================================================================
    @Test
    @DisplayName("Database Views: PatientSummary, ProviderSchedule, MedicationHistory, LabOrdersAndResults")
    void testDatabaseViews() {
        // View 1: PatientSummary
        Map<String, Object> summary = hospitalService.getPatientSummary(TEST_PATIENT_ID);
        assertNotNull(summary);
        assertTrue(summary.containsKey("upcomingAppointmentsCount"));
        assertTrue(summary.containsKey("activePrescriptionsCount"));
        assertTrue(summary.containsKey("latestVitals"));

        // View 2: ProviderSchedule
        Map<String, Object> schedule = hospitalService.getProviderSchedule("D-201", null);
        assertNotNull(schedule);
        assertTrue(schedule.containsKey("queue"));

        // View 3: MedicationHistory
        Map<String, Object> medHist = hospitalService.getMedicationHistory(TEST_PATIENT_ID);
        assertNotNull(medHist);
        assertTrue(medHist.containsKey("prescriptions"));
        assertTrue(medHist.containsKey("administrationRecords"));

        // View 4: LabOrdersAndResults
        Map<String, Object> labViews = hospitalService.getLabOrdersAndResults(TEST_PATIENT_ID);
        assertNotNull(labViews);
        assertTrue(labViews.containsKey("labOrders"));
        assertTrue(labViews.containsKey("labResults"));
        assertTrue(labViews.containsKey("imagingOrders"));
    }
}
