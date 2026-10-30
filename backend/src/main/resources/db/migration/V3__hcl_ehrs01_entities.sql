-- =========================================================================
-- V3__hcl_ehrs01_entities.sql
-- CareConnect (EHRS01) - HCL Healthcare Requirements Alignment Migration
-- Epics Covered: CPOE (Epic 3), Medication Management (Epic 4),
-- Lab & Imaging Integration (Epic 5), System Integration (Epic 6),
-- Patient Portal & Secure Messaging (Epic 7)
-- =========================================================================

-- 1. Enhance Clinical Notes for Epic 2 (Templates, Finalization, Immutability)
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS encounter_type VARCHAR(50) DEFAULT 'Outpatient Follow-up';
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) DEFAULT 'SOAP';
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS assessment TEXT;
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS treatment_plan TEXT;
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Finalized';
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS is_finalized BOOLEAN DEFAULT TRUE;
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS signed_by VARCHAR(150);

-- 2. CPOE: Laboratory Orders (Epic 3 & Epic 5)
CREATE TABLE IF NOT EXISTS lab_orders (
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

-- 3. Laboratory Diagnostic Results (Epic 5)
CREATE TABLE IF NOT EXISTS lab_results (
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

-- 4. CPOE: Imaging Orders (Epic 3 & Epic 5)
CREATE TABLE IF NOT EXISTS imaging_orders (
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

-- 5. Imaging Diagnostic Results (Epic 5)
CREATE TABLE IF NOT EXISTS imaging_results (
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

-- 6. CPOE: Procedure Orders (Epic 3)
CREATE TABLE IF NOT EXISTS procedure_orders (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patient_profiles(id),
    doctor_id VARCHAR(50) REFERENCES doctors(id),
    procedure_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    scheduled_date VARCHAR(20),
    priority VARCHAR(20) DEFAULT 'Elective',
    pre_op_instructions TEXT,
    status VARCHAR(30) DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Medication Administration Records (MAR) (Epic 4)
CREATE TABLE IF NOT EXISTS medication_administrations (
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

-- 8. Medications Master Catalog (Epic 4)
CREATE TABLE IF NOT EXISTS medications_catalog (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    generic_name VARCHAR(150) NOT NULL,
    brand_name VARCHAR(150),
    dosage_forms VARCHAR(100),
    standard_strength VARCHAR(50),
    therapeutic_class VARCHAR(100),
    requires_prescription BOOLEAN DEFAULT TRUE
);

-- 9. Secure Patient-Provider Messages (Epic 7)
CREATE TABLE IF NOT EXISTS secure_messages (
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

-- 10. Patient & Clinician Notifications (Epic 6 & Epic 7)
CREATE TABLE IF NOT EXISTS patient_notifications (
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

-- 11. System Audit Logs (Epic 6)
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Indices
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_order ON lab_results(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_patient ON imaging_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_results_order ON imaging_results(order_id);
CREATE INDEX IF NOT EXISTS idx_mar_patient ON medication_administrations(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_patient ON secure_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON patient_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- =========================================================================
-- HCL Database Design Views
-- =========================================================================

-- View 1: PatientSummary
CREATE VIEW IF NOT EXISTS view_patient_summary AS
SELECT 
    p.id AS patient_id,
    p.name AS patient_name,
    p.dob,
    p.age,
    p.gender,
    p.blood_group,
    p.phone,
    p.email,
    p.allergies_json,
    p.chronic_conditions_json,
    (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id AND a.status = 'Scheduled') AS upcoming_appointments_count,
    (SELECT COUNT(*) FROM prescriptions rx WHERE rx.patient_id = p.id AND rx.status = 'Active') AS active_prescriptions_count,
    (SELECT COUNT(*) FROM lab_orders lo WHERE lo.patient_id = p.id AND lo.status IN ('Ordered', 'In Progress')) AS pending_lab_orders_count
FROM patient_profiles p;

-- View 2: ProviderSchedule
CREATE VIEW IF NOT EXISTS view_provider_schedule AS
SELECT 
    d.id AS doctor_id,
    d.name AS doctor_name,
    d.department_name,
    d.room,
    a.id AS appointment_id,
    a.patient_id,
    a.patient_name,
    a.appointment_date,
    a.appointment_time,
    a.type AS appointment_type,
    a.status AS appointment_status,
    a.reason AS consultation_reason
FROM doctors d
JOIN appointments a ON d.id = a.doctor_id;

-- View 3: MedicationHistory
CREATE VIEW IF NOT EXISTS view_medication_history AS
SELECT 
    rx.id AS prescription_id,
    rx.patient_id,
    p.name AS patient_name,
    rx.doctor_id,
    rx.doctor_name,
    rx.doctor_specialty,
    rx.date AS prescribed_date,
    rx.status AS prescription_status,
    rx.diagnosis,
    rx.medications_json,
    rx.special_instructions
FROM prescriptions rx
JOIN patient_profiles p ON rx.patient_id = p.id;

-- View 4: LabOrdersAndResults
CREATE VIEW IF NOT EXISTS view_lab_orders_and_results AS
SELECT 
    lo.id AS order_id,
    lo.patient_id,
    p.name AS patient_name,
    lo.doctor_id,
    lo.test_name,
    lo.priority,
    lo.order_date,
    lo.status AS order_status,
    lr.id AS result_id,
    lr.parameter_name,
    lr.result_value,
    lr.unit,
    lr.reference_range,
    lr.abnormal_flag,
    lr.is_critical,
    lr.performed_at
FROM lab_orders lo
JOIN patient_profiles p ON lo.patient_id = p.id
LEFT JOIN lab_results lr ON lo.id = lr.order_id;
