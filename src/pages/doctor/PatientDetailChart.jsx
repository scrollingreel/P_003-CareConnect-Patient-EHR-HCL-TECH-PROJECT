import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsApi, prescriptionsApi } from '../../api';
import { USE_MOCK } from '../../api/client';
import {
  User,
  Activity,
  FileText,
  Pill,
  ClipboardList,
  Sparkles,
  ChevronLeft,
  Calendar,
  CheckCircle,
  Plus,
  Heart,
  ShieldCheck,
  Clock,
  Printer,
  Upload,
  FileCheck,
  AlertTriangle,
  Lock,
  Network,
  Send,
  Eye,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { AiSummarySkeleton, CardSkeleton } from '../../components/common/SkeletonLoader';

export const PatientDetailChart = () => {
  const { patientId = 'P-1001' } = useParams();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'cpoe' | 'prescriptions' | 'notes' | 'vitals'
  const [summarizingReportId, setSummarizingReportId] = useState(null);
  const [activeSummaryModal, setActiveSummaryModal] = useState(null);
  const [summaryResult, setSummaryResult] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Upload Report Modal State
  const [uploadReportModalOpen, setUploadReportModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [doctorReportFile, setDoctorReportFile] = useState(null);
  const [isDoctorDragging, setIsDoctorDragging] = useState(false);
  const doctorFileInputRef = useRef(null);
  const [doctorReportForm, setDoctorReportForm] = useState({
    title: '',
    category: 'Laboratory Pathology',
    notes: ''
  });

  // HL7 / FHIR Integration Modal State
  const [hl7ModalOpen, setHl7ModalOpen] = useState(false);
  const [hl7Data, setHl7Data] = useState('');
  const [fhirData, setFhirData] = useState(null);
  const [isLoadingHl7, setIsLoadingHl7] = useState(false);

  // CPOE Order Modal State (Epic 3)
  const [cpoeModalOpen, setCpoeModalOpen] = useState(false);
  const [cpoeForm, setCpoeForm] = useState({
    orderType: 'lab', // 'lab' | 'imaging' | 'procedure'
    testName: 'High-Sensitivity Troponin-I',
    modality: 'Echocardiography',
    bodySite: 'Transthoracic Cardiac Window',
    procedureName: 'Transesophageal Echocardiogram (TEE)',
    priority: 'STAT', // 'Routine' | 'Urgent' | 'STAT'
    clinicalIndication: 'Acute recurrent chest tightness & episodic palpitations'
  });

  // Clinical Note Modal State (Epic 2)
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    encounterType: 'Outpatient Follow-up',
    templateType: 'SOAP', // 'SOAP' | 'CARDIOLOGY_CONSULT' | 'GENERAL_FOLLOWUP' | 'DISCHARGE_SUMMARY'
    summary: 'Hypertension Follow-Up & Palpitation Evaluation',
    details: 'Subjective: Patient reports noticeable decrease in nocturnal chest fluttering. Denies chest pain, presyncope, or shortness of breath. Adheres to Lisinopril 10mg.\nObjective: BP 124/82 mmHg, HR 74 bpm regular, SpO2 99% on room air. S1/S2 normal without murmurs.',
    assessment: '1. Essential Hypertension, Stage 1 (satisfactorily controlled).\n2. Benign isolated premature atrial contractions (PACs) on 24-hr Holter.',
    treatmentPlan: '1. Maintain Lisinopril 10 mg PO once daily in morning.\n2. Continue Atorvastatin 10 mg PO at bedtime for mild hyperlipidemia.\n3. Lifestyle: low sodium diet (< 2000 mg/day) and 30 minutes daily moderate aerobic exercise.\n4. Repeat metabolic panel and follow up in 3 months.',
    isFinalized: true
  });

  // New Prescription Modal State with DDI Safety (Epic 4)
  const [newRxModalOpen, setNewRxModalOpen] = useState(false);
  const [rxForm, setRxForm] = useState({
    diagnosis: 'Essential Hypertension & Mild Palpitations',
    medName: '',
    dosage: '10 mg',
    frequency: 'Once daily in the morning',
    duration: '30 Days',
    instructions: 'Take with water after meals.',
    specialInstructions: 'Monitor resting pulse daily.'
  });
  const [ddiResult, setDdiResult] = useState(null);
  const [isCheckingDdi, setIsCheckingDdi] = useState(false);

  // Check DDI whenever proposed medication changes
  useEffect(() => {
    if (!rxForm.medName || rxForm.medName.trim().length < 3) {
      setDdiResult(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsCheckingDdi(true);
        const res = await recordsApi.checkDrugInteractions({
          proposedMedications: [rxForm.medName],
          currentMedications: ['Lisinopril 10mg', 'Atorvastatin 10mg', 'Metoprolol 25mg'],
          allergies: ['Penicillin (Moderate rash)']
        });
        setDdiResult(res);
      } catch (err) {
        console.warn('DDI check error:', err);
      } finally {
        setIsCheckingDdi(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [rxForm.medName]);

  const { data: record, isLoading } = useQuery({
    queryKey: ['patient-record', patientId],
    queryFn: () => recordsApi.getPatientMedicalRecord(patientId, 'D-201')
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['patient-prescriptions', patientId],
    queryFn: () => prescriptionsApi.getPatientPrescriptions(patientId)
  });

  const { data: marRecords = [] } = useQuery({
    queryKey: ['patient-mar', patientId],
    queryFn: () => prescriptionsApi.getMarRecords(patientId)
  });

  const createRxMutation = useMutation({
    mutationFn: (data) => prescriptionsApi.createPrescription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-prescriptions', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient-mar', patientId] });
      setNewRxModalOpen(false);
      setRxForm({
        diagnosis: 'Essential Hypertension',
        medName: '',
        dosage: '10 mg',
        frequency: 'Once daily in the morning',
        duration: '30 Days',
        instructions: '',
        specialInstructions: ''
      });
      setDdiResult(null);
    }
  });

  const createCpoeMutation = useMutation({
    mutationFn: (data) => recordsApi.createCpoeOrder(data.orderType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-record', patientId] });
      setCpoeModalOpen(false);
    }
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => recordsApi.createClinicalNote(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-record', patientId] });
      setNoteModalOpen(false);
    }
  });

  const uploadReportMutation = useMutation({
    mutationFn: (data) =>
      recordsApi.uploadReport(patientId, {
        title: data.title,
        category: data.category,
        notes: data.notes,
        fileSize: doctorReportFile?.size || '1.8 MB',
        fileType: doctorReportFile?.name?.match(/\.(png|jpg|jpeg)$/i) ? 'Image' : 'PDF',
        fileName: doctorReportFile?.name || `${data.title.replace(/\s+/g, '_')}.pdf`,
        uploadedBy: 'Dr. Rajesh Verma, MD (Cardiology)',
        status: 'Reviewed'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-record'] });
      setUploadReportModalOpen(false);
      setDoctorReportFile(null);
      setDoctorReportForm({ title: '', category: 'Laboratory Pathology', notes: '' });
    }
  });

  const handleSummarizeReport = async (report) => {
    setActiveSummaryModal(report);
    setSummarizingReportId(report.id);
    setSummaryResult(null);
    setIsSummarizing(true);
    try {
      const summary = await recordsApi.summarizeReport(report.id, patientId);
      setSummaryResult(summary);
    } finally {
      setIsSummarizing(false);
      setSummarizingReportId(null);
    }
  };

  const handleOpenHl7Modal = async (orderId = 'LAB-1001') => {
    setHl7ModalOpen(true);
    setIsLoadingHl7(true);
    try {
      const hl7 = await recordsApi.getHl7Message(orderId);
      const fhir = await recordsApi.getFhirReport(orderId);
      setHl7Data(hl7);
      setFhirData(fhir);
    } finally {
      setIsLoadingHl7(false);
    }
  };

  const handleCreatePrescriptionSubmit = (e) => {
    e.preventDefault();
    createRxMutation.mutate({
      doctorId: 'D-201',
      doctorName: 'Dr. Rajesh Verma, MD',
      doctorSpecialty: 'Cardiology',
      patientId: patientId,
      diagnosis: rxForm.diagnosis,
      medications: [
        {
          name: rxForm.medName,
          dosage: rxForm.dosage,
          form: 'Oral Tablet',
          frequency: rxForm.frequency,
          duration: rxForm.duration,
          quantity: '30 tablets',
          refills: 1,
          instructions: rxForm.instructions
        }
      ],
      specialInstructions: rxForm.specialInstructions
    });
  };

  const handleCpoeSubmit = (e) => {
    e.preventDefault();
    createCpoeMutation.mutate({
      patientId,
      doctorId: 'D-201',
      orderType: cpoeForm.orderType,
      testName: cpoeForm.testName,
      modality: cpoeForm.modality,
      bodySite: cpoeForm.bodySite,
      procedureName: cpoeForm.procedureName,
      priority: cpoeForm.priority,
      clinicalIndication: cpoeForm.clinicalIndication
    });
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    createNoteMutation.mutate({
      patientId,
      doctorName: 'Dr. Rajesh Verma, MD',
      specialty: 'Cardiology',
      encounterType: noteForm.encounterType,
      templateType: noteForm.templateType,
      summary: noteForm.summary,
      details: noteForm.details,
      assessment: noteForm.assessment,
      treatmentPlan: noteForm.treatmentPlan,
      isFinalized: noteForm.isFinalized
    });
  };

  const processDoctorFile = (file) => {
    if (!file) return;
    setDoctorReportFile({
      name: file.name,
      size: (file.size / 1024 > 1024 ? (file.size / 1048576).toFixed(1) + ' MB' : (file.size / 1024).toFixed(1) + ' KB'),
      type: file.type || 'application/pdf',
      raw: file
    });
    setDoctorReportForm((prev) => ({
      ...prev,
      title: prev.title.trim() ? prev.title : file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
    }));
  };

  if (isLoading || !record) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
        <CardSkeleton count={2} />
      </div>
    );
  }

  const { patient, vitals = [], clinicalNotes = [], reports = [], cpoeOrders = {}, labOrders = [], imagingOrders = [] } = record;

  const combinedLabOrders = (cpoeOrders?.labOrders || labOrders || []);
  const combinedImagingOrders = (cpoeOrders?.imagingOrders || imagingOrders || []);
  const combinedProcedureOrders = (cpoeOrders?.procedureOrders || []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & Doctor Scoping Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Link
          to="/doctor/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Patients Directory</span>
        </Link>
        <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
          Doctor Scoped: {patient.name} ↔ Dr. Rajesh Verma (Cardiology)
        </span>
      </div>

      {/* Patient Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={patient.avatar}
            alt={patient.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
              <Badge variant="primary">MRN: {patient.id}</Badge>
              <Badge variant="success">Blood: {patient.bloodGroup}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Age: {patient.age} • Gender: {patient.gender} • DOB: {patient.dob} • Phone: {patient.phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCpoeModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>CPOE Medical Order</span>
          </button>
          <button
            onClick={() => setNoteModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Document Encounter</span>
          </button>
          <button
            onClick={() => setNewRxModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Pill className="w-4 h-4" />
            <span>Issue Prescription</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Diagnostic Reports & Results ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cpoe')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'cpoe'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>CPOE Orders ({combinedLabOrders.length + combinedImagingOrders.length + combinedProcedureOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'prescriptions'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Prescriptions & MAR ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Clinical Notes ({clinicalNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vitals')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'vitals'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Vitals Timeline ({vitals.length})</span>
        </button>
      </div>

      {/* Tab 1: Diagnostic Reports with Critical Panic Alerts & HL7/FHIR */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Diagnostic Imaging & Lab Pathology Reports
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                EHR diagnostic results with verified HL7 v2.5.1 / FHIR R4 interoperability bridges
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenHl7Modal('LAB-1001')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-colors"
              >
                <Network className="w-3.5 h-3.5 text-indigo-600" />
                <span>HL7 / FHIR Viewer</span>
              </button>
              <button
                onClick={() => setUploadReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Report</span>
              </button>
            </div>
          </div>

          {/* Panic Value Alert Banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Diagnostic Panic Alert Rule Active
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Automated clinical laboratory thresholds (Potassium &gt; 6.0 mEq/L, Troponin &gt; 0.04 ng/mL, severe hypoxia) trigger immediate priority alerts across EHR clinical worklists per hospital critical care protocols.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-hospital-700 flex items-center justify-center shrink-0 border border-teal-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                      <Badge variant="primary" size="sm">{report.category}</Badge>
                      <Badge variant="success" size="sm">{report.status || 'Verified'}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
                      <span>Date: {report.date}</span>
                      <span>•</span>
                      <span>Source: {report.uploadedBy || 'Clinical Labs'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSummarizeReport(report)}
                    className="px-3.5 py-1.5 bg-hospital-50 hover:bg-hospital-100 text-hospital-700 border border-hospital-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Synthesis</span>
                  </button>
                  <button
                    onClick={() => handleOpenHl7Modal(report.id)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Network className="w-3.5 h-3.5 text-indigo-600" />
                    <span>HL7</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: CPOE Diagnostic & Clinical Orders (Epic 3) */}
      {activeTab === 'cpoe' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Computerized Provider Order Entry (CPOE) Dashboard
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Active clinical orders for laboratory testing, imaging studies, and interventional procedures
              </span>
            </div>
            <button
              onClick={() => setCpoeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Place New Clinical Order</span>
            </button>
          </div>

          {/* Orders Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lab Orders Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-hospital-600" />
                  Laboratory Orders ({combinedLabOrders.length})
                </span>
                <Badge variant="primary" size="sm">LIS Connected</Badge>
              </div>
              <div className="space-y-2">
                {combinedLabOrders.map((lo, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{lo.testName}</span>
                        <Badge variant={lo.priority === 'STAT' ? 'danger' : lo.priority === 'Urgent' ? 'warning' : 'default'} size="sm">
                          {lo.priority}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Indication: {lo.clinicalIndication || 'Routine'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Order ID: {lo.id} • Date: {lo.orderDate || 'Today'}</p>
                    </div>
                    <Badge variant={lo.status === 'Completed' ? 'success' : 'primary'} size="sm">{lo.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Imaging & Procedure Orders Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Imaging & Procedure Orders ({combinedImagingOrders.length + combinedProcedureOrders.length})
                </span>
                <Badge variant="success" size="sm">PACS Connected</Badge>
              </div>
              <div className="space-y-2">
                {combinedImagingOrders.map((io, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{io.modality} ({io.bodySite})</span>
                        <Badge variant="default" size="sm">{io.priority}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Indication: {io.clinicalIndication}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Accession: {io.pacsAccessionNumber || io.id}</p>
                    </div>
                    <Badge variant={io.status === 'Completed' ? 'success' : 'primary'} size="sm">{io.status}</Badge>
                  </div>
                ))}
                {combinedProcedureOrders.map((po, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900">{po.procedureName}</span>
                      <p className="text-[11px] text-slate-500 mt-1">Scheduled: {po.scheduledDate} • {po.priority}</p>
                    </div>
                    <Badge variant="success" size="sm">{po.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Prescriptions & Medication Administration Records (Epic 4) */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Prescription Management & Medication Administration Records (MAR)
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Active prescriptions, verified doses administered, and clinical DDI interaction safety checks
              </span>
            </div>
            <button
              onClick={() => setNewRxModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Prescription</span>
            </button>
          </div>

          {/* MAR Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Medication Administration Records (MAR Log)
              </span>
              <Badge variant="success" size="sm">Nursing Verified</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Medication</th>
                    <th className="p-3">Dose / Route</th>
                    <th className="p-3">Scheduled Time</th>
                    <th className="p-3">Administered At</th>
                    <th className="p-3">Nurse Signature</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marRecords.map((mar, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900">{mar.medicationName}</td>
                      <td className="p-3">{mar.dosage} ({mar.route})</td>
                      <td className="p-3 font-mono text-slate-600">{mar.scheduledTime}</td>
                      <td className="p-3 font-mono text-emerald-700 font-semibold">{mar.administeredTime}</td>
                      <td className="p-3 text-slate-700">{mar.administeredBy}</td>
                      <td className="p-3">
                        <Badge variant="success" size="sm">{mar.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prescriptions List */}
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{rx.id}</span>
                    <Badge variant={rx.status === 'Active' ? 'success' : 'default'} size="sm">{rx.status}</Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Date: {rx.date}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Diagnosis: <span className="font-normal text-slate-600">{rx.diagnosis}</span>
                </p>
                <div className="space-y-2">
                  {rx.medications.map((med, mIdx) => (
                    <div key={mIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900">{med.name} {med.dosage}</span>
                        <p className="text-[11px] text-slate-500">{med.frequency} • {med.duration}</p>
                      </div>
                      <span className="font-mono text-slate-600">{med.instructions}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Clinical Notes & Encounters with Immutability Protection (Epic 2) */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Physician Clinical Notes & Encounters
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Structured clinical templates (SOAP, Consultation, Discharge) with tamper-resistant finalized record locks
              </span>
            </div>
            <button
              onClick={() => setNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Document Encounter</span>
            </button>
          </div>

          <div className="space-y-4">
            {clinicalNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{note.summary}</h4>
                      <Badge variant="primary" size="sm">Template: {note.templateType || 'SOAP'}</Badge>
                      <Badge variant="success" size="sm" className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>{note.status || 'Finalized'} & Signed</span>
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{note.doctorName} • {note.specialty}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{note.date}</span>
                </div>

                <div className="text-xs text-slate-700 space-y-2">
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Clinical Evaluation / Subjective & Objective:</strong>
                    <p className="leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-serif whitespace-pre-line">
                      {note.details}
                    </p>
                  </div>
                  {note.assessment && (
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Assessment:</strong>
                      <p className="leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 font-serif whitespace-pre-line">
                        {note.assessment}
                      </p>
                    </div>
                  )}
                  {note.treatmentPlan && (
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Treatment Plan:</strong>
                      <p className="leading-relaxed bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 font-serif whitespace-pre-line">
                        {note.treatmentPlan}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Record Finalized & Immutable (Audit Protected)
                  </span>
                  <span>Signed by {note.signedBy || note.doctorName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Vitals */}
      {activeTab === 'vitals' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Longitudinal Vitals Log
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Record Date</th>
                  <th className="p-3.5">Blood Pressure</th>
                  <th className="p-3.5">Heart Rate</th>
                  <th className="p-3.5">Oxygen (SpO2)</th>
                  <th className="p-3.5">Body Temp</th>
                  <th className="p-3.5">Weight & BMI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vitals.map((v, vIdx) => (
                  <tr key={vIdx} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-mono font-semibold text-slate-900">{v.date}</td>
                    <td className="p-3.5 font-semibold text-hospital-700">{v.bp}</td>
                    <td className="p-3.5">{v.hr}</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">{v.spo2}</td>
                    <td className="p-3.5">{v.temp}</td>
                    <td className="p-3.5">{v.weight} (BMI {v.bmi})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CPOE Order Modal (Epic 3) */}
      {cpoeModalOpen && (
        <Modal
          isOpen={cpoeModalOpen}
          onClose={() => setCpoeModalOpen(false)}
          title="Computerized Provider Order Entry (CPOE)"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCpoeSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Order Category</label>
              <div className="grid grid-cols-3 gap-2">
                {['lab', 'imaging', 'procedure'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCpoeForm({ ...cpoeForm, orderType: type })}
                    className={`py-2 rounded-xl font-bold uppercase text-[11px] border transition-all ${
                      cpoeForm.orderType === type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'lab' ? 'Laboratory Test' : type === 'imaging' ? 'Imaging Study' : 'Procedure'}
                  </button>
                ))}
              </div>
            </div>

            {cpoeForm.orderType === 'lab' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Laboratory Test Name</label>
                <select
                  value={cpoeForm.testName}
                  onChange={(e) => setCpoeForm({ ...cpoeForm, testName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="High-Sensitivity Troponin-I">High-Sensitivity Troponin-I (Cardiac Biomarker)</option>
                  <option value="Comprehensive Lipid Profile">Comprehensive Lipid Profile (Fasting)</option>
                  <option value="Serum Electrolytes & Renal Panel">Serum Electrolytes & Renal Panel (K+, Na+, Creatinine)</option>
                  <option value="Hemoglobin A1c (HbA1c)">Hemoglobin A1c (HbA1c)</option>
                  <option value="Complete Blood Count (CBC) with Differential">Complete Blood Count (CBC) with Differential</option>
                </select>
              </div>
            )}

            {cpoeForm.orderType === 'imaging' && (
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Modality</label>
                  <select
                    value={cpoeForm.modality}
                    onChange={(e) => setCpoeForm({ ...cpoeForm, modality: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Echocardiography">2D Echocardiography & Color Flow Doppler</option>
                    <option value="MRI">Magnetic Resonance Imaging (MRI)</option>
                    <option value="CT">Computed Tomography (CT)</option>
                    <option value="Digital Radiography (X-Ray)">Digital Radiography (X-Ray)</option>
                    <option value="12-Lead ECG">12-Lead Electrocardiogram (ECG)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Anatomical Body Site</label>
                  <input
                    type="text"
                    value={cpoeForm.bodySite}
                    onChange={(e) => setCpoeForm({ ...cpoeForm, bodySite: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            )}

            {cpoeForm.orderType === 'procedure' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Procedure Name</label>
                <input
                  type="text"
                  value={cpoeForm.procedureName}
                  onChange={(e) => setCpoeForm({ ...cpoeForm, procedureName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority / Urgency</label>
              <div className="flex gap-2">
                {['Routine', 'Urgent', 'STAT'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCpoeForm({ ...cpoeForm, priority: p })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      cpoeForm.priority === p
                        ? p === 'STAT' ? 'bg-rose-600 text-white border-rose-600' : 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinical Indication & Order Rationale</label>
              <textarea
                rows={2}
                value={cpoeForm.clinicalIndication}
                onChange={(e) => setCpoeForm({ ...cpoeForm, clinicalIndication: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCpoeModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createCpoeMutation.isPending}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{createCpoeMutation.isPending ? 'Transmitting Order...' : 'Authorize & Transmit CPOE Order'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Clinical Note Modal (Epic 2) */}
      {noteModalOpen && (
        <Modal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          title="Clinical Documentation Encounter Note"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleNoteSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Documentation Template</label>
                <select
                  value={noteForm.templateType}
                  onChange={(e) => setNoteForm({ ...noteForm, templateType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="SOAP">SOAP Note (Subjective, Objective, Assessment, Plan)</option>
                  <option value="CARDIOLOGY_CONSULT">Cardiology Consultation Specialty Note</option>
                  <option value="GENERAL_FOLLOWUP">General Outpatient Follow-up Template</option>
                  <option value="DISCHARGE_SUMMARY">Hospital Clinical Discharge Summary</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Encounter Type</label>
                <input
                  type="text"
                  value={noteForm.encounterType}
                  onChange={(e) => setNoteForm({ ...noteForm, encounterType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Encounter Title / Chief Summary</label>
              <input
                type="text"
                value={noteForm.summary}
                onChange={(e) => setNoteForm({ ...noteForm, summary: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Subjective & Objective Clinical Findings</label>
              <textarea
                rows={3}
                value={noteForm.details}
                onChange={(e) => setNoteForm({ ...noteForm, details: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-serif text-xs"
              ></textarea>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinical Assessment</label>
              <textarea
                rows={2}
                value={noteForm.assessment}
                onChange={(e) => setNoteForm({ ...noteForm, assessment: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-serif text-xs"
              ></textarea>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Treatment Plan & Follow-up</label>
              <textarea
                rows={3}
                value={noteForm.treatmentPlan}
                onChange={(e) => setNoteForm({ ...noteForm, treatmentPlan: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-serif text-xs"
              ></textarea>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-emerald-900 text-xs">Finalize and Digitally Sign Note</span>
              </div>
              <input
                type="checkbox"
                checked={noteForm.isFinalized}
                onChange={(e) => setNoteForm({ ...noteForm, isFinalized: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createNoteMutation.isPending}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{createNoteMutation.isPending ? 'Signing Note...' : 'Save & Finalize Note'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Prescription Modal with Live DDI & Allergy Check (Epic 4) */}
      {newRxModalOpen && (
        <Modal
          isOpen={newRxModalOpen}
          onClose={() => setNewRxModalOpen(false)}
          title="Issue Electronic Prescription & DDI Safety Screening"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreatePrescriptionSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinical Diagnosis</label>
              <input
                type="text"
                value={rxForm.diagnosis}
                onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lisinopril, Spironolactone, Amoxicillin"
                  value={rxForm.medName}
                  onChange={(e) => setRxForm({ ...rxForm, medName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dosage</label>
                <input
                  type="text"
                  value={rxForm.dosage}
                  onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* DDI Screening Gateway Results */}
            {ddiResult && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                ddiResult.overallStatus === 'CONTRAINDICATED'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : ddiResult.overallStatus === 'CAUTION'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="font-bold uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    CareConnect Clinical Pharmacology Gateway (NLM RxNorm Standard)
                  </span>
                  <Badge variant={ddiResult.overallStatus === 'CONTRAINDICATED' ? 'danger' : 'success'} size="sm">
                    {ddiResult.overallStatus}
                  </Badge>
                </div>

                {ddiResult.interactions.map((inter, iIdx) => (
                  <div key={iIdx} className="space-y-1">
                    <p className="font-bold text-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {inter.title} ({inter.severity})
                    </p>
                    <p className="text-[11px] leading-relaxed">{inter.clinicalMechanism}</p>
                    <p className="text-[10px] text-slate-700 font-semibold">Recommendation: {inter.clinicalRecommendation}</p>
                  </div>
                ))}

                {ddiResult.allergyAlerts.map((al, aIdx) => (
                  <div key={aIdx} className="space-y-1">
                    <p className="font-bold text-rose-800 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Allergy Cross-Reaction: {al.matchedAllergy}
                    </p>
                    <p className="text-[11px] leading-relaxed">{al.clinicalDescription}</p>
                  </div>
                ))}

                {ddiResult.interactions.length === 0 && ddiResult.allergyAlerts.length === 0 && (
                  <p className="text-emerald-800 text-[11px] font-medium">
                    ✓ No contraindicated drug-drug interactions or documented patient allergy conflicts flagged.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
                <input
                  type="text"
                  value={rxForm.frequency}
                  onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Duration</label>
                <input
                  type="text"
                  value={rxForm.duration}
                  onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Patient Instructions</label>
              <textarea
                rows={2}
                value={rxForm.instructions}
                onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewRxModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRxMutation.isPending || !rxForm.medName}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{createRxMutation.isPending ? 'Verifying & Signing...' : 'Digitally Sign & Issue Rx'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* HL7 v2.5.1 / FHIR R4 Modal (Epic 5) */}
      {hl7ModalOpen && (
        <Modal
          isOpen={hl7ModalOpen}
          onClose={() => setHl7ModalOpen(false)}
          title="Diagnostic Interoperability: HL7 v2.5.1 & FHIR R4 Specification"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 text-white p-3.5 rounded-xl font-mono text-[11px] space-y-1">
              <span className="text-emerald-400 font-bold block">HL7 v2.5.1 Unsolicited Observation Message (ORU^R01):</span>
              <pre className="text-slate-200 overflow-x-auto whitespace-pre p-2 bg-black/40 rounded border border-slate-800">
                {hl7Data || 'Generating HL7 message...'}
              </pre>
            </div>

            {fhirData && (
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1">
                <span className="text-indigo-700 font-bold block">HL7 FHIR Release 4 DiagnosticReport Resource (JSON):</span>
                <pre className="text-slate-800 overflow-x-auto whitespace-pre p-2 bg-white rounded border border-slate-200 max-h-48 overflow-y-auto">
                  {JSON.stringify(fhirData, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHl7ModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Close Interoperability Viewer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Diagnostic Report Modal */}
      {uploadReportModalOpen && (
        <Modal
          isOpen={uploadReportModalOpen}
          onClose={() => setUploadReportModalOpen(false)}
          title="Upload Diagnostic Report"
          maxWidth="max-w-xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              uploadReportMutation.mutate(doctorReportForm);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Report Title</label>
              <input
                type="text"
                value={doctorReportForm.title}
                onChange={(e) => setDoctorReportForm({ ...doctorReportForm, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Diagnostic Modality</label>
              <select
                value={doctorReportForm.category}
                onChange={(e) => setDoctorReportForm({ ...doctorReportForm, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="Laboratory Pathology">Laboratory Pathology</option>
                <option value="Diagnostic Imaging">Diagnostic Imaging</option>
                <option value="Cardiovascular Diagnostics">Cardiovascular Diagnostics</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinical Notes</label>
              <textarea
                rows={2}
                value={doctorReportForm.notes}
                onChange={(e) => setDoctorReportForm({ ...doctorReportForm, notes: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUploadReportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadReportMutation.isPending || !doctorReportForm.title}
                className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold shadow-sm"
              >
                <span>{uploadReportMutation.isPending ? 'Saving...' : 'Save & Attach to Patient Chart'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* AI Summary Modal */}
      {activeSummaryModal && (
        <Modal
          isOpen={!!activeSummaryModal}
          onClose={() => setActiveSummaryModal(null)}
          title={`Diagnostic Synthesis: ${activeSummaryModal.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {isSummarizing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-hospital-700">
                  <Sparkles className="w-4 h-4 animate-spin text-hospital-600" />
                  <span>Synthesizing report findings for clinician review...</span>
                </div>
                <AiSummarySkeleton />
              </div>
            ) : summaryResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Clinician Diagnostic Synthesis
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Verified Evidence</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Modality / Protocol:</span>
                      <span className="font-medium text-slate-100">{summaryResult.modalityBasis}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Grounding Standard:</span>
                      <span className="font-medium text-slate-100">{summaryResult.groundingProtocol}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] mb-1.5">Executive Summary</h4>
                  <p className="text-slate-800 leading-relaxed font-medium">{summaryResult.executiveSummary}</p>
                </div>

                {summaryResult.keyFindings && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">Key Diagnostic Findings</h4>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                      {summaryResult.keyFindings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </Modal>
      )}
    </div>
  );
};
