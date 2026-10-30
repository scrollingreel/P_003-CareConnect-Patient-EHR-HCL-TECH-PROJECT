# CareConnect (EHRS01) — Database Design Specification & Schema Alignment

**Project Code:** EHRS01  
**Database Engine:** Relational Database (H2 PostgreSQL Compatibility Mode for Development / PostgreSQL 16 for Production)  
**ORM Framework:** Hibernate 6.6 / Spring Data JPA  
**Migration Tool:** Flyway (Migrations V1, V2, V3)  

---

## 1. Entity-Relationship Mapping & Alignment Matrix

This section maps the actual CareConnect database schema against the official HCL database reference requirements.

| HCL Reference Entity | Implemented Table Name | JPA Domain Class | Entity Classification | Primary Key | Foreign Keys & Relationships |
|---|---|---|---|---|---|
| **Users** | `app_users` | `AppUser` | Core Entity | `id` (UUID) | Root user accounts with credentials and roles |
| **Roles** | `app_users.role` / `UserRole` | `UserRole` (Enum) | Core Entity | Enum Value | `PATIENT`, `DOCTOR`, `ADMIN` |
| **Patients** | `patient_profiles` | `PatientProfile` | Core Entity | `id` (VARCHAR 50) | FK `user_id` → `app_users(id)` |
| **MedicalHistory** | `patient_profiles` (JSON fields) | `PatientProfile` | Core Entity | Embedded | Stored in `allergies_json`, `chronic_conditions_json` |
| **Providers** | `doctors` | `Doctor` | Core Entity | `id` (VARCHAR 50) | FK `department_id` → `departments(id)` |
| **Appointments** | `appointments` | `Appointment` | Core Entity | `id` (VARCHAR 50) | FK `doctor_id` → `doctors(id)`, Links `patient_id` |
| **EncounterNotes** | `clinical_notes` | `ClinicalNote` | Core Entity | `id` (VARCHAR 50) | Links `patient_id`, records doctor, template, assessment, plan |
| **Medications** | `medications_catalog` | `MedicationCatalog` | Core Entity | `id` (VARCHAR 50) | Master catalog with RxNorm codes and strengths |
| **Prescriptions** | `prescriptions` | `Prescription` | Core Entity | `id` (VARCHAR 50) | Links `patient_id`, `doctor_id`, `appointment_id` |
| **LabOrders** | `lab_orders` | `LabOrder` | Core Entity | `id` (VARCHAR 50) | FK `patient_id` → `patient_profiles(id)`, FK `doctor_id` → `doctors(id)` |
| **LabResults** | `lab_results` | `LabResult` | Core Entity | `id` (VARCHAR 50) | FK `order_id` → `lab_orders(id)`, FK `patient_id` → `patient_profiles(id)` |
| **InsuranceDetails** | `patient_profiles.insurance_json` | `PatientProfile` | Additional Entity | Embedded | Policy number, group number, provider, active status |
| **Diagnoses** | `prescriptions.diagnosis` / `clinical_notes.assessment` | `Prescription` / `ClinicalNote` | Additional Entity | Text / JSON | Formal ICD-compatible diagnostic indications |
| **Allergies** | `patient_profiles.allergies_json` | `PatientProfile` | Additional Entity | JSON Array | Tracked during prescription DDI checks |
| **VitalSigns** | `patient_vitals` | `PatientVital` | Additional Entity | `id` (UUID) | Links `patient_id` with longitudinal BP, HR, SpO2, BMI |
| **ImagingOrders** | `imaging_orders` | `ImagingOrder` | Additional Entity | `id` (VARCHAR 50) | FK `patient_id` → `patient_profiles(id)`, FK `doctor_id` → `doctors(id)` |
| **ImagingResults** | `imaging_results` | `ImagingResult` | Additional Entity | `id` (VARCHAR 50) | FK `order_id` → `imaging_orders(id)`, FK `patient_id` → `patient_profiles(id)` |
| **MedicationAdministrations** | `medication_administrations` | `MedicationAdministration` | Additional Entity | `id` (VARCHAR 50) | FK `patient_id` → `patient_profiles(id)`, FK `prescription_id` → `prescriptions(id)` |
| **Notifications** | `patient_notifications` | `PatientNotification` | Additional Entity | `id` (VARCHAR 50) | Links `user_id` with alert type, severity, and action URL |
| **AuditLogs** | `audit_logs` | `AuditLog` | Additional Entity | `id` (UUID) | Immutable audit trail for all critical clinical events |
| **SecureMessages** | `secure_messages` | `SecureMessage` | Additional Entity | `id` (VARCHAR 50) | FK `patient_id` → `patient_profiles(id)`, links sender/recipient |

---

## 2. Database Schema Definition & Integrity Constraints

### 2.1 Core Relational Tables (Flyway V1, V2, V3)

```sql
-- 1. App Users (Authentication & Credentials)
CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    head_doctor VARCHAR(100),
    floor VARCHAR(100)
);

-- 3. Providers / Doctors
CREATE TABLE doctors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    department_id VARCHAR(50) REFERENCES departments(id),
    department_name VARCHAR(100),
    specialization VARCHAR(150),
    experience_years INT,
    rating DOUBLE PRECISION,
    review_count INT,
    consultation_fee DOUBLE PRECISION,
    email VARCHAR(254),
    phone VARCHAR(50),
    room VARCHAR(100),
    availability_days TEXT,
    timings VARCHAR(100),
    avatar TEXT
);

-- 4. Patients (Demographics, Insurance, History)
CREATE TABLE patient_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES app_users(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254),
    dob VARCHAR(20),
    age INT,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    phone VARCHAR(50),
    address TEXT,
    emergency_contact_json TEXT,
    insurance_json TEXT,
    allergies_json TEXT,
    chronic_conditions_json TEXT,
    avatar TEXT
);

-- 5. Appointments
CREATE TABLE appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(100),
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id),
    doctor_name VARCHAR(100),
    department_name VARCHAR(100),
    appointment_date VARCHAR(20) NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    type VARCHAR(50),
    status VARCHAR(30) NOT NULL,
    reason TEXT,
    notes TEXT,
    room VARCHAR(100),
    cancel_reason TEXT,
    attached_reports_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Clinical Encounter Notes (With Templates & Immutability)
CREATE TABLE clinical_notes (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    date VARCHAR(20) NOT NULL,
    doctor_name VARCHAR(100),
    specialty VARCHAR(100),
    summary TEXT,
    details TEXT,
    encounter_type VARCHAR(50) DEFAULT 'Outpatient Follow-up',
    template_type VARCHAR(50) DEFAULT 'SOAP',
    assessment TEXT,
    treatment_plan TEXT,
    status VARCHAR(30) DEFAULT 'Finalized',
    is_finalized BOOLEAN DEFAULT TRUE,
    finalized_at TIMESTAMP WITH TIME ZONE,
    signed_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Prescriptions
CREATE TABLE prescriptions (
    id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50),
    doctor_name VARCHAR(100),
    doctor_specialty VARCHAR(100),
    patient_id VARCHAR(50) NOT NULL,
    appointment_id VARCHAR(50),
    status VARCHAR(30) NOT NULL,
    diagnosis TEXT,
    special_instructions TEXT,
    signature TEXT,
    medications_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. CPOE Laboratory Orders
CREATE TABLE lab_orders (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patient_profiles(id),
    doctor_id VARCHAR(50) REFERENCES doctors(id),
    test_code VARCHAR(50),
    test_name VARCHAR(150) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Routine',
    clinical_indication TEXT,
    order_date VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Ordered',
    specimen_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Laboratory Diagnostic Results (With Panic Value Flags)
CREATE TABLE lab_results (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES lab_orders(id),
    patient_id VARCHAR(50) NOT NULL REFERENCES patient_profiles(id),
    test_name VARCHAR(150) NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    result_value VARCHAR(50) NOT NULL,
    unit VARCHAR(30),
    reference_range VARCHAR(50),
    abnormal_flag VARCHAR(20),
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    critical_alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
    performed_at VARCHAR(30),
    verified_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. CPOE Imaging Orders
CREATE TABLE imaging_orders (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patient_profiles(id),
    doctor_id VARCHAR(50) REFERENCES doctors(id),
    modality VARCHAR(50) NOT NULL,
    body_site VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Routine',
    clinical_indication TEXT,
    order_date VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Ordered',
    pacs_accession_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Imaging Diagnostic Results
CREATE TABLE imaging_results (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES imaging_orders(id),
    patient_id VARCHAR(50) NOT NULL REFERENCES patient_profiles(id),
    modality VARCHAR(50) NOT NULL,
    study_title VARCHAR(200) NOT NULL,
    findings TEXT NOT NULL,
    impression TEXT NOT NULL,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    critical_alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
    radiologist_name VARCHAR(100),
    pacs_image_url VARCHAR(255),
    performed_at VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Medication Administration Records (MAR)
CREATE TABLE medication_administrations (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patient_profiles(id),
    prescription_id VARCHAR(50) REFERENCES prescriptions(id),
    medication_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    route VARCHAR(50) DEFAULT 'Oral',
    scheduled_time VARCHAR(30) NOT NULL,
    administered_time VARCHAR(30),
    administered_by VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Administered',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Secure Patient-Provider Messages
CREATE TABLE secure_messages (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patient_profiles(id),
    sender_id VARCHAR(50) NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_role VARCHAR(20) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifications
CREATE TABLE patient_notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    recipient_role VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100),
    user_role VARCHAR(20) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Performance Indexes

```sql
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_results_order ON lab_results(order_id);
CREATE INDEX idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX idx_imaging_orders_patient ON imaging_orders(patient_id);
CREATE INDEX idx_imaging_results_order ON imaging_results(order_id);
CREATE INDEX idx_mar_patient ON medication_administrations(patient_id);
CREATE INDEX idx_messages_patient ON secure_messages(patient_id);
CREATE INDEX idx_notifications_user ON patient_notifications(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

---

## 3. Database Views & Equivalent Query Services

Per HCL specification guidelines, the 4 required relational views are implemented both as SQL DDL views in migration `V3__hcl_ehrs01_entities.sql` and as high-performance transactional Spring service methods in `HospitalService.java`:

### 3.1 View 1: `PatientSummary`
- **SQL Definition:** `view_patient_summary`
- **Service Endpoint:** `GET /api/views/patient-summary/{patientId}`
- **Purpose:** Aggregates core demographics, upcoming appointment counts, active prescription tallies, pending laboratory orders, and latest vital sign readings in a single low-latency query.

### 3.2 View 2: `ProviderSchedule`
- **SQL Definition:** `view_provider_schedule`
- **Service Endpoint:** `GET /api/views/provider-schedule/{doctorId}`
- **Purpose:** Joins doctor profiles, scheduled consultations, patient demographic identifiers, appointment times, and clinical indications for the daily OPD queue.

### 3.3 View 3: `MedicationHistory`
- **SQL Definition:** `view_medication_history`
- **Service Endpoint:** `GET /api/views/medication-history/{patientId}`
- **Purpose:** Compiles longitudinal prescriptions, prescribing physicians, diagnoses, dosages, and corresponding MAR administration events for medication reconciliation.

### 3.4 View 4: `LabOrdersAndResults`
- **SQL Definition:** `view_lab_orders_and_results`
- **Service Endpoint:** `GET /api/views/lab-orders-and-results/{patientId}`
- **Purpose:** Left-joins CPOE lab orders with verified diagnostic results, parameter names, reference ranges, abnormal flags, and critical panic value statuses.

---

## 4. Business Operations Implementation

The 7 suggested HCL business operations are implemented as validated, `@Transactional` service-layer operations in `HospitalService.java`:

1. **`RegisterPatient`** (`registerPatientProfile`):
   - Validates personal demographics, emergency contact, and insurance details.
   - Inserts into `patient_profiles`.
   - Records event in `audit_logs`.

2. **`ScheduleAppointment`** (`bookAppointment`):
   - Verifies physician schedule and time slot availability.
   - Saves record in `appointments`.
   - Generates automated appointment reminder in `patient_notifications`.
   - Records event in `audit_logs`.

3. **`CreateEncounterNote`** (`createEncounterNote` / `updateEncounterNote`):
   - Applies specialty templates (SOAP, Cardiology, Follow-up).
   - Validates note finalization: if `isFinalized == true`, prevents silent overwrite (enforcing record immutability with HTTP 409 Conflict).
   - Records physician digital signature and audit event.

4. **`PrescribeMedication`** (`createPrescription`):
   - Invokes `DrugInteractionService` to screen proposed drugs against active prescriptions and documented patient allergies (NLM RxNorm standard gateway).
   - Saves record in `prescriptions`.
   - Generates initial MAR schedule entries in `medication_administrations`.
   - Dispatches prescription notification and writes audit log.

5. **`OrderLabTest`** (`orderLabTest` / `orderImaging` / `orderProcedure`):
   - Captures order priority (STAT, Urgent, Routine), clinical indication, and specimen/modality.
   - Generates CPOE records in `lab_orders` or `imaging_orders`.
   - Dispatches simulated LIS/PACS queue transmissions and writes audit log.

6. **`RecordLabResults`** (`recordLabResult` / `recordImagingResult`):
   - Records observation values, units, and reference ranges.
   - Evaluates panic value criteria: if critical, immediately generates priority `CRITICAL_ALERT` in `patient_notifications`.
   - Updates order status to `Completed` and writes audit log.

7. **`UserManagement`** (`listUsers` / `AuthService`):
   - Enforces BCrypt password hashing (strength 12).
   - Issues HMAC-SHA256 stateless JWT tokens with role context.
   - Enforces RBAC permissions across all endpoints.
