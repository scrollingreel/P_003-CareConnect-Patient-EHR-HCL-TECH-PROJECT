// Realistic clinical mock database for ApexCare Hospital Management System

export const MOCK_DEPARTMENTS = [
  {
    id: 'dept-cardio',
    name: 'Cardiology',
    description: 'Advanced cardiovascular care, diagnostics, catheterization, and post-op rehabilitation.',
    icon: 'HeartPulse',
    headDoctor: 'Dr. Rajesh Verma, MD, FACC',
    floor: '3rd Floor, West Wing'
  },
  {
    id: 'dept-neuro',
    name: 'Neurology',
    description: 'Comprehensive neurological evaluation, stroke management, and neuro-diagnostics.',
    icon: 'Brain',
    headDoctor: 'Dr. Eleanor Vance, MD',
    floor: '4th Floor, East Wing'
  },
  {
    id: 'dept-ortho',
    name: 'Orthopedics & Sports Medicine',
    description: 'Joint reconstruction, fracture management, spinal surgery, and physiotherapy.',
    icon: 'Bone',
    headDoctor: 'Dr. Marcus Brody, MS Ortho',
    floor: '2nd Floor, South Wing'
  },
  {
    id: 'dept-pedia',
    name: 'Pediatrics & Neonatology',
    description: 'Child wellness, pediatric intensive care, immunization, and developmental health.',
    icon: 'Baby',
    headDoctor: 'Dr. Priya Sharma, MD (Peds)',
    floor: '1st Floor, North Wing'
  },
  {
    id: 'dept-genmed',
    name: 'General Internal Medicine',
    description: 'Preventative health assessments, chronic lifestyle disease management, and triage.',
    icon: 'Stethoscope',
    headDoctor: 'Dr. David Miller, MD',
    floor: 'Ground Floor, Central Wing'
  },
  {
    id: 'dept-onco',
    name: 'Medical Oncology',
    description: 'Targeted immunotherapy, systemic chemotherapy, and multidisciplinary tumor board.',
    icon: 'Activity',
    headDoctor: 'Dr. Sarah Al-Mansoor, MD, PhD',
    floor: '5th Floor, Cancer Care Pavilion'
  }
];

export const MOCK_DOCTORS = [
  {
    id: 'D-201',
    name: 'Dr. Rajesh Verma',
    title: 'MD, FACC - Senior Consultant',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology',
    specialization: 'Interventional Cardiology & Electrophysiology',
    experienceYears: 15,
    rating: 4.9,
    reviewCount: 342,
    consultationFee: 120,
    email: 'rajesh.verma@apexcare.org',
    phone: '+1 (555) 883-1120',
    room: 'Room 304, West Wing',
    availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timings: '09:00 AM - 04:30 PM',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'D-202',
    name: 'Dr. Eleanor Vance',
    title: 'MD, FAAN - Chief of Neurology',
    departmentId: 'dept-neuro',
    departmentName: 'Neurology',
    specialization: 'Stroke Intervention & Epilepsy',
    experienceYears: 18,
    rating: 4.95,
    reviewCount: 410,
    consultationFee: 150,
    email: 'eleanor.vance@apexcare.org',
    phone: '+1 (555) 883-1122',
    room: 'Room 412, East Wing',
    availabilityDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    timings: '10:00 AM - 05:00 PM',
    avatar: 'https://images.unsplash.com/photo-1594824813590-7892e62243d5?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'D-203',
    name: 'Dr. Marcus Brody',
    title: 'MS, MCh Ortho',
    departmentId: 'dept-ortho',
    departmentName: 'Orthopedics & Sports Medicine',
    specialization: 'Joint Replacement & Arthroscopy',
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 220,
    consultationFee: 110,
    email: 'marcus.brody@apexcare.org',
    phone: '+1 (555) 883-1125',
    room: 'Room 205, South Wing',
    availabilityDays: ['Monday', 'Wednesday', 'Friday'],
    timings: '08:30 AM - 03:30 PM',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'D-204',
    name: 'Dr. Priya Sharma',
    title: 'MD (Pediatrics)',
    departmentId: 'dept-pedia',
    departmentName: 'Pediatrics & Neonatology',
    specialization: 'Pediatric Cardiology & Neonatal Care',
    experienceYears: 9,
    rating: 4.88,
    reviewCount: 185,
    consultationFee: 95,
    email: 'priya.sharma@apexcare.org',
    phone: '+1 (555) 883-1128',
    room: 'Room 110, North Wing',
    availabilityDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    timings: '09:00 AM - 02:00 PM',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'D-205',
    name: 'Dr. David Miller',
    title: 'MD (Internal Medicine)',
    departmentId: 'dept-genmed',
    departmentName: 'General Internal Medicine',
    specialization: 'Adult Primary Care & Metabolic Syndrome',
    experienceYears: 14,
    rating: 4.75,
    reviewCount: 290,
    consultationFee: 85,
    email: 'david.miller@apexcare.org',
    phone: '+1 (555) 883-1130',
    room: 'Room 102, Central Wing',
    availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timings: '08:00 AM - 04:00 PM',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80'
  }
];

export const MOCK_CURRENT_PATIENT = {
  id: 'P-1001',
  name: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  dob: '1988-04-12',
  age: 38,
  gender: 'Female',
  bloodGroup: 'A+',
  phone: '+91 98765 43210',
  address: 'B-402, Green Glen Heights, Bengaluru, KA 560103',
  emergencyContact: {
    name: 'Rahul Sharma',
    relation: 'Spouse',
    phone: '+91 98765 43211'
  },
  insurance: {
    provider: 'Star Health Premier Comprehensive',
    policyNumber: 'SH-9928130',
    groupNumber: 'GRP-4412-APEX',
    status: 'Verified & Active',
    validUntil: '2027-12-31'
  },
  allergies: ['Penicillin (Moderate rash)', 'Peanuts (Mild)'],
  chronicConditions: ['Essential Hypertension', 'Mild Supraventricular Tachycardia (Controlled)'],
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
};

export const MOCK_DOCTOR_PATIENTS = [
  {
    patientId: 'P-1001',
    name: 'Ananya Sharma',
    age: 38,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 98765 43210',
    lastVisit: '2026-08-20',
    nextAppointment: 'Tomorrow, 10:00 AM',
    primaryDiagnosis: 'Hypertension & Palpitations',
    activePrescriptionCount: 3,
    riskLevel: 'Low-Moderate',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
  },
  {
    patientId: 'P-1002',
    name: 'Michael Chang',
    age: 56,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+1 (555) 432-8712',
    lastVisit: '2026-08-15',
    nextAppointment: '2026-09-12, 11:30 AM',
    primaryDiagnosis: 'Post-Percutaneous Coronary Intervention (Stent in LAD)',
    activePrescriptionCount: 4,
    riskLevel: 'Moderate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    patientId: 'P-1003',
    name: 'Arthur Pendelton',
    age: 67,
    gender: 'Male',
    bloodGroup: 'B-',
    phone: '+1 (555) 761-0982',
    lastVisit: '2026-08-02',
    nextAppointment: '2026-09-18, 02:00 PM',
    primaryDiagnosis: 'Ischemic Heart Disease & Grade 2 Heart Failure',
    activePrescriptionCount: 5,
    riskLevel: 'High',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  {
    patientId: 'P-1004',
    name: 'Fatima Zahra',
    age: 44,
    gender: 'Female',
    bloodGroup: 'AB+',
    phone: '+1 (555) 321-9944',
    lastVisit: '2026-07-28',
    nextAppointment: 'None scheduled',
    primaryDiagnosis: 'Dyslipidemia & Mitral Valve Prolapse (Mild)',
    activePrescriptionCount: 2,
    riskLevel: 'Low',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  }
];

export const MOCK_PATIENT_RECORDS = {
  'P-1001': {
    patient: MOCK_CURRENT_PATIENT,
    vitals: [
      { date: '2026-08-20', bp: '124/82 mmHg', hr: '74 bpm', spo2: '99%', temp: '98.4 F', weight: '64.2 kg', bmi: '22.8' },
      { date: '2026-06-14', bp: '136/88 mmHg', hr: '82 bpm', spo2: '98%', temp: '98.6 F', weight: '65.0 kg', bmi: '23.1' },
      { date: '2026-03-10', bp: '142/92 mmHg', hr: '88 bpm', spo2: '99%', temp: '98.2 F', weight: '66.1 kg', bmi: '23.5' }
    ],
    clinicalNotes: [
      {
        id: 'CN-401',
        date: '2026-08-20',
        doctorName: 'Dr. Rajesh Verma, MD',
        specialty: 'Cardiology',
        encounterType: 'Outpatient Follow-up',
        templateType: 'SOAP',
        summary: 'Follow-up on 24-hr Holter and Lisinopril dose adjustment.',
        details: 'Patient reports significant reduction in nocturnal palpitations. Blood pressure well controlled at 124/82 on Lisinopril 10mg. Holter monitor showed isolated PACs with no sustained tachyarrhythmias.',
        assessment: 'Essential Hypertension, Stage 1 (controlled). Benign Premature Atrial Contractions (PACs).',
        treatmentPlan: '1. Continue Lisinopril 10mg once daily in morning. 2. Low sodium diet (<2000mg/day). 3. Aerobic exercise 30 min daily. 4. Re-evaluate in 3 months.',
        status: 'Finalized',
        isFinalized: true,
        signedBy: 'Dr. Rajesh Verma, MD'
      },
      {
        id: 'CN-380',
        date: '2026-06-14',
        doctorName: 'Dr. Rajesh Verma, MD',
        specialty: 'Cardiology',
        encounterType: 'Outpatient Consultation',
        templateType: 'CARDIOLOGY_CONSULT',
        summary: 'Initial consultation for episodic palpitations and elevated BP.',
        details: 'Patient presents with a 2-month history of flutter sensations in the chest, particularly after work stress. No syncope or chest tightness.',
        assessment: 'New onset palpitations with untreated borderline hypertension.',
        treatmentPlan: 'Order complete lipid profile, 12-lead ECG, 2D Echo Doppler, and 24-hour Holter monitoring. Initiate Lisinopril 5mg.',
        status: 'Finalized',
        isFinalized: true,
        signedBy: 'Dr. Rajesh Verma, MD'
      }
    ],
    reports: [
      {
        id: 'REP-901',
        title: '2D Echocardiography & Color Doppler Report',
        date: '2026-08-18',
        category: 'Diagnostic Imaging',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        status: 'Reviewed',
        uploadedBy: 'Radiology Dept (Dr. K. Patel)',
        summary: null, // to be filled on demand by AI summarize
        rawContent: `ApexCare Hospital - Dept of Non-Invasive Cardiology
Patient: Ananya Sharma (P-1001) | DOB: 1988-04-12 | Study: 2D Transthoracic Echo
Findings:
- Left Ventricle: Normal cavity dimensions. LVEDD: 46 mm, LVESD: 28 mm. Normal wall thickness. Concentric remodeling absent.
- Systolic Function: Normal global left ventricular systolic function. LVEF visually estimated at 62% (Normal > 55%). No regional wall motion abnormalities at rest.
- Diastolic Function: Mitral E/A ratio 1.2, deceleration time 185 ms. Grade I diastolic relaxation pattern appropriate for age.
- Atria: Left atrium volume index 26 mL/m2 (normal). Right atrium normal.
- Valves:
  * Aortic Valve: Trileaflet, no stenosis, trivial physiological regurgitation. Peak gradient 6 mmHg.
  * Mitral Valve: Structurally normal leaflets. No prolapse. Trace regurgitation.
  * Tricuspid Valve: Structurally normal. Peak TR velocity 2.1 m/s. Estimated PASP 22 mmHg (normal pulmonary artery pressure).
- Pericardium: No pericardial effusion. Inferior vena cava collides > 50% with inspiration.
Conclusion: Normal LV and RV systolic function (LVEF 62%). No hemodynamically significant valvular lesions. No evidence of pulmonary hypertension.`,
        aiSummaryData: {
          executiveSummary: "Normal left ventricular systolic function (LVEF 62%) with no regional wall motion abnormalities or significant valvular disease.",
          keyFindings: [
            "Normal Left Ventricular Systolic Function (LVEF: 62%, normal range > 55%)",
            "No regional wall motion abnormalities at rest",
            "Trace/trivial physiological mitral and aortic regurgitation (clinically benign)",
            "Normal pulmonary artery systolic pressure (PASP 22 mmHg, no pulmonary hypertension)",
            "Normal chamber dimensions and absence of pericardial effusion"
          ],
          clinicalSignificance: "Findings rule out structural cardiomyopathy or valvular etiology as the cause for reported palpitations.",
          recommendations: "Continue conservative lifestyle management; correlate symptoms with 24-hour Holter findings."
        }
      },
      {
        id: 'REP-902',
        title: 'Comprehensive Metabolic & Lipid Panel',
        date: '2026-08-16',
        category: 'Laboratory Pathology',
        fileType: 'PDF',
        fileSize: '1.1 MB',
        status: 'Reviewed',
        uploadedBy: 'ApexCare Central Clinical Labs',
        summary: null,
        rawContent: `Comprehensive Metabolic & Fasting Lipid Profile
Specimen Collected: 2026-08-16 07:45 AM | Fasting Status: 12 Hours
Analyte | Value | Reference Range | Flag
Total Cholesterol: 218 mg/dL (<200) | HIGH
Triglycerides: 142 mg/dL (<150) | NORMAL
HDL Cholesterol: 54 mg/dL (>50) | NORMAL
LDL Cholesterol: 136 mg/dL (<100) | ELEVATED
VLDL: 28 mg/dL (5-30) | NORMAL
Total/HDL Ratio: 4.0 (<4.5) | OPTIMAL
Fasting Glucose: 91 mg/dL (70-99) | NORMAL
HbA1c: 5.4% (<5.7%) | NORMAL
Serum Creatinine: 0.82 mg/dL (0.6-1.1) | NORMAL
eGFR: >90 mL/min/1.73m2 (>60) | NORMAL
Serum Potassium: 4.4 mmol/L (3.5-5.1) | NORMAL
Serum Sodium: 140 mmol/L (135-145) | NORMAL
TSH (Thyroid): 2.1 uIU/mL (0.4-4.2) | NORMAL`,
        aiSummaryData: {
          executiveSummary: "Fasting lipid panel demonstrates borderline-elevated total cholesterol (218 mg/dL) and LDL (136 mg/dL); renal function, glucose, and electrolytes are completely normal.",
          keyFindings: [
            "Total Cholesterol: 218 mg/dL (Target < 200 mg/dL, High)",
            "LDL-C: 136 mg/dL (Target < 100 mg/dL, Elevated)",
            "Renal Function: Serum Creatinine 0.82 mg/dL with eGFR > 90 (Preserved renal health)",
            "Electrolytes: Potassium 4.4 mmol/L & Sodium 140 mmol/L (Safe for ACE-inhibitor therapy)",
            "Thyroid (TSH 2.1 uIU/mL): Euthyroid status confirms palpitations are non-thyroidal"
          ],
          clinicalSignificance: "Mild primary hyperlipidemia without glycemic impairment or electrolyte disturbances. Safe profile for ongoing Lisinopril therapy.",
          recommendations: "Encourage dietary saturated fat restriction; re-evaluate 10-year ASCVD risk for low-dose statin consideration."
        }
      },
      {
        id: 'REP-903',
        title: '24-Hour Ambulatory Holter ECG Monitoring',
        date: '2026-06-20',
        category: 'Cardiovascular Diagnostics',
        fileType: 'PDF',
        fileSize: '3.8 MB',
        status: 'Reviewed',
        uploadedBy: 'ApexCare Holter Lab',
        summary: null,
        rawContent: `ApexCare Hospital - 24 Hour Ambulatory Holter Analysis
Total Recording Duration: 23 hours 45 minutes
Total QRS complexes: 104,210
Minimum Heart Rate: 52 bpm (at 04:12 AM during sleep)
Maximum Heart Rate: 128 bpm (at 18:30 PM brisk walk)
Mean Heart Rate: 72 bpm
Arrhythmia Analysis:
- Ventricular: 14 isolated PVCs (<0.01% total burden). No couplets, triplets, or ventricular tachycardia.
- Supraventricular: 42 isolated PACs (<0.05% total burden). 1 run of 4 PACs at 14:15 PM (patient pressed event button noting 'slight flutter').
- Pauses: No sinus pauses > 2.0 seconds.
- ST-Segment: No diagnostic ischemic ST-T shifts detected.
Summary: Predominant sinus rhythm throughout with normal nocturnal bradycardia. Rare, benign isolated premature atrial contractions corresponding to transient awareness. No sustained supraventricular or ventricular arrhythmias.`,
        aiSummaryData: {
          executiveSummary: "Predominantly sinus rhythm with isolated, infrequent benign premature atrial contractions (<0.05% burden) and zero ventricular tachyarrhythmias or significant pauses.",
          keyFindings: [
            "Mean Heart Rate: 72 bpm with physiological nocturnal dip (min 52 bpm)",
            "Supraventricular Activity: 42 isolated PACs, 1 brief asymptomatic 4-beat run",
            "Ventricular Activity: 14 isolated PVCs (insignificant <0.01% burden)",
            "No sustained arrhythmias, heart blocks, or pauses > 2.0 seconds",
            "Event Correlation: Patient button press matched transient benign PAC sequence"
          ],
          clinicalSignificance: "Reassuring examination showing no malignant arrhythmia. Palpitation symptoms are benign and manageable with stress reduction and current beta-blocker/ACEI therapy.",
          recommendations: "Reassure patient regarding benign nature; avoid excessive caffeine and monitor stress triggers."
        }
      }
    ],
    prescriptions: [
      {
        id: 'RX-8821',
        date: '2026-08-20',
        doctorId: 'D-201',
        doctorName: 'Dr. Rajesh Verma, MD',
        doctorSpecialty: 'Cardiology',
        appointmentId: 'APT-101',
        status: 'Active',
        diagnosis: 'Essential Hypertension & Mild Palpitations',
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10 mg',
            form: 'Oral Tablet',
            frequency: 'Once daily in the morning',
            duration: '90 Days',
            quantity: '90 tablets',
            refills: 2,
            instructions: 'Take consistently with or without food. Monitor home BP weekly.'
          },
          {
            name: 'Atorvastatin Calcium',
            dosage: '10 mg',
            form: 'Oral Tablet',
            frequency: 'Once daily at bedtime',
            duration: '90 Days',
            quantity: '90 tablets',
            refills: 2,
            instructions: 'For hyperlipidemia management. Avoid grapefruit juice.'
          },
          {
            name: 'Metoprolol Tartrate',
            dosage: '25 mg',
            form: 'Oral Tablet',
            frequency: 'Twice daily with meals',
            duration: '30 Days',
            quantity: '60 tablets',
            refills: 1,
            instructions: 'Do not discontinue abruptly. Report pulse below 50 bpm.'
          }
        ],
        specialInstructions: 'Maintain low-sodium dietary habits (<2,000 mg/day). Follow up in 3 months with repeat basic metabolic panel.',
        signature: 'Digitally signed by Dr. Rajesh Verma, MD (License #MD-98442-IN)'
      },
      {
        id: 'RX-8104',
        date: '2026-06-14',
        doctorId: 'D-201',
        doctorName: 'Dr. Rajesh Verma, MD',
        doctorSpecialty: 'Cardiology',
        appointmentId: 'APT-092',
        status: 'Completed',
        diagnosis: 'Initial Hypertension Assessment',
        medications: [
          {
            name: 'Lisinopril',
            dosage: '5 mg',
            form: 'Oral Tablet',
            frequency: 'Once daily in the morning',
            duration: '60 Days',
            quantity: '60 tablets',
            refills: 0,
            instructions: 'Initial titration dose.'
          }
        ],
        specialInstructions: 'Return for 2D Echo and Holter testing.',
        signature: 'Digitally signed by Dr. Rajesh Verma, MD (License #MD-98442-IN)'
      }
    ],
    cpoeOrders: {
      labOrders: [
        { id: 'LAB-1001', testCode: 'LOINC-24331-1', testName: 'Comprehensive Lipid Profile', priority: 'Routine', clinicalIndication: 'Statin efficacy re-check', orderDate: '2026-08-16', status: 'Completed', specimenSource: 'Fasting Venous Serum' },
        { id: 'LAB-1002', testCode: 'LOINC-2823-3', testName: 'Serum Electrolytes & Renal Panel', priority: 'Routine', clinicalIndication: 'ACE-inhibitor potassium check', orderDate: '2026-08-16', status: 'Completed', specimenSource: 'Venous Plasma' },
        { id: 'LAB-1003', testCode: 'LOINC-4544-3', testName: 'Hemoglobin A1c (HbA1c)', priority: 'Routine', clinicalIndication: 'Metabolic baseline screening', orderDate: '2026-09-01', status: 'Ordered', specimenSource: 'Whole Blood' }
      ],
      imagingOrders: [
        { id: 'IMG-3001', modality: 'Echocardiography', bodySite: 'Transthoracic Cardiac Window', priority: 'Routine', clinicalIndication: 'Evaluate chamber structure and LVEF', orderDate: '2026-08-18', status: 'Completed', pacsAccessionNumber: 'ACC-774912' },
        { id: 'IMG-3002', modality: 'ECG', bodySite: '12-Lead Standard', priority: 'Routine', clinicalIndication: 'Palpitations follow-up', orderDate: '2026-08-18', status: 'Completed', pacsAccessionNumber: 'ACC-774913' }
      ],
      procedureOrders: [
        { id: 'PRC-5001', procedureName: '24-Hour Ambulatory Holter Monitor Attachment', category: 'Cardiovascular Diagnostics', scheduledDate: '2026-06-20', priority: 'Elective', preOpInstructions: 'Keep skin electrodes dry; maintain symptom diary.', status: 'Completed' }
      ]
    },
    medicationAdministrations: [
      { id: 'MAR-6001', prescriptionId: 'RX-8821', medicationName: 'Lisinopril', dosage: '10 mg', route: 'Oral', scheduledTime: '2026-08-20 08:00 AM', administeredTime: '2026-08-20 08:05 AM', administeredBy: 'Staff Nurse Deepa Nair', status: 'Administered', notes: 'Dose taken with water; pre-dose BP 124/82 mmHg.' },
      { id: 'MAR-6002', prescriptionId: 'RX-8821', medicationName: 'Atorvastatin Calcium', dosage: '10 mg', route: 'Oral', scheduledTime: '2026-08-20 09:00 PM', administeredTime: '2026-08-20 09:10 PM', administeredBy: 'Staff Nurse Deepa Nair', status: 'Administered', notes: 'Night dose administered with patient adherence confirmation.' },
      { id: 'MAR-6003', prescriptionId: 'RX-8821', medicationName: 'Metoprolol Tartrate', dosage: '25 mg', route: 'Oral', scheduledTime: '2026-08-20 08:00 AM', administeredTime: '2026-08-20 08:05 AM', administeredBy: 'Staff Nurse Deepa Nair', status: 'Administered', notes: 'Pulse 74 bpm prior to administration. Tolerated well.' }
    ],
    secureMessages: [
      { id: 'MSG-7001', senderId: 'P-1001', senderName: 'Ananya Sharma', senderRole: 'PATIENT', recipientId: 'D-201', recipientName: 'Dr. Rajesh Verma', recipientRole: 'DOCTOR', subject: 'Inquiry regarding blood pressure readings', body: 'Dear Dr. Verma, my morning blood pressure has averaged 122/80 over the last 2 weeks. The palpitations have also decreased significantly.', createdAt: '2026-08-22T09:30:00Z', isRead: true },
      { id: 'MSG-7002', senderId: 'D-201', senderName: 'Dr. Rajesh Verma', senderRole: 'DOCTOR', recipientId: 'P-1001', recipientName: 'Ananya Sharma', recipientRole: 'PATIENT', subject: 'Re: Inquiry regarding blood pressure readings', body: 'Hello Ananya, excellent news! Your numbers demonstrate great response to Lisinopril 10mg. Please continue the current regimen and low-sodium diet until our next scheduled clinic visit.', createdAt: '2026-08-22T11:45:00Z', isRead: true }
    ],
    notifications: [
      { id: 'NOTIF-8001', type: 'APPOINTMENT_REMINDER', title: 'Upcoming Consultation with Dr. Rajesh Verma', message: 'Your scheduled consultation is on 2026-09-08 at 10:00 AM in Room 304, West Wing.', severity: 'INFO', isRead: false },
      { id: 'NOTIF-8002', type: 'RX_READY', title: 'Prescription Refill Authorized', message: 'Prescription RX-8821 has been refilled for 90 days supply.', severity: 'INFO', isRead: true },
      { id: 'NOTIF-8003', type: 'LAB_RESULT', title: 'Diagnostic Pathology Ready', message: 'Lipid profile results have been reviewed and released by your physician.', severity: 'INFO', isRead: true }
    ]
  }
};

export const MOCK_APPOINTMENTS = [
  {
    id: 'APT-101',
    patientId: 'P-1001',
    patientName: 'Ananya Sharma',
    doctorId: 'D-201',
    doctorName: 'Dr. Rajesh Verma',
    departmentName: 'Cardiology',
    date: '2026-09-05',
    time: '10:00 AM',
    type: 'Follow-up Consultation',
    status: 'Scheduled',
    reason: 'Review 3-month BP log and medication response',
    room: 'Room 304, West Wing'
  },
  {
    id: 'APT-102',
    patientId: 'P-1001',
    patientName: 'Ananya Sharma',
    doctorId: 'D-205',
    doctorName: 'Dr. David Miller',
    departmentName: 'General Internal Medicine',
    date: '2026-09-18',
    time: '02:30 PM',
    type: 'Annual Preventative Checkup',
    status: 'Confirmed',
    reason: 'Routine annual physical and preventative wellness review',
    room: 'Room 102, Central Wing'
  },
  {
    id: 'APT-092',
    patientId: 'P-1001',
    patientName: 'Ananya Sharma',
    doctorId: 'D-201',
    doctorName: 'Dr. Rajesh Verma',
    departmentName: 'Cardiology',
    date: '2026-08-20',
    time: '09:30 AM',
    type: 'In-person Consultation',
    status: 'Completed',
    reason: 'Holter review and ECG check',
    room: 'Room 304, West Wing'
  },
  {
    id: 'APT-088',
    patientId: 'P-1001',
    patientName: 'Ananya Sharma',
    doctorId: 'D-201',
    doctorName: 'Dr. Rajesh Verma',
    departmentName: 'Cardiology',
    date: '2026-06-14',
    time: '11:00 AM',
    type: 'New Problem Consultation',
    status: 'Completed',
    reason: 'Initial evaluation for palpitations',
    room: 'Room 304, West Wing'
  },
  // Doctor Verma's Today Queue:
  {
    id: 'APT-DOC-01',
    patientId: 'P-1001',
    patientName: 'Ananya Sharma',
    doctorId: 'D-201',
    doctorName: 'Dr. Rajesh Verma',
    departmentName: 'Cardiology',
    date: '2026-09-04',
    time: '09:30 AM',
    type: 'Follow-up',
    status: 'In-Waiting',
    reason: 'Medication review and blood pressure log check',
    room: 'Room 304'
  },
  {
    id: 'APT-DOC-02',
    patientId: 'P-1002',
    patientName: 'Michael Chang',
    doctorId: 'D-201',
    doctorName: 'Dr. Rajesh Verma',
    departmentName: 'Cardiology',
    date: '2026-09-04',
    time: '10:30 AM',
    type: 'Post-Op Stent Check',
    status: 'Scheduled',
    reason: 'Post-PCI 6-week assessment & dual antiplatelet check',
    room: 'Room 304'
  },
  {
    id: 'APT-DOC-03',
    patientId: 'P-1003',
    patientName: 'Arthur Pendelton',
    doctorId: 'D-201',
    doctorName: 'Dr. Rajesh Verma',
    departmentName: 'Cardiology',
    date: '2026-09-04',
    time: '11:45 AM',
    type: 'Chronic Disease Review',
    status: 'Scheduled',
    reason: 'Congestive heart failure management & diuretic adjustment',
    room: 'Room 304'
  },
  {
    id: 'APT-DOC-04',
    patientId: 'P-1004',
    patientName: 'Fatima Zahra',
    doctorId: 'D-201',
    doctorName: 'Dr. Rajesh Verma',
    departmentName: 'Cardiology',
    date: '2026-09-04',
    time: '02:15 PM',
    type: 'Routine Follow-up',
    status: 'Scheduled',
    reason: 'Lipid panel check & lifestyle management',
    room: 'Room 304'
  }
];

// RAG Assistant Knowledge Store & Sample Responses
export const MOCK_RAG_CORPUS = [
  {
    keywords: ['visiting', 'hours', 'visitor', 'guest', 'cardiology'],
    answer: `At ApexCare Hospital, general visiting hours for inpatient wards and the Cardiology Step-Down Unit are **08:00 AM to 08:00 PM daily**. 

For the **Cardiac Intensive Care Unit (CICU)**, visits are restricted to immediate family members with designated time windows:
- Morning: **10:00 AM – 11:30 AM**
- Evening: **05:00 PM – 06:30 PM**

Maximum of two visitors per bedside are permitted at any given time. All visitors in cardiac units must sanitize hands and check in at the 3rd Floor West Wing Nursing Station.`,
    sources: [
      {
        id: 'DOC-SOP-01',
        documentName: 'ApexCare Inpatient Visitor Policy & Security SOP 2025-26',
        documentType: 'Hospital Administrative SOP',
        section: 'Section 4.2: Critical Care & Cardiology Ward Access',
        similarityScore: 0.96,
        snippet: 'General adult inpatient units permit visitors between 08:00 and 20:00. Cardiac Intensive Care Units (CICU, 3rd Floor West) restrict entry to 10:00-11:30 and 17:00-18:30 with a two-visitor ceiling per patient bed.'
      },
      {
        id: 'DOC-DEP-03',
        documentName: 'Cardiology Department Clinical Handbook',
        documentType: 'Departmental Guidelines',
        section: 'Nursing Protocol: Infection Control & Bedside Regulations',
        similarityScore: 0.91,
        snippet: 'Step-down telemetry beds observe normal hospital hours (08:00 to 20:00), requiring badge check-in at West Wing Station 3.'
      }
    ]
  },
  {
    keywords: ['prepare', 'mri', 'scan', 'imaging', 'fasting', 'metal'],
    answer: `Preparation guidelines for Magnetic Resonance Imaging (MRI) at ApexCare Diagnostic Center:

1. **Metal & Implant Screening:** Inform staff of any cardiac pacemakers, neurostimulators, cochlear implants, surgical clips, or metal fragments.
2. **Fasting Instructions:**
   - **Non-contrast MRI:** No dietary restrictions; you may eat and take prescribed medications normally.
   - **Contrast-enhanced MRI (Abdominal/Pelvic/Cardiac):** Strictly fast (no food or drinks except small sips of water) for **4 to 6 hours prior** to the appointment.
3. **Clothing:** Wear comfortable clothing without zippers, metallic snaps, or wire undergarments. A hospital gown is provided in changing suites.
4. **Arrival:** Arrive **30 minutes prior** to scheduled scan time for vital check and IV catheter placement if contrast is indicated.`,
    sources: [
      {
        id: 'DOC-RAD-04',
        documentName: 'ApexCare Diagnostic Imaging Patient Preparation Manual',
        documentType: 'Clinical Radiology Protocol',
        section: 'Chapter 2: Magnetic Resonance Imaging Safety & Prep',
        similarityScore: 0.98,
        snippet: 'Fasting protocol: When IV gadolinium contrast is ordered, patients must observe 4-6 hours NPO. Absolute contraindications include non-MRI-conditional pacemakers and ferromagnetic intracranial aneurysm clips.'
      },
      {
        id: 'DOC-RAD-07',
        documentName: 'Radiology Triage & Intake Checklist',
        documentType: 'Standard Operating Procedure',
        section: 'Intake Desk Check: Metallic Implants & Renal Function Review',
        similarityScore: 0.93,
        snippet: 'Patients aged 60+ or with known renal insufficiency must have a serum creatinine / eGFR drawn within 30 days prior to contrast administration.'
      }
    ]
  },
  {
    keywords: ['rajesh verma', 'robert chen', 'timings', 'opd', 'schedule', 'dr verma', 'dr chen', 'consulting'],
    answer: `**Dr. Rajesh Verma, MD, FACC** (Senior Consultant in Interventional Cardiology) conducts outpatient consultations on the following schedule:

- **Days:** Monday through Friday
- **OPD Timings:** **09:00 AM – 04:30 PM**
- **Location:** Consultation Room 304, 3rd Floor, West Wing
- **Procedure Days (Cath Lab / Angiographies):** Tuesday and Thursday mornings (07:30 AM – 09:30 AM)
- **Emergency Consultations:** Coordinated 24/7 via the ApexCare Cardiac Emergency Triage unit.`,
    sources: [
      {
        id: 'DOC-DIR-02',
        documentName: 'ApexCare Medical Staff Roster & OPD Directory Q3',
        documentType: 'Hospital Directory',
        section: 'Cardiovascular Institute Faculty & Clinic Hours',
        similarityScore: 0.97,
        snippet: 'Dr. Rajesh Verma, Room 304 West Wing. OPD clinic hours: Mon-Fri 09:00 - 16:30. Cath Lab sessions: Tue/Thu 07:30 - 09:30.'
      }
    ]
  },
  {
    keywords: ['insurance', 'pre-authorization', 'billing', 'coverage', 'cashless', 'claims'],
    answer: `ApexCare Hospital supports cashless hospitalization and direct billing with major healthcare networks, including BlueCross BlueShield, Aetna, Cigna, Medicare, and UnitedHealthcare.

**Pre-Authorization Workflow:**
1. **Elective Admissions & Procedures:** The attending physician files clinical notes with the Hospital Insurance Helpdesk (Ground Floor, Room 108) at least **72 hours in advance**.
2. **Emergency Admissions:** The hospital financial counseling team files emergency pre-authorization within **24 hours of bed admission**.
3. **Required Documentation:** Valid government ID, Insurance Card, and current physician consultation referral sheet.`,
    sources: [
      {
        id: 'DOC-FIN-01',
        documentName: 'Patient Financial Services & Commercial Insurance Guide',
        documentType: 'Billing & Compliance Manual',
        section: 'Section 3: Third-Party Payer Pre-Authorization Timelines',
        similarityScore: 0.95,
        snippet: 'Elective interventions mandate submission 72 hours prior to scheduled admission. Emergency admissions grant a 24-hour statutory notification window to third-party administrators.'
      },
      {
        id: 'DOC-ADM-09',
        documentName: 'ApexCare Patient Rights & Financial Disclosures',
        documentType: 'Patient Policy Document',
        section: 'Insurance Desk Operations & Co-pay Estimates',
        similarityScore: 0.89,
        snippet: 'The Insurance Helpdesk located on the Ground Floor Room 108 is staffed Monday-Saturday 07:00-20:00 for verification and claim processing.'
      }
    ]
  },
  {
    keywords: ['blood thinners', 'aspirin', 'lisinopril', 'interaction', 'medication'],
    answer: `Important safety guidance regarding blood thinners and cardiovascular medications:

- **Aspirin / Antiplatelet agents:** If you are scheduled for elective surgery, dental extraction, or invasive endoscopies, contact your prescribing cardiologist. Typically, temporary discontinuation is strictly timed (e.g. 5–7 days prior), but never stop antiplatelet therapy after recent stent placement without direct cardiologist authorization.
- **Lisinopril (ACE Inhibitor):** Avoid over-the-counter NSAIDs (like Ibuprofen, Naproxen) without doctor approval, as frequent NSAID use can reduce Lisinopril's antihypertensive effect and increase stress on the kidneys.
- **Potassium Supplements:** Do not consume high-dose potassium supplements or salt substitutes containing potassium chloride while on Lisinopril without monitoring serum potassium levels.`,
    sources: [
      {
        id: 'DOC-PHARM-05',
        documentName: 'Clinical Pharmacopeia & Drug-Drug Interaction Safety Matrix',
        documentType: 'Pharmacy Clinical Protocol',
        section: 'ACE Inhibitors & Dual Antiplatelet Management',
        similarityScore: 0.94,
        snippet: 'Concurrent administration of NSAIDs with ACE inhibitors attenuates antihypertensive response and heightens nephrotoxicity risk. Concomitant potassium-sparing agents require routine electrolyte surveillance.'
      },
      {
        id: 'DOC-CARD-12',
        documentName: 'Post-Percutaneous Coronary Intervention Discharge Guidelines',
        documentType: 'Clinical Practice Guideline',
        section: 'Patient Education: Antiplatelet Compliance & Surgical Bridging',
        similarityScore: 0.91,
        snippet: 'Premature cessation of DAPT (aspirin + P2Y12 inhibitor) within 6 months of DES deployment poses acute stent thrombosis risk.'
      }
    ]
  }
];

export let dynamicRagCorpus = [...MOCK_RAG_CORPUS];

export function getHospitalPolicyDocuments() {
  const docs = [];
  dynamicRagCorpus.forEach((item, index) => {
    (item.sources || []).forEach((src) => {
      docs.push({
        id: src.id || `DOC-${index}`,
        title: src.documentName,
        type: src.documentType || 'Clinical Policy',
        section: src.section,
        snippet: src.snippet,
        keywords: item.keywords || [],
        similarityScore: src.similarityScore || 0.95
      });
    });
  });
  return docs;
}

export function addHospitalPolicyDocument(policy) {
  const newEntry = {
    keywords: policy.keywords ? policy.keywords.split(',').map(k => k.trim().toLowerCase()) : [policy.title.toLowerCase()],
    answer: policy.content,
    sources: [
      {
        id: `DOC-POL-${Math.floor(100 + Math.random() * 900)}`,
        documentName: policy.title,
        documentType: policy.category || 'Hospital Policy SOP',
        section: policy.section || 'General Regulation',
        similarityScore: 0.97,
        snippet: policy.snippet || policy.content.slice(0, 180) + '...'
      }
    ]
  };
  dynamicRagCorpus.unshift(newEntry);
  return newEntry;
}

// Mock-only retrieval implementation. It deliberately abstains when it cannot
// find supporting corpus material; it must never invent a policy citation.
const RETRIEVAL_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'can', 'do', 'for', 'i', 'in', 'is', 'me',
  'of', 'on', 'or', 'the', 'to', 'what', 'when', 'where', 'with', 'would', 'you'
]);
const CLINICAL_DECISION_TERMS = [
  'diagnose', 'diagnosis', 'dosage', 'dose', 'prescribe', 'prescription',
  'medicine', 'medication', 'drug interaction', 'symptom', 'treatment',
  'should i take', 'can i take', 'ibuprofen', 'lisinopril', 'aspirin', 'nsaid',
  'antibiotic', 'insulin', 'tablet', 'capsule'
];

const normaliseTerms = (value = '') =>
  [...new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 2 && !RETRIEVAL_STOP_WORDS.has(term))
  )];

const getCorpusSearchText = (item) => [
  ...(item.keywords || []),
  item.answer || '',
  ...(item.sources || []).flatMap((source) => [
    source.documentName,
    source.section,
    source.snippet
  ])
].join(' ');

const scoreCorpusEntry = (query, item) => {
  const queryTerms = normaliseTerms(query);
  if (!queryTerms.length) return 0;

  const haystack = getCorpusSearchText(item).toLowerCase();
  const matchedTerms = queryTerms.filter((term) => haystack.includes(term));
  const keywordPhraseMatches = (item.keywords || []).filter((keyword) =>
    query.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  // Token overlap is transparent in this frontend demo. Production must use
  // embeddings plus a vector-store similarity threshold on the server.
  return Math.min(1, matchedTerms.length / queryTerms.length + keywordPhraseMatches * 0.12);
};

const isClinicalDecisionRequest = (query) => {
  const normalized = query.toLowerCase();
  return CLINICAL_DECISION_TERMS.some((term) => normalized.includes(term));
};

const notFoundResponse = (reason) => ({
  answer: `${reason}\n\nI can help with verified hospital information such as department hours, doctor schedules, insurance processes, visiting rules, and document-specific preparation instructions. Please contact a licensed clinician or the hospital helpdesk for anything outside those documents.`,
  sources: [],
  retrievalStatus: 'ABSTAINED',
  retrievalScore: 0,
  mode: 'mock-retrieval-demo'
});

/**
 * Deterministic mock RAG for the frontend demo.
 * It is intentionally not presented as an LLM or a vector database. The real
 * backend must retrieve from approved documents and generate only from them.
 */
export function generateRagResponseForQuery(query) {
  if (isClinicalDecisionRequest(query)) {
    return notFoundResponse(
      'I cannot provide diagnosis, medication, dosage, or treatment advice. This assistant is limited to hospital-information retrieval and is not a clinical decision-support tool.'
    );
  }

  const rankedEntries = dynamicRagCorpus
    .map((item) => ({ item, score: scoreCorpusEntry(query, item) }))
    .sort((a, b) => b.score - a.score);
  const bestMatch = rankedEntries[0];

  if (!bestMatch || bestMatch.score < 0.34) {
    return notFoundResponse(
      'I could not find a sufficiently relevant, verified hospital document for that question, so I will not guess.'
    );
  }

  return {
    ...bestMatch.item,
    sources: bestMatch.item.sources.map((source) => ({
      ...source,
      // A query-specific retrieval score is more honest than displaying a
      // static, pre-written confidence score as if it were an embedding score.
      similarityScore: Number(bestMatch.score.toFixed(2))
    })),
    retrievalStatus: 'GROUNDED',
    retrievalScore: Number(bestMatch.score.toFixed(2)),
    mode: 'mock-retrieval-demo'
  };
}

// Admin Analytics & Paper Evaluation Benchmark Data
export const MOCK_ANALYTICS_DATA = {
  isIllustrative: true,
  kpis: {
    totalAiQueries: 14820,
    queriesGrowthWoW: '+18.4%',
    averageResponseTimeMs: 382,
    latencyReduction: '-42ms',
    factualGroundednessScore: 98.4,
    groundednessGain: '+31.2% vs Plain LLM',
    userSatisfactionRate: 95.6,
    satisfactionResponsesCount: 4210,
    totalAppointmentsScheduled: 3410
  },
  // Paper Evaluation: RAG Assistant vs. Plain LLM (Zero-Shot Baseline) Accuracy & Hallucination Rate
  ragVsPlainComparison: [
    {
      domain: 'Hospital Policies & Timings',
      ragAccuracy: 99.2,
      plainLlmAccuracy: 58.4,
      ragHallucinationRate: 0.8,
      plainLlmHallucinationRate: 41.6
    },
    {
      domain: 'Medication Safety & Dosages',
      ragAccuracy: 98.7,
      plainLlmAccuracy: 64.1,
      ragHallucinationRate: 1.3,
      plainLlmHallucinationRate: 35.9
    },
    {
      domain: 'Insurance & Billing Rules',
      ragAccuracy: 97.9,
      plainLlmAccuracy: 49.3,
      ragHallucinationRate: 2.1,
      plainLlmHallucinationRate: 50.7
    },
    {
      domain: 'Diagnostic Prep Protocols',
      ragAccuracy: 99.0,
      plainLlmAccuracy: 66.8,
      ragHallucinationRate: 1.0,
      plainLlmHallucinationRate: 33.2
    },
    {
      domain: 'Doctor Schedules & OPD',
      ragAccuracy: 99.8,
      plainLlmAccuracy: 22.5,
      ragHallucinationRate: 0.2,
      plainLlmHallucinationRate: 77.5
    },
    {
      domain: 'Patient History Grounding',
      ragAccuracy: 96.5,
      plainLlmAccuracy: 31.0,
      ragHallucinationRate: 3.5,
      plainLlmHallucinationRate: 69.0
    }
  ],
  queryVolumeHistory: [
    { date: 'Aug 05', queries: 280, avgLatencyMs: 410, satisfaction: 94 },
    { date: 'Aug 10', queries: 340, avgLatencyMs: 395, satisfaction: 95 },
    { date: 'Aug 15', queries: 410, avgLatencyMs: 388, satisfaction: 94 },
    { date: 'Aug 20', queries: 460, avgLatencyMs: 385, satisfaction: 96 },
    { date: 'Aug 25', queries: 530, avgLatencyMs: 379, satisfaction: 96 },
    { date: 'Aug 30', queries: 610, avgLatencyMs: 380, satisfaction: 97 },
    { date: 'Sep 04', queries: 685, avgLatencyMs: 375, satisfaction: 96 }
  ],
  recentQueries: [
    {
      id: 'Q-9901',
      query: 'What are the visiting hours for the cardiology department?',
      userRole: 'Patient',
      timestamp: '10 minutes ago',
      latencyMs: 340,
      sourcesRetrieved: 2,
      status: 'Verified Grounded',
      feedback: 'positive'
    },
    {
      id: 'Q-9902',
      query: 'What should a patient do to prepare for an MRI scan with contrast?',
      userRole: 'Patient',
      timestamp: '28 minutes ago',
      latencyMs: 385,
      sourcesRetrieved: 2,
      status: 'Verified Grounded',
      feedback: 'positive'
    },
    {
      id: 'Q-9903',
      query: 'Does Dr. Rajesh Verma conduct OPD consultations on Fridays?',
      userRole: 'Doctor Assistant',
      timestamp: '1 hour ago',
      latencyMs: 295,
      sourcesRetrieved: 1,
      status: 'Verified Grounded',
      feedback: 'positive'
    },
    {
      id: 'Q-9904',
      query: 'What is the required window for emergency insurance pre-authorization?',
      userRole: 'Admin Staff',
      timestamp: '2 hours ago',
      latencyMs: 410,
      sourcesRetrieved: 2,
      status: 'Verified Grounded',
      feedback: 'positive'
    },
    {
      id: 'Q-9905',
      query: 'Can NSAIDs like Ibuprofen be taken concurrently with Lisinopril?',
      userRole: 'Patient',
      timestamp: '3 hours ago',
      latencyMs: 420,
      sourcesRetrieved: 2,
      status: 'Verified Grounded',
      feedback: 'positive'
    }
  ]
};
