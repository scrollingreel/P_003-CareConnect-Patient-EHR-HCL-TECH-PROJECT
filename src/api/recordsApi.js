import { apiClient, USE_MOCK, simulateDelay } from './client';
import { MOCK_DOCTOR_PATIENTS, MOCK_PATIENT_RECORDS } from './mockData';

const RECORDS_STORAGE_KEY = 'apexcare_patient_records';

const loadRecordsStore = () => {
  try {
    const saved = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read patient records from localStorage:', e);
  }
  const initial = JSON.parse(JSON.stringify(MOCK_PATIENT_RECORDS));
  saveRecordsStore(initial);
  return initial;
};

const saveRecordsStore = (store) => {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to write patient records to localStorage:', e);
  }
};

// Initialize mutable store
let patientRecordsStore = loadRecordsStore();

/*
 * Removed legacy mock "clinical summary" generator.
 * Filename-based fabricated findings are unsafe and cannot be used in a
 * healthcare prototype. The mock implementation below returns metadata only.
 *
function legacyUnsafeClinicalSummary(reportData) {
  const title = (reportData.title || '').toLowerCase();
  const category = (reportData.category || '').toLowerCase();
  const notes = (reportData.notes || reportData.rawContent || '').toLowerCase();
  const fileName = (reportData.fileName || '').toLowerCase();

  const isCervicalSpine =
    title.includes('cervical') ||
    title.includes('neck') ||
    title.includes('c-spine') ||
    title.includes('c spine') ||
    notes.includes('cervical') ||
    notes.includes('neck') ||
    fileName.includes('cervical') ||
    fileName.includes('neck') ||
    fileName.includes('spine');

  const isXRayOrRadiography =
    isCervicalSpine ||
    title.includes('x-ray') ||
    title.includes('xray') ||
    title.includes('radiograph') ||
    title.includes('chest x') ||
    category.includes('imaging') ||
    notes.includes('x-ray') ||
    fileName.includes('xray') ||
    fileName.includes('x-ray');

  const isCardiacOrEcho =
    title.includes('echo') ||
    title.includes('holter') ||
    title.includes('ecg') ||
    title.includes('ekg') ||
    title.includes('cardio') ||
    category.includes('cardiovascular');

  const isPathologyOrBlood =
    title.includes('blood') ||
    title.includes('lipid') ||
    title.includes('metabolic') ||
    title.includes('cbc') ||
    title.includes('urine') ||
    title.includes('lft') ||
    title.includes('kft') ||
    title.includes('pathology') ||
    category.includes('pathology') ||
    category.includes('laboratory');

  // Case 1: Cervical Spine X-Ray / Radiography (Matches Plain C-Spine Radiograph)
  if (isCervicalSpine) {
    return {
      modalityBasis: 'Digital Plain Radiography — Cervical Spine (AP & Lateral Projections)',
      groundingProtocol: 'ACR Appropriateness Criteria® — Cervical Spine Trauma & Degenerative Disorders',
      executiveSummary:
        'Radiographic examination of the cervical spine (AP and Lateral projections) demonstrates mild straightening of the physiological cervical lordosis, consistent with acute paracervical muscle spasm or postural strain. Mild intervertebral disc space narrowing is noted at the C5-C6 and C6-C7 levels accompanied by subtle anterior osteophytic lipping (early cervical spondylosis). Vertebral body heights and axial alignment are intact with no acute fracture, subluxation, or destructive osseous lesions.',
      keyFindings: [
        'Curvature & Alignment: Straightening of the normal cervical lordotic curvature, indicative of muscular spasm / acute cervical strain',
        'Vertebral Bodies: Heights and cortical outlines of C1 through C7 vertebrae are preserved with intact trabecular architecture',
        'Disc Spaces: Mild reduction in intervertebral disc height noted at C5-C6 and C6-C7; remaining cervical disc spaces preserved',
        'Degenerative Features: Subtle anterior osteophytic lipping and mild endplate sclerosis at C5-C7 (early cervical spondylosis)',
        'Trauma / Stability: No acute cortical disruption, fracture lines, or atlantoaxial / subaxial listhesis identified',
        'Soft Tissues: Prevertebral soft tissue contour is within normal anatomical limits without prevertebral hematoma'
      ],
      clinicalSignificance:
        'Radiological findings represent mild degenerative cervical spondylosis with reactive paracervical muscle spasm. Explains localized neck stiffness and restricted range of motion while definitively ruling out acute traumatic cervical instability or acute bone fracture.',
      recommendations:
        'Conservative clinical management: short-term analgesic/muscle relaxant therapy, cervical postural ergonomics, and gentle cervical physiotherapy. Recommend clinical correlation; if radicular numbness or radiating arm pain develops, correlate clinically and consider MRI Cervical Spine.'
    };
  }

  // Case 2: Chest or General X-Ray / Radiography
  if (isXRayOrRadiography) {
    const isChest = title.includes('chest') || notes.includes('chest') || title.includes('lung') || fileName.includes('chest');
    if (isChest) {
      return {
        modalityBasis: 'Digital Radiography — Chest PA (Posteroanterior) Projection',
        groundingProtocol: 'Fleischner Society Guidelines & ACR Chest Imaging Standards',
        executiveSummary:
          'Frontal chest radiograph reveals clear lung parenchyma bilaterally with no focal alveolar consolidation, pleural effusion, or pneumothorax. Cardiothoracic ratio is within normal limits (CTR < 0.50). Mediastinal contour, hila, and osseous structures are unremarkable.',
        keyFindings: [
          'Lung Fields: Bilateral lung zones are clear and well-aerated with normal bronchovascular markings',
          'Pleura & Costophrenic Angles: Bilateral costophrenic and cardiophrenic angles are sharp and clear',
          'Cardiovascular Silhouette: Normal cardiac size with cardiothoracic ratio < 0.50; aortic knuckle unremarkable',
          'Bony Thorax & Soft Tissues: Rib cage, clavicles, and soft tissue boundaries intact without acute focal lesions'
        ],
        clinicalSignificance:
          'Normal baseline chest radiograph ruling out acute lower respiratory infection, congestive pulmonary edema, or pneumothorax.',
        recommendations:
          'No acute pulmonary intervention indicated. Maintain routine outpatient observation.'
      };
    }

    return {
      modalityBasis: `Diagnostic Imaging — ${reportData.title || 'Digital Radiography'}`,
      groundingProtocol: 'American College of Radiology (ACR) Practice Guidelines',
      executiveSummary:
        `Diagnostic imaging study for "${reportData.title || 'Diagnostic Radiograph'}" demonstrates preserved anatomical alignment and bone morphology. No acute cortical fracture, gross soft tissue edema, or destructive osseous lesions identified.`,
      keyFindings: [
        'Anatomical Alignment: Articular relationships and axial alignment within normal anatomical limits',
        'Bone Density & Margins: Cortical boundaries are smooth and continuous with preserved trabecular pattern',
        'Joint Spaces: Joint intervals are maintained with no joint effusion or acute subluxation',
        'Soft Tissue Shadows: Normal soft tissue planes without foreign bodies or pathologic calcifications'
      ],
      clinicalSignificance:
        'Excludes acute displaced traumatic injury or aggressive osseous lesion.',
      recommendations:
        'Symptomatic management with clinical reassessment if symptoms persist or escalate.'
    };
  }

  // Case 3: Cardiovascular (Echo, Holter, ECG)
  if (isCardiacOrEcho) {
    return {
      modalityBasis: '2D Transthoracic Echocardiography & Color Flow Doppler',
      groundingProtocol: 'ASE/EACVI Guidelines for Chamber Quantification & Valvular Assessment',
      executiveSummary:
        'Echocardiographic assessment reveals preserved left ventricular systolic function with an estimated LVEF of 60–65%. Ventricular chamber dimensions and wall thicknesses are within normal reference ranges. Trace physiological mitral regurgitation is noted without structural valve disease.',
      keyFindings: [
        'LV Systolic Function: Normal global left ventricular contraction (LVEF 62%, normal > 55%)',
        'Wall Motion: No regional wall motion abnormalities or focal akinesis detected at rest',
        'Chamber Dimensions: Left atrium and left ventricle dimensions within normal limits (LVEDD 46 mm)',
        'Valvular Dynamics: Structurally intact trileaflet aortic and mitral valves; trace physiological regurgitation',
        'Hemodynamics: Normal estimated pulmonary artery systolic pressure (PASP ~22 mmHg, no pulmonary hypertension)'
      ],
      clinicalSignificance:
        'Effectively excludes structural cardiomyopathy, ischemic wall motion defect, or hemodynamically significant valvulopathy.',
      recommendations:
        'Continue lifestyle modifications and outpatient follow-up. Correlate with 24-hour ambulatory Holter for episodic rhythm tracking.'
    };
  }

  // Case 4: Pathology & Laboratory Blood / Urine Testing
  if (isPathologyOrBlood) {
    return {
      modalityBasis: 'Automated Clinical Chemistry & Spectrophotometry (Fasting Serum)',
      groundingProtocol: 'NCEP Adult Treatment Panel (ATP III) & ADA Standards of Medical Care',
      executiveSummary:
        `Clinical laboratory panel for "${reportData.title || 'Comprehensive Metabolic Panel'}" demonstrates moderate borderline elevation in total cholesterol (218 mg/dL) with preserved renal clearance and stable electrolyte balance. No critical panic values detected.`,
      keyFindings: [
        'Lipid Biomarkers: Total Cholesterol 218 mg/dL (Borderline High, ref < 200); Triglycerides 142 mg/dL (Normal < 150)',
        'Renal Function: Serum Creatinine 0.92 mg/dL with eGFR > 90 mL/min/1.73m² (Normal renal filtration)',
        'Electrolytes: Sodium 140 mEq/L and Potassium 4.1 mEq/L within optimal homeostatic thresholds',
        'Hepatic Markers: Transaminases (ALT/AST) and alkaline phosphatase within reference ranges'
      ],
      clinicalSignificance:
        'Mild dyslipidemia conferring low-to-moderate atherogenic cardiovascular risk, suitable for conservative outpatient lifestyle and dietary intervention.',
      recommendations:
        'Initiate low-saturated-fat dietary regimen and daily aerobic exercise. Repeat fasting lipid profile in 12 weeks.'
    };
  }

  // Default fallback for other clinical documents
  return {
    modalityBasis: `Clinical Diagnostic Review — ${reportData.category || 'General Pathology'}`,
    groundingProtocol: 'ApexCare Clinical Governance & Evidence-Based Care SOP',
    executiveSummary:
      `Diagnostic evaluation for "${reportData.title || 'Diagnostic Document'}" has been processed through clinical NLP entity extraction. Parameters show baseline stability with no acute panic values or urgent escalation indicators.`,
    keyFindings: [
      `Document "${reportData.title || 'Patient Report'}" verified and mapped to patient EHR record`,
      'Primary diagnostic indicators fall within expected outpatient reference parameters',
      'Automated safety checks passed without critical abnormal flags',
      'Report findings indexed into patient vector corpus for attending physician access'
    ],
    clinicalSignificance:
      'Diagnostic findings are consistent with active outpatient clinical care pathway.',
    recommendations:
      'Review during next scheduled clinical encounter and correlate with ongoing symptom presentation.'
  };
}
*/

// The frontend mock must not infer diagnoses, normal/abnormal results, or
// recommendations from a filename or a user-uploaded document. A real report
// summarizer requires authenticated server-side processing, source extraction,
// clinician validation, and a separately approved safety evaluation.
export function createPrototypeReportSummary(reportData = {}) {
  const title = reportData.title || 'Diagnostic Report';
  const category = reportData.category || 'Unspecified document';
  const suppliedText = String(reportData.rawContent || reportData.notes || '').trim();
  const excerpt = suppliedText
    ? `${suppliedText.slice(0, 280)}${suppliedText.length > 280 ? '…' : ''}`
    : 'No report text is available in the frontend demo.';

  return {
    modalityBasis: 'Prototype document metadata — no image or clinical text interpretation',
    groundingProtocol: 'No AI model or clinical validation is active in mock mode',
    executiveSummary: `This prototype has registered “${title}” as a ${category} document. It does not infer clinical findings, diagnoses, normality, or urgency.`,
    keyFindings: [
      `Document title: ${title}`,
      `Document category: ${category}`,
      `Supplied text preview: ${excerpt}`,
      'Clinical findings are intentionally not generated in the frontend demo.'
    ],
    clinicalSignificance: 'Not assessed. This prototype is not a clinical interpretation.',
    recommendations: 'Refer to the signed report and a qualified clinician for interpretation or next steps.',
    isPrototype: true
  };
}

export const recordsApi = {
  /**
   * Get patients assigned to the authenticated doctor
   * Spring Boot contract: GET /api/doctors/{doctorId}/patients
   * Note: Enforced server-side via doctor ID in the JWT
   */
  async getDoctorPatients(doctorId = 'D-201', searchQuery = '') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/doctors/${doctorId}/patients`, {
        params: { search: searchQuery }
      });
      return res.data;
    }

    await simulateDelay(350);
    let patients = [...MOCK_DOCTOR_PATIENTS];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.primaryDiagnosis.toLowerCase().includes(query) ||
          p.lastVisit.includes(query)
      );
    }
    return patients;
  },

  /**
   * Get comprehensive longitudinal patient chart scoped to doctor-patient relationship
   * Spring Boot contract: GET /api/doctors/{doctorId}/patients/{patientId}/records
   */
  async getPatientMedicalRecord(patientId = 'P-1001', doctorId = 'D-201') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/doctors/${doctorId}/patients/${patientId}/records`);
      return res.data;
    }

    await simulateDelay(350);
    patientRecordsStore = loadRecordsStore();

    // Auto-sync any attached reports from scheduled appointments in localStorage
    try {
      const savedApts = localStorage.getItem('apexcare_appointments');
      if (savedApts) {
        const apts = JSON.parse(savedApts);
        const patientApts = apts.filter((a) => a.patientId === patientId && a.attachedReports?.length > 0);
        let storeModified = false;

        if (patientRecordsStore[patientId]) {
          patientApts.forEach((apt) => {
            apt.attachedReports.forEach((attached) => {
              const alreadyExists = patientRecordsStore[patientId].reports.some(
                (r) => r.id === attached.id || (r.title === attached.title && r.date === attached.date)
              );
              if (!alreadyExists) {
                const reportToInsert = {
                  id: attached.id || `REP-${Date.now().toString().slice(-4)}`,
                  title: attached.title,
                  category: attached.category || 'Laboratory Pathology',
                  date: attached.date || apt.date || new Date().toISOString().split('T')[0],
                  fileType: attached.fileType || 'PDF',
                  fileSize: attached.fileSize || '1.8 MB',
                  fileName: attached.fileName || `${attached.title.replace(/\s+/g, '_')}.pdf`,
                  status: attached.status || 'Attached to Appointment',
                  uploadedBy: attached.uploadedBy || `Attached to Appt (${apt.id})`,
                  rawContent: attached.rawContent || `Diagnostic report attached during consultation booking: ${attached.title}.`,
                  aiSummaryData: createPrototypeReportSummary(attached)
                };
                patientRecordsStore[patientId].reports.unshift(reportToInsert);
                storeModified = true;
              }
            });
          });

          if (storeModified) {
            saveRecordsStore(patientRecordsStore);
          }
        }
      }
    } catch (e) {
      console.warn('Could not sync appointment attached reports:', e);
    }

    const record = patientRecordsStore[patientId] || patientRecordsStore['P-1001'];
    return record;
  },

  /**
   * Upload a new diagnostic report or lab test document
   * Spring Boot contract: POST /api/patients/{patientId}/reports
   */
  async uploadReport(patientId = 'P-1001', reportData) {
    if (!USE_MOCK) {
      const formData = new FormData();
      Object.keys(reportData).forEach((key) => formData.append(key, reportData[key]));
      const res = await apiClient.post(`/patients/${patientId}/reports`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    }

    await simulateDelay(500);
    patientRecordsStore = loadRecordsStore();

    const title = reportData.title || 'Laboratory Report';
    const category = reportData.category || 'Laboratory Pathology';
    const initialSummary = createPrototypeReportSummary(reportData);

    const newReport = {
      id: reportData.id || `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title,
      date: reportData.date || new Date().toISOString().split('T')[0],
      category: category,
      fileType: reportData.fileType || 'PDF',
      fileSize: reportData.fileSize || '1.8 MB',
      fileName: reportData.fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      status: reportData.status || 'Pending Physician Review',
      uploadedBy: reportData.uploadedBy || 'Patient Self-Upload',
      rawContent: reportData.rawContent || reportData.notes || `Clinical diagnostic document (${title}). Category: ${category}. Awaiting attending physician analysis.`,
      aiSummaryData: reportData.aiSummaryData || initialSummary
    };

    if (!patientRecordsStore[patientId]) {
      patientRecordsStore[patientId] = {
        patient: { id: patientId, name: 'Ananya Sharma', age: 38, gender: 'Female', bloodGroup: 'A+' },
        vitals: [],
        clinicalNotes: [],
        reports: []
      };
    }

    // Check if report with same id already exists
    const existingIndex = patientRecordsStore[patientId].reports.findIndex((r) => r.id === newReport.id);
    if (existingIndex >= 0) {
      patientRecordsStore[patientId].reports[existingIndex] = newReport;
    } else {
      patientRecordsStore[patientId].reports.unshift(newReport);
    }

    saveRecordsStore(patientRecordsStore);
    return newReport;
  },

  /**
   * AI Summarize Report (calls Spring AI report-summarization endpoint)
   * Spring Boot contract: POST /api/reports/{reportId}/summarize
   */
  async summarizeReport(reportId, patientId = 'P-1001') {
    if (!USE_MOCK) {
      const res = await apiClient.post(`/reports/${reportId}/summarize`);
      return res.data;
    }

    // Simulated network delay for the frontend-only prototype.
    await simulateDelay(750);
    patientRecordsStore = loadRecordsStore();

    const record = patientRecordsStore[patientId] || patientRecordsStore['P-1001'];
    const report = record?.reports?.find((r) => r.id === reportId);

    if (report) {
      const prototypeSummary = createPrototypeReportSummary(report);
      report.aiSummaryData = prototypeSummary;
      saveRecordsStore(patientRecordsStore);
      return prototypeSummary;
    }

    return createPrototypeReportSummary({ title: 'Diagnostic Report', category: 'Laboratory Pathology' });
  },

  /**
   * Create or update Clinical Encounter Note (Epic 2)
   * Spring Boot contract: POST /api/patients/{patientId}/clinical-notes
   */
  async createClinicalNote(patientId = 'P-1001', noteData) {
    if (!USE_MOCK) {
      const res = await apiClient.post(`/patients/${patientId}/clinical-notes`, noteData);
      return res.data;
    }
    await simulateDelay(350);
    patientRecordsStore = loadRecordsStore();
    const newNote = {
      id: `CN-${Math.floor(500 + Math.random() * 500)}`,
      date: new Date().toISOString().split('T')[0],
      doctorName: noteData.doctorName || 'Dr. Rajesh Verma, MD',
      specialty: noteData.specialty || 'Cardiology',
      encounterType: noteData.encounterType || 'Outpatient Consultation',
      templateType: noteData.templateType || 'SOAP',
      summary: noteData.summary || 'Clinical Encounter Note',
      details: noteData.details || '',
      assessment: noteData.assessment || '',
      treatmentPlan: noteData.treatmentPlan || '',
      status: noteData.isFinalized ? 'Finalized' : 'Draft',
      isFinalized: noteData.isFinalized ?? true,
      signedBy: noteData.isFinalized ? (noteData.doctorName || 'Dr. Rajesh Verma, MD') : null
    };
    if (patientRecordsStore[patientId]) {
      if (!patientRecordsStore[patientId].clinicalNotes) patientRecordsStore[patientId].clinicalNotes = [];
      patientRecordsStore[patientId].clinicalNotes.unshift(newNote);
      saveRecordsStore(patientRecordsStore);
    }
    return newNote;
  },

  /**
   * CPOE Orders (Epic 3)
   * Spring Boot contracts:
   * POST /api/orders/lab, POST /api/orders/imaging, POST /api/orders/procedure
   */
  async createCpoeOrder(type, orderData) {
    if (!USE_MOCK) {
      const endpoint = type === 'imaging' ? '/orders/imaging' : type === 'procedure' ? '/orders/procedure' : '/orders/lab';
      const res = await apiClient.post(endpoint, orderData);
      return res.data;
    }
    await simulateDelay(400);
    patientRecordsStore = loadRecordsStore();
    const patientId = orderData.patientId || 'P-1001';
    if (!patientRecordsStore[patientId]) return orderData;
    if (!patientRecordsStore[patientId].cpoeOrders) {
      patientRecordsStore[patientId].cpoeOrders = { labOrders: [], imagingOrders: [], procedureOrders: [] };
    }

    let createdOrder;
    if (type === 'imaging') {
      createdOrder = {
        id: `IMG-${Math.floor(3000 + Math.random() * 7000)}`,
        modality: orderData.modality,
        bodySite: orderData.bodySite,
        priority: orderData.priority || 'Routine',
        clinicalIndication: orderData.clinicalIndication,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Ordered',
        pacsAccessionNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`
      };
      patientRecordsStore[patientId].cpoeOrders.imagingOrders.unshift(createdOrder);
    } else if (type === 'procedure') {
      createdOrder = {
        id: `PRC-${Math.floor(5000 + Math.random() * 5000)}`,
        procedureName: orderData.procedureName,
        category: orderData.category || 'Cardiovascular',
        scheduledDate: orderData.scheduledDate || new Date().toISOString().split('T')[0],
        priority: orderData.priority || 'Elective',
        preOpInstructions: orderData.preOpInstructions,
        status: 'Scheduled'
      };
      patientRecordsStore[patientId].cpoeOrders.procedureOrders.unshift(createdOrder);
    } else {
      createdOrder = {
        id: `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
        testCode: orderData.testCode || 'LOINC-001',
        testName: orderData.testName,
        priority: orderData.priority || 'Routine',
        clinicalIndication: orderData.clinicalIndication,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Ordered',
        specimenSource: orderData.specimenSource || 'Venous Blood'
      };
      patientRecordsStore[patientId].cpoeOrders.labOrders.unshift(createdOrder);
    }
    saveRecordsStore(patientRecordsStore);
    return createdOrder;
  },

  /**
   * Check Drug-Drug Interactions and Allergy Conflicts (Epic 4)
   * Spring Boot contract: POST /api/prescriptions/check-interactions
   */
  async checkDrugInteractions(payload) {
    if (!USE_MOCK) {
      const res = await apiClient.post('/prescriptions/check-interactions', payload);
      return res.data;
    }
    await simulateDelay(250);
    const { proposedMedications = [], currentMedications = [], allergies = [] } = payload;
    const all = [...proposedMedications, ...currentMedications].map(m => String(m).toLowerCase());
    const interactions = [];
    const allergyAlerts = [];

    if (all.some(m => m.includes('lisinopril')) && all.some(m => m.includes('spironolactone'))) {
      interactions.push({
        drugA: 'Lisinopril',
        drugB: 'Spironolactone',
        severity: 'CONTRAINDICATED',
        title: 'Severe Hyperkalemia Risk: ACE Inhibitor + Potassium-Sparing Diuretic',
        clinicalMechanism: 'Additive potassium retention causes life-threatening hyperkalemia and dysrhythmias.',
        clinicalRecommendation: 'Avoid combination unless supervised with mandatory weekly potassium monitoring.',
        sourceStandard: 'NLM RxNorm DDI Reference / AHA Hypertension Guidelines'
      });
    }

    if (all.some(m => m.includes('atorvastatin')) && all.some(m => m.includes('clarithromycin'))) {
      interactions.push({
        drugA: 'Atorvastatin',
        drugB: 'Clarithromycin',
        severity: 'MAJOR',
        title: 'Rhabdomyolysis Risk: Statin + CYP3A4 Inhibitor',
        clinicalMechanism: 'CYP3A4 inhibition increases statin AUC 4-fold, precipitating acute myopathy.',
        clinicalRecommendation: 'Suspend Atorvastatin during macrolide therapy.',
        sourceStandard: 'FDA Black Box Warning'
      });
    }

    for (const prop of proposedMedications) {
      for (const al of allergies) {
        if (al.toLowerCase().includes('penicillin') && prop.toLowerCase().includes('cillin')) {
          allergyAlerts.push({
            medication: prop,
            matchedAllergy: al,
            severity: 'SEVERE_ANAPHYLAXIS_RISK',
            clinicalDescription: `Documented hypersensitivity to '${al}'. Prescribing '${prop}' carries severe anaphylaxis risk.`
          });
        }
      }
    }

    return {
      overallStatus: interactions.some(i => i.severity === 'CONTRAINDICATED') || allergyAlerts.length > 0 ? 'CONTRAINDICATED' : interactions.length > 0 ? 'CAUTION' : 'SAFE',
      interactions,
      allergyAlerts,
      integrationMetadata: {
        gateway: 'CareConnect Clinical Pharmacology Integration Gateway',
        specificationStandard: 'NLM RxNorm DDI API v3.2',
        operatingMode: 'Local Standard Pharmacology Rules Adapter (Sandbox/Validation)'
      }
    };
  },

  /**
   * Diagnostic Integration Gateway (Epic 5)
   * Spring Boot contracts: GET /api/integrations/status, /api/integrations/hl7/oru-r01/{id}, /api/integrations/fhir/diagnostic-report/{id}
   */
  async getIntegrationStatus() {
    if (!USE_MOCK) {
      const res = await apiClient.get('/integrations/status');
      return res.data;
    }
    return {
      systemName: 'CareConnect EHR Diagnostic Gateway',
      environment: 'Sandbox / Demonstration Gateway',
      isConnected: true,
      lisStatus: 'LIS Connected (Simulated HL7 v2.5.1 ORU/OML Bridge)',
      pacsStatus: 'PACS Connected (Simulated DICOM Accession & Web Viewer Bridge)',
      supportedProtocols: ['REST API (JSON)', 'HL7 v2.5.1 MSH/PID/OBR/OBX', 'HL7 FHIR R4 (Observation/DiagnosticReport)', 'DICOM WADO-RS Preview'],
      disclaimer: 'NOTICE: Modular sandbox adapter for academic & verification demonstrations. Conforms to HL7 v2.5.1 and FHIR R4 data models.'
    };
  },

  async getHl7Message(orderId = 'LAB-1001') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/integrations/hl7/oru-r01/${orderId}`);
      return res.data;
    }
    return `MSH|^~\\&|APEXCARE_LIS|CENTRAL_LAB|CARECONNECT_EHR|OPD_CLINIC|20260901113000||ORU^R01|MSG-98124|P|2.5.1\r\nPID|1||P-1001||SHARMA^ANANYA||19880412|F\r\nOBR|1|LAB-1001|LIS-LAB-1001|LOINC-24331-1^Comprehensive Lipid Profile^LN|||20260901113000|||D-201|||||||||||F\r\nOBX|1|ST|Serum Potassium^Serum Potassium|1|4.4|mmol/L|3.5-5.0|N|||F|||20260901113000\r\n`;
  },

  async getFhirReport(orderId = 'LAB-1001') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/integrations/fhir/diagnostic-report/${orderId}`);
      return res.data;
    }
    return {
      resourceType: 'DiagnosticReport',
      id: orderId,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'LAB', display: 'Laboratory' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '24331-1', display: 'Comprehensive Lipid Profile' }] },
      subject: { reference: 'Patient/P-1001', display: 'Ananya Sharma' },
      effectiveDateTime: '2026-08-16T10:30:00Z',
      contained: [
        { resourceType: 'Observation', id: 'OBS-1', status: 'final', code: { text: 'Total Cholesterol' }, valueQuantity: { value: '218', unit: 'mg/dL' }, referenceRange: [{ text: '< 200 mg/dL' }], interpretation: [{ text: 'High' }] },
        { resourceType: 'Observation', id: 'OBS-2', status: 'final', code: { text: 'Serum Potassium' }, valueQuantity: { value: '4.4', unit: 'mmol/L' }, referenceRange: [{ text: '3.5 - 5.0 mmol/L' }], interpretation: [{ text: 'Normal' }] }
      ]
    };
  },

  /**
   * Secure Messaging (Epic 7)
   */
  async getSecureMessages(patientId = 'P-1001') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/messages/patient/${patientId}`);
      return res.data;
    }
    await simulateDelay(300);
    patientRecordsStore = loadRecordsStore();
    return patientRecordsStore[patientId]?.secureMessages || [];
  },

  async sendSecureMessage(msgData) {
    if (!USE_MOCK) {
      const res = await apiClient.post('/messages', msgData);
      return res.data;
    }
    await simulateDelay(350);
    patientRecordsStore = loadRecordsStore();
    const patientId = msgData.patientId || 'P-1001';
    const newMsg = {
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      senderId: msgData.senderId || patientId,
      senderName: msgData.senderName || 'Ananya Sharma',
      senderRole: msgData.senderRole || 'PATIENT',
      recipientId: msgData.recipientId || 'D-201',
      recipientName: msgData.recipientName || 'Dr. Rajesh Verma',
      recipientRole: msgData.recipientRole || 'DOCTOR',
      subject: msgData.subject,
      body: msgData.body,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    if (patientRecordsStore[patientId]) {
      if (!patientRecordsStore[patientId].secureMessages) patientRecordsStore[patientId].secureMessages = [];
      patientRecordsStore[patientId].secureMessages.unshift(newMsg);
      saveRecordsStore(patientRecordsStore);
    }
    return newMsg;
  },

  /**
   * Patient & Provider Notifications (Epic 6 & 7)
   */
  async getNotifications(userId = 'P-1001') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/notifications/user/${userId}`);
      return res.data;
    }
    await simulateDelay(250);
    patientRecordsStore = loadRecordsStore();
    return patientRecordsStore[userId]?.notifications || [];
  }
};
