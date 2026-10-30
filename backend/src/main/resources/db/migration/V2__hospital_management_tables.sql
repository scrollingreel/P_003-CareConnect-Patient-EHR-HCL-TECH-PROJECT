CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    head_doctor VARCHAR(100),
    floor VARCHAR(100)
);

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

CREATE TABLE patient_vitals (
    id UUID PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    date VARCHAR(20) NOT NULL,
    bp VARCHAR(30),
    hr VARCHAR(30),
    spo2 VARCHAR(30),
    temp VARCHAR(30),
    weight VARCHAR(30),
    bmi VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clinical_notes (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    date VARCHAR(20) NOT NULL,
    doctor_name VARCHAR(100),
    specialty VARCHAR(100),
    summary TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patient_reports (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    date VARCHAR(20) NOT NULL,
    category VARCHAR(100),
    file_type VARCHAR(50),
    file_size VARCHAR(50),
    file_name VARCHAR(200),
    status VARCHAR(50),
    uploaded_by VARCHAR(150),
    raw_content TEXT,
    ai_summary_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_reports_patient ON patient_reports(patient_id);
