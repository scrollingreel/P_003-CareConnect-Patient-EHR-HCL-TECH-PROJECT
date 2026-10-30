package com.apexcare.rag.config;

import com.apexcare.rag.domain.*;
import com.apexcare.rag.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder {
    private final AppUserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PatientVitalRepository patientVitalRepository;
    private final ClinicalNoteRepository clinicalNoteRepository;
    private final PatientReportRepository patientReportRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final HospitalDocumentRepository hospitalDocumentRepository;
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
    private final Optional<VectorStore> vectorStore;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public DataSeeder(AppUserRepository userRepository,
                      DepartmentRepository departmentRepository,
                      DoctorRepository doctorRepository,
                      PatientProfileRepository patientProfileRepository,
                      PatientVitalRepository patientVitalRepository,
                      ClinicalNoteRepository clinicalNoteRepository,
                      PatientReportRepository patientReportRepository,
                      PrescriptionRepository prescriptionRepository,
                      AppointmentRepository appointmentRepository,
                      HospitalDocumentRepository hospitalDocumentRepository,
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
                      Optional<VectorStore> vectorStore,
                      PasswordEncoder passwordEncoder,
                      ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.patientVitalRepository = patientVitalRepository;
        this.clinicalNoteRepository = clinicalNoteRepository;
        this.patientReportRepository = patientReportRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.hospitalDocumentRepository = hospitalDocumentRepository;
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
        this.vectorStore = vectorStore;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void seed() {
        seedUsers();
        seedDepartments();
        seedDoctors();
        seedPatients();
        seedHclEhrsEntities();
        seedHospitalPolicies();
    }

    private void seedUsers() {
        String encodedPass = passwordEncoder.encode("SecurePass2026!");

        if (userRepository.findByEmailIgnoreCase("ananya.sharma@example.com").isEmpty()) {
            userRepository.save(new AppUser(
                UUID.fromString("00000000-0000-0000-0000-000000000001"),
                "Ananya Sharma",
                "ananya.sharma@example.com",
                encodedPass,
                UserRole.PATIENT,
                Instant.now()
            ));
        }

        if (userRepository.findByEmailIgnoreCase("sarah.jenkins@example.com").isEmpty()) {
            userRepository.save(new AppUser(
                UUID.fromString("00000000-0000-0000-0000-000000000011"),
                "Ananya Sharma",
                "sarah.jenkins@example.com",
                encodedPass,
                UserRole.PATIENT,
                Instant.now()
            ));
        }

        if (userRepository.findByEmailIgnoreCase("rajesh.verma@apexcare.org").isEmpty()) {
            userRepository.save(new AppUser(
                UUID.fromString("00000000-0000-0000-0000-000000000002"),
                "Dr. Rajesh Verma",
                "rajesh.verma@apexcare.org",
                encodedPass,
                UserRole.DOCTOR,
                Instant.now()
            ));
        }

        if (userRepository.findByEmailIgnoreCase("admin@apexcare.org").isEmpty()) {
            userRepository.save(new AppUser(
                UUID.fromString("00000000-0000-0000-0000-000000000003"),
                "Amanda Ross",
                "admin@apexcare.org",
                encodedPass,
                UserRole.ADMIN,
                Instant.now()
            ));
        }
    }

    private void seedDepartments() {
        if (departmentRepository.count() > 0) return;

        departmentRepository.saveAll(List.of(
            new Department("dept-cardio", "Cardiology", "Specialized cardiovascular health and preventive interventions.", "Heart", "Dr. Rajesh Verma, MD", "West Wing — 3rd Floor"),
            new Department("dept-neuro", "Neurology", "Comprehensive neurological diagnostics and cerebrovascular care.", "Brain", "Dr. Priya Sundaram, MD", "East Wing — 4th Floor"),
            new Department("dept-ortho", "Orthopedics", "Advanced joint reconstruction, spine care, and sports medicine.", "Bone", "Dr. Vikram Sethi, MS", "North Wing — 2nd Floor"),
            new Department("dept-peds", "Pediatrics", "Dedicated pediatric critical care, neonatal medicine, and wellness.", "Baby", "Dr. Meera Nambiar, MD", "South Wing — 1st Floor"),
            new Department("dept-gen", "General Medicine", "Primary outpatient consultations, internal medicine, and triage.", "Stethoscope", "Dr. Amit Roy, MD", "Ground Floor — OPD Complex"),
            new Department("dept-onco", "Oncology", "Multidisciplinary medical, surgical, and radiation oncology.", "ShieldAlert", "Dr. Sanjay Nair, DM", "Cancer Care Center — 5th Floor")
        ));
    }

    private void seedDoctors() {
        if (doctorRepository.count() > 0) return;

        doctorRepository.saveAll(List.of(
            new Doctor("D-201", "Dr. Rajesh Verma", "MD, FACC - Senior Consultant", "dept-cardio", "Cardiology", "Interventional Cardiology & Preventive Hypertension", 18, 4.9, 124, 750.0, "rajesh.verma@apexcare.org", "+91 98450 12345", "Room 304, West Wing", "Mon, Tue, Wed, Thu, Fri", "09:00 AM - 04:00 PM", "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"),
            new Doctor("D-202", "Dr. Priya Sundaram", "MD, DM - Chief Neurologist", "dept-neuro", "Neurology", "Cognitive Disorders, Stroke Care & Epilepsy", 15, 4.8, 98, 850.0, "priya.sundaram@apexcare.org", "+91 98450 12346", "Room 412, East Wing", "Mon, Wed, Fri", "10:00 AM - 03:00 PM", "https://images.unsplash.com/photo-1594824813515-b7787fb980e1?w=200&auto=format&fit=crop&q=80"),
            new Doctor("D-203", "Dr. Vikram Sethi", "MS, MCh - Orthopedic Surgeon", "dept-ortho", "Orthopedics", "Total Knee/Hip Replacement & Arthroscopy", 21, 4.9, 156, 900.0, "vikram.sethi@apexcare.org", "+91 98450 12347", "Room 205, North Wing", "Tue, Thu, Sat", "09:00 AM - 01:00 PM", "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80"),
            new Doctor("D-204", "Dr. Meera Nambiar", "MD, DCH - Senior Pediatrician", "dept-peds", "Pediatrics", "Neonatal Intensive Care & Pediatric Pulmonology", 12, 4.9, 210, 600.0, "meera.nambiar@apexcare.org", "+91 98450 12348", "Room 108, South Wing", "Mon - Sat", "09:00 AM - 02:00 PM", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80"),
            new Doctor("D-205", "Dr. Amit Roy", "MD - Physician & Diabetologist", "dept-gen", "General Medicine", "Metabolic Syndrome & Geriatric Medicine", 14, 4.7, 85, 500.0, "amit.roy@apexcare.org", "+91 98450 12349", "Room 102, Ground Floor", "Mon - Sat", "08:30 AM - 04:30 PM", "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80"),
            new Doctor("D-206", "Dr. Sanjay Nair", "MD, DM - Medical Oncologist", "dept-onco", "Oncology", "Immunotherapy, Targeted Therapy & Chemotherapy", 19, 4.9, 142, 1000.0, "sanjay.nair@apexcare.org", "+91 98450 12350", "Room 501, Cancer Care Center", "Mon, Tue, Thu", "11:00 AM - 04:00 PM", "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80")
        ));
    }

    private void seedPatients() {
        if (patientProfileRepository.count() > 0) return;

        UUID ananyaUserId = userRepository.findByEmailIgnoreCase("ananya.sharma@example.com")
            .map(AppUser::getId).orElse(UUID.fromString("00000000-0000-0000-0000-000000000001"));

        // Ananya Sharma
        patientProfileRepository.save(new PatientProfile(
            "P-1001",
            ananyaUserId,
            "Ananya Sharma",
            "ananya.sharma@example.com",
            "1988-04-12",
            38,
            "Female",
            "A+",
            "+91 98765 43210",
            "B-402, Green Glen Heights, Bengaluru, KA 560103",
            "{\"name\":\"Rahul Sharma\",\"relation\":\"Spouse\",\"phone\":\"+91 98765 43211\"}",
            "{\"provider\":\"Star Health Premier Comprehensive\",\"policyNumber\":\"SH-9928130\",\"groupNumber\":\"GRP-4412-APEX\",\"status\":\"Verified & Active\",\"validUntil\":\"2027-12-31\"}",
            "[\"Penicillin (Moderate rash)\",\"Peanuts (Mild)\"]",
            "[\"Essential Hypertension\",\"Mild Supraventricular Tachycardia (Controlled)\"]",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
        ));

        // Other patients for Doctor view
        patientProfileRepository.save(new PatientProfile("P-1002", null, "Michael Chang", "m.chang@example.com", "1970-02-14", 56, "Male", "O+", "+1 (555) 432-8712", "Portland, OR", "{}", "{}", "[]", "[\"Post-PCI LAD Stent\"]", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"));
        patientProfileRepository.save(new PatientProfile("P-1003", null, "Arthur Pendelton", "a.pendelton@example.com", "1959-11-03", 67, "Male", "B-", "+1 (555) 761-0982", "Eugene, OR", "{}", "{}", "[]", "[\"Ischemic Heart Disease\"]", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"));
        patientProfileRepository.save(new PatientProfile("P-1004", null, "Fatima Zahra", "f.zahra@example.com", "1982-08-25", 44, "Female", "AB+", "+1 (555) 321-9944", "Salem, OR", "{}", "{}", "[]", "[\"Dyslipidemia\"]", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"));

        // Vitals
        patientVitalRepository.saveAll(List.of(
            new PatientVital(UUID.randomUUID(), "P-1001", "2026-08-20", "124/82 mmHg", "74 bpm", "99%", "98.4 F", "64.2 kg", "22.8"),
            new PatientVital(UUID.randomUUID(), "P-1001", "2026-06-14", "136/88 mmHg", "82 bpm", "98%", "98.6 F", "65.0 kg", "23.1"),
            new PatientVital(UUID.randomUUID(), "P-1001", "2026-03-10", "142/92 mmHg", "88 bpm", "99%", "98.2 F", "66.1 kg", "23.5")
        ));

        // Clinical Notes with templates and assessments
        clinicalNoteRepository.saveAll(List.of(
            new ClinicalNote(
                "CN-401", "P-1001", "2026-08-20", "Dr. Rajesh Verma, MD", "Cardiology",
                "Follow-up on 24-hr Holter and Lisinopril dose adjustment.",
                "Patient reports significant reduction in nocturnal palpitations. Blood pressure well controlled at 124/82 on Lisinopril 10mg. Holter monitor showed isolated PACs with no sustained tachyarrhythmias.",
                "Outpatient Encounter", "SOAP",
                "Essential Hypertension, Stage 1 (adequately controlled). Benign Premature Atrial Contractions.",
                "1. Maintain Lisinopril 10 mg once daily. 2. Aerobic physical activity 30 min/day. 3. Re-check in 3 months.",
                "Finalized", true, "Dr. Rajesh Verma, MD"
            ),
            new ClinicalNote(
                "CN-380", "P-1001", "2026-06-14", "Dr. Rajesh Verma, MD", "Cardiology",
                "Initial consultation for episodic palpitations and elevated BP.",
                "Patient presents with a 2-month history of flutter sensations in the chest. Ordered complete lipid profile, 12-lead ECG, 2D Echo Doppler, and 24-hour Holter monitoring. Initiated Lisinopril 5mg.",
                "Outpatient Consultation", "CARDIOLOGY_CONSULT",
                "New onset palpitations with untreated borderline hypertension.",
                "Diagnostic workup: 2D Echo Doppler, fasting lipid panel, ambulatory Holter. Initiate Lisinopril 5mg daily.",
                "Finalized", true, "Dr. Rajesh Verma, MD"
            )
        ));

        // Reports
        patientReportRepository.saveAll(List.of(
            new PatientReport("REP-901", "P-1001", "2D Echocardiography & Color Doppler Report", "2026-08-18", "Diagnostic Imaging", "PDF", "2.4 MB", "Echo_Doppler_Report.pdf", "Reviewed", "Radiology Dept (Dr. K. Patel)", "Normal LV and RV systolic function (LVEF 62%). No hemodynamically significant valvular lesions. No pulmonary hypertension.", "{\"executiveSummary\":\"Normal left ventricular systolic function (LVEF 62%) with no regional wall motion abnormalities or significant valvular disease.\",\"keyFindings\":[\"Normal Left Ventricular Systolic Function (LVEF: 62%)\",\"No regional wall motion abnormalities\",\"Trace physiological regurgitation\",\"Normal PASP 22 mmHg\"],\"clinicalSignificance\":\"Findings rule out structural cardiomyopathy or valvular etiology for palpitations.\",\"recommendations\":\"Continue conservative lifestyle management; correlate with Holter.\"}"),
            new PatientReport("REP-902", "P-1001", "Comprehensive Metabolic & Lipid Panel", "2026-08-16", "Laboratory Pathology", "PDF", "1.1 MB", "Metabolic_Lipid_Panel.pdf", "Reviewed", "ApexCare Central Clinical Labs", "Total Cholesterol: 218 mg/dL (HIGH). Triglycerides: 142 mg/dL. HDL: 54 mg/dL. LDL: 136 mg/dL. Fasting Glucose: 91 mg/dL. Serum Creatinine: 0.82 mg/dL. eGFR > 90.", "{\"executiveSummary\":\"Fasting lipid panel demonstrates borderline-elevated total cholesterol (218 mg/dL) and LDL (136 mg/dL); renal function and glucose are completely normal.\",\"keyFindings\":[\"Total Cholesterol: 218 mg/dL (High)\",\"LDL-C: 136 mg/dL (Elevated)\",\"Renal Function: Normal eGFR > 90\",\"Electrolytes: Normal\"],\"clinicalSignificance\":\"Mild primary hyperlipidemia safe for ongoing ACE-inhibitor therapy.\",\"recommendations\":\"Encourage dietary saturated fat restriction.\"}"),
            new PatientReport("REP-903", "P-1001", "24-Hour Ambulatory Holter ECG Monitoring", "2026-06-20", "Cardiovascular Diagnostics", "PDF", "3.8 MB", "Holter_24Hr_ECG.pdf", "Reviewed", "ApexCare Holter Lab", "Total complexes: 104,210. Mean HR: 72 bpm. 14 isolated PVCs. 42 isolated PACs. No sustained ventricular tachycardia. No pauses > 2.0s.", "{\"executiveSummary\":\"Predominantly sinus rhythm with isolated, infrequent benign premature atrial contractions (<0.05% burden) and zero ventricular tachyarrhythmias.\",\"keyFindings\":[\"Mean Heart Rate: 72 bpm\",\"Isolated PACs < 0.05% burden\",\"No diagnostic ischemic ST shifts\"],\"clinicalSignificance\":\"Confirms benign etiology of palpitations.\",\"recommendations\":\"Reassurance and continued follow-up.\"}")
        ));

        // Prescriptions
        String rx1Meds = "[{\"name\":\"Lisinopril\",\"dosage\":\"10 mg\",\"form\":\"Oral Tablet\",\"frequency\":\"Once daily in the morning\",\"duration\":\"90 Days\",\"quantity\":\"90 tablets\",\"refills\":2,\"instructions\":\"Take consistently with water. Monitor BP weekly.\"},{\"name\":\"Atorvastatin Calcium\",\"dosage\":\"10 mg\",\"form\":\"Oral Tablet\",\"frequency\":\"Once daily at bedtime\",\"duration\":\"90 Days\",\"quantity\":\"90 tablets\",\"refills\":2,\"instructions\":\"For hyperlipidemia. Avoid grapefruit juice.\"},{\"name\":\"Metoprolol Tartrate\",\"dosage\":\"25 mg\",\"form\":\"Oral Tablet\",\"frequency\":\"Twice daily with meals\",\"duration\":\"30 Days\",\"quantity\":\"60 tablets\",\"refills\":1,\"instructions\":\"Do not discontinue abruptly. Report pulse below 50 bpm.\"}]";
        prescriptionRepository.save(new Prescription("RX-9402", "2026-08-20", "D-201", "Dr. Rajesh Verma, MD", "Cardiology", "P-1001", "APT-101", "Active", "Essential Hypertension & Mild Palpitations", "Maintain low-sodium diet (<2,000 mg/day). Follow up in 3 months.", "Digitally signed by Dr. Rajesh Verma, MD (License #MD-98442-IN)", rx1Meds));

        String rx2Meds = "[{\"name\":\"Lisinopril\",\"dosage\":\"5 mg\",\"form\":\"Oral Tablet\",\"frequency\":\"Once daily in the morning\",\"duration\":\"60 Days\",\"quantity\":\"60 tablets\",\"refills\":0,\"instructions\":\"Initial titration dose.\"}]";
        prescriptionRepository.save(new Prescription("RX-8104", "2026-06-14", "D-201", "Dr. Rajesh Verma, MD", "Cardiology", "P-1001", "APT-092", "Completed", "Initial Hypertension Assessment", "Return for 2D Echo and Holter testing.", "Digitally signed by Dr. Rajesh Verma, MD (License #MD-98442-IN)", rx2Meds));

        // Appointments
        appointmentRepository.save(new Appointment(
            "APT-101", "P-1001", "Ananya Sharma", "D-201", "Dr. Rajesh Verma", "Cardiology",
            "2026-09-08", "10:00 AM", "In-person Consultation", "Scheduled",
            "Review 3-month BP log and medication response", "Patient reports improved symptom control.",
            "Room 304, West Wing", null, "[]"
        ));
    }

    private void seedHclEhrsEntities() {
        if (medicationCatalogRepository.count() == 0) {
            medicationCatalogRepository.saveAll(List.of(
                new MedicationCatalog("MED-001", "RXNORM-29046", "Lisinopril", "Prinivil / Zestril", "Oral Tablet", "10 mg", "ACE Inhibitor (Antihypertensive)", true),
                new MedicationCatalog("MED-002", "RXNORM-83367", "Atorvastatin Calcium", "Lipitor", "Oral Tablet", "10 mg", "HMG-CoA Reductase Inhibitor (Statin)", true),
                new MedicationCatalog("MED-003", "RXNORM-6918", "Metoprolol Tartrate", "Lopressor", "Oral Tablet", "25 mg", "Beta-1 Adrenergic Blocker", true),
                new MedicationCatalog("MED-004", "RXNORM-6809", "Metformin Hydrochloride", "Glucophage", "Oral Tablet", "500 mg", "Biguanide Antidiabetic", true),
                new MedicationCatalog("MED-005", "RXNORM-9997", "Spironolactone", "Aldactone", "Oral Tablet", "25 mg", "Potassium-Sparing Aldosterone Antagonist", true),
                new MedicationCatalog("MED-006", "RXNORM-21212", "Clarithromycin", "Biaxin", "Oral Tablet", "500 mg", "Macrolide Antibiotic", true),
                new MedicationCatalog("MED-007", "RXNORM-7052", "Amlodipine Besylate", "Norvasc", "Oral Tablet", "5 mg", "Dihydropyridine Calcium Channel Blocker", true),
                new MedicationCatalog("MED-008", "RXNORM-1191", "Aspirin", "Bayer / Ecotrin", "Oral Tablet", "81 mg", "Platelet Aggregation Inhibitor", false)
            ));
        }

        if (labOrderRepository.count() == 0) {
            labOrderRepository.saveAll(List.of(
                new LabOrder("LAB-1001", "P-1001", "D-201", "LOINC-24331-1", "Comprehensive Lipid Profile", "Routine", "Quarterly hyperlipidemia assessment on statin therapy", "2026-08-16", "Completed", "Fasting Venous Serum"),
                new LabOrder("LAB-1002", "P-1001", "D-201", "LOINC-2823-3", "Serum Electrolytes & Renal Panel", "Routine", "Electrolyte clearance check for ACE-inhibitor safety", "2026-08-16", "Completed", "Venous Plasma"),
                new LabOrder("LAB-1003", "P-1001", "D-201", "LOINC-4544-3", "Hemoglobin A1c (HbA1c)", "Routine", "Metabolic screening", "2026-09-01", "Ordered", "Whole Blood")
            ));

            labResultRepository.saveAll(List.of(
                new LabResult("LRES-2001", "LAB-1001", "P-1001", "Comprehensive Lipid Profile", "Total Cholesterol", "218", "mg/dL", "< 200 mg/dL", "High", false, false, "2026-08-16 10:30 AM", "Central Labs Pathologist", "Borderline high"),
                new LabResult("LRES-2002", "LAB-1001", "P-1001", "Comprehensive Lipid Profile", "LDL Cholesterol", "136", "mg/dL", "< 100 mg/dL", "High", false, false, "2026-08-16 10:30 AM", "Central Labs Pathologist", "Elevated LDL"),
                new LabResult("LRES-2003", "LAB-1002", "P-1001", "Serum Electrolytes & Renal Panel", "Serum Potassium", "4.4", "mmol/L", "3.5 - 5.0 mmol/L", "Normal", false, false, "2026-08-16 11:15 AM", "Biochemist, MD", "Normal euglycemic potassium"),
                new LabResult("LRES-2004", "LAB-1002", "P-1001", "Serum Electrolytes & Renal Panel", "Serum Creatinine", "0.82", "mg/dL", "0.60 - 1.10 mg/dL", "Normal", false, false, "2026-08-16 11:15 AM", "Biochemist, MD", "Preserved GFR > 90")
            ));
        }

        if (imagingOrderRepository.count() == 0) {
            imagingOrderRepository.saveAll(List.of(
                new ImagingOrder("IMG-3001", "P-1001", "D-201", "Echocardiography", "Transthoracic Cardiac Window", "Routine", "Evaluate cardiac chamber structure and EF", "2026-08-18", "Completed", "ACC-774912"),
                new ImagingOrder("IMG-3002", "P-1001", "D-201", "ECG", "12-Lead Standard", "Routine", "Palpitations evaluation", "2026-08-18", "Completed", "ACC-774913")
            ));

            imagingResultRepository.saveAll(List.of(
                new ImagingResult("IRES-4001", "IMG-3001", "P-1001", "Echocardiography", "2D Transthoracic Echo with Color Doppler", "Normal left and right ventricular size and systolic performance. LVEF 62%. No significant valvular stenosis or regurgitation.", "Normal cardiac chambers and ejection fraction; benign study.", false, false, "Dr. K. Patel, MD (Radiology)", "https://pacs.apexcare.org/viewer?acc=ACC-774912", "2026-08-18 02:30 PM")
            ));
        }

        if (procedureOrderRepository.count() == 0) {
            procedureOrderRepository.save(new ProcedureOrder(
                "PRC-5001", "P-1001", "D-201", "24-Hour Ambulatory Holter Monitor Attachment", "Cardiovascular Diagnostics", "2026-06-20", "Elective", "Keep skin electrodes dry; maintain symptom diary.", "Completed"
            ));
        }

        if (medicationAdministrationRepository.count() == 0) {
            medicationAdministrationRepository.saveAll(List.of(
                new MedicationAdministration("MAR-6001", "P-1001", "RX-9402", "Lisinopril", "10 mg", "Oral", "2026-08-20 08:00 AM", "2026-08-20 08:05 AM", "Staff Nurse Deepa Nair", "Administered", "Dose taken with water; pre-dose BP 124/82 mmHg."),
                new MedicationAdministration("MAR-6002", "P-1001", "RX-9402", "Atorvastatin Calcium", "10 mg", "Oral", "2026-08-20 09:00 PM", "2026-08-20 09:10 PM", "Staff Nurse Deepa Nair", "Administered", "Night dose administered."),
                new MedicationAdministration("MAR-6003", "P-1001", "RX-9402", "Metoprolol Tartrate", "25 mg", "Oral", "2026-08-20 08:00 AM", "2026-08-20 08:05 AM", "Staff Nurse Deepa Nair", "Administered", "Pulse 74 bpm prior to administration.")
            ));
        }

        if (secureMessageRepository.count() == 0) {
            secureMessageRepository.saveAll(List.of(
                new SecureMessage("MSG-7001", "P-1001", "P-1001", "Ananya Sharma", "PATIENT", "D-201", "Dr. Rajesh Verma", "DOCTOR", "Inquiry regarding blood pressure readings", "Dear Dr. Verma, my morning blood pressure has averaged 122/80 over the last 2 weeks. The palpitations have also decreased significantly."),
                new SecureMessage("MSG-7002", "P-1001", "D-201", "Dr. Rajesh Verma", "DOCTOR", "P-1001", "Ananya Sharma", "PATIENT", "Re: Inquiry regarding blood pressure readings", "Hello Ananya, excellent news! Your numbers demonstrate great response to Lisinopril 10mg. Please continue the current regimen and low-sodium diet until our next scheduled clinic visit.")
            ));
        }

        if (patientNotificationRepository.count() == 0) {
            patientNotificationRepository.saveAll(List.of(
                new PatientNotification("NOTIF-8001", "P-1001", "PATIENT", "APPOINTMENT_REMINDER", "Upcoming Consultation with Dr. Rajesh Verma", "Your scheduled consultation is on 2026-09-08 at 10:00 AM in Room 304, West Wing.", "INFO", "/patient/appointments"),
                new PatientNotification("NOTIF-8002", "P-1001", "PATIENT", "RX_READY", "Prescription Refill Authorized", "Prescription RX-9402 has been refilled for 90 days supply.", "INFO", "/patient/prescriptions"),
                new PatientNotification("NOTIF-8003", "P-1001", "PATIENT", "LAB_RESULT", "Diagnostic Pathology Ready", "Lipid profile results have been reviewed and released by your physician.", "INFO", "/patient/records")
            ));
        }

        if (auditLogRepository.count() == 0) {
            auditLogRepository.saveAll(List.of(
                new AuditLog(UUID.randomUUID(), "D-201", "Dr. Rajesh Verma", "DOCTOR", "PRESCRIBE_MEDICATION", "Prescription", "RX-9402", "Issued Lisinopril 10mg, Atorvastatin 10mg. DDI check: SAFE.", "192.168.1.10"),
                new AuditLog(UUID.randomUUID(), "D-201", "Dr. Rajesh Verma", "DOCTOR", "FINALIZE_NOTE", "ClinicalNote", "CN-401", "SOAP note finalized and digitally signed.", "192.168.1.10"),
                new AuditLog(UUID.randomUUID(), "P-1001", "Ananya Sharma", "PATIENT", "VIEW_RECORD", "PatientRecord", "P-1001", "Patient viewed diagnostic reports via Patient Portal.", "10.0.0.45")
            ));
        }
    }

    private void seedHospitalPolicies() {
        UUID adminId = userRepository.findByEmailIgnoreCase("admin@apexcare.org")
            .map(AppUser::getId)
            .orElseGet(() -> userRepository.findAll().stream().findFirst().map(AppUser::getId).orElse(null));
        if (adminId == null) return;

        if (hospitalDocumentRepository.count() == 0) {
            List<HospitalDocument> policies = List.of(
                new HospitalDocument(
                    UUID.randomUUID(),
                    "Cardiology Inpatient Visiting Hours and Department SOP",
                    "Hospital Visiting Policy",
                    "Section 2.1 — Cardiology Inpatient Wards",
                    "ApexCare_Cardiology_Visiting_Policy_2026.pdf",
                    "v2.4",
                    hash("cardiology-visiting-hours-policy-content-text"),
                    """
                    ApexCare Hospital — Department of Cardiology Visiting Policy (Approved SOP v2.4):
                    1. General Inpatient Visiting Hours: General wards in the Cardiology Department (West Wing, 3rd Floor) are open to visitors daily from 11:00 AM to 01:00 PM and from 04:30 PM to 07:30 PM.
                    2. Coronary Care Unit (CCU) and Intensive Cardiac Care (ICCU): Visiting hours are strictly restricted to immediate family members from 11:30 AM to 12:00 PM and 05:00 PM to 05:30 PM (maximum 1 visitor per patient at a time).
                    3. Attending Physician Rounds: Visitors must vacate patient rooms during morning clinical rounds (09:00 AM to 10:30 AM).
                    4. Hygiene and Infection Control: All visitors must sanitize hands at the nurse reception station prior to entry. Masking is mandatory in all cardiac step-down suites.
                    """,
                    DocumentStatus.INDEXED,
                    adminId,
                    Instant.now()
                ),
                new HospitalDocument(
                    UUID.randomUUID(),
                    "Patient Diagnostic Imaging Preparation Protocol — MRI and Contrast Studies",
                    "Diagnostic Imaging SOP",
                    "Section 4.3 — Contrast Administration & MRI Clearance",
                    "MRI_Contrast_Prep_Guidelines_v3.pdf",
                    "v3.1",
                    hash("mri-contrast-prep-guidelines-content-text"),
                    """
                    ApexCare Diagnostic Radiology — Patient Preparation Protocol for Magnetic Resonance Imaging (MRI) with Contrast:
                    1. Fasting Requirement: Patients undergoing contrast-enhanced MRI must fast (no solid food) for at least 4 hours prior to scan appointment time. Clear water may be consumed up to 2 hours before the examination.
                    2. Renal Function Clearance: A serum creatinine and estimated GFR (eGFR) test performed within the preceding 30 days is mandatory for all patients aged 60+, diabetics, or those with known kidney disease. eGFR must exceed 30 mL/min/1.73m² for standard gadolinium contrast administration.
                    3. Metal and Implant Screening: Patients must remove all removable metallic accessories, piercings, dentures, and hearing aids. Patients with cardiac pacemakers, cochlear implants, or cerebral aneurysm clips require prior written radiologist clearance.
                    4. Post-Scan Hydration: Drink 1.5 to 2 liters of water over the 24 hours following contrast injection to facilitate renal clearance.
                    """,
                    DocumentStatus.INDEXED,
                    adminId,
                    Instant.now()
                )
            );

            hospitalDocumentRepository.saveAll(policies);
        }

        // Index all documents into VectorStore on startup
        vectorStore.ifPresent(store -> {
            try {
                List<HospitalDocument> docs = hospitalDocumentRepository.findAll();
                List<Document> chunks = new ArrayList<>();
                for (HospitalDocument doc : docs) {
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("documentId", doc.getId().toString());
                    metadata.put("title", doc.getTitle());
                    metadata.put("documentType", doc.getDocumentType());
                    metadata.put("section", doc.getSectionLabel());
                    metadata.put("version", doc.getDocumentVersion());
                    chunks.add(new Document(doc.getContent(), metadata));
                }
                store.add(chunks);
            } catch (Exception ignored) {}
        });
    }

    private String hash(String input) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256").digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "") + "00000000000000000000000000000000".substring(0, 32);
        }
    }
}
