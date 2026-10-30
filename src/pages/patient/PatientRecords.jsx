import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsApi } from '../../api';
import { USE_MOCK } from '../../api/client';
import {
  FileText,
  Upload,
  Sparkles,
  Calendar,
  CheckCircle,
  FileCheck2,
  FileCheck,
  AlertCircle,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton, AiSummarySkeleton } from '../../components/common/SkeletonLoader';

export const PatientRecords = () => {
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [summaryReport, setSummaryReport] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [recordFile, setRecordFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const processFile = (file) => {
    if (!file) return;
    setRecordFile({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'application/pdf',
      raw: file
    });
    setUploadForm((prev) => ({
      ...prev,
      fileName: file.name,
      title: prev.title.trim() ? prev.title : file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  // Form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Laboratory Pathology',
    notes: '',
    fileName: 'Lab_Report_2026.pdf'
  });

  const { data: medicalRecord, isLoading } = useQuery({
    queryKey: ['patient-record', 'P-1001'],
    queryFn: () => recordsApi.getPatientMedicalRecord('P-1001')
  });

  const uploadMutation = useMutation({
    mutationFn: (data) =>
      recordsApi.uploadReport('P-1001', {
        ...data,
        fileName: recordFile?.name || (data.title ? `${data.title.replace(/\s+/g, '_')}.pdf` : 'Report.pdf'),
        fileSize: recordFile?.size || '1.8 MB',
        fileType: recordFile?.name?.match(/\.(png|jpg|jpeg)$/i) ? 'Image' : 'PDF',
        uploadedBy: 'Patient Self-Upload'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-record'] });
      setUploadModalOpen(false);
      setRecordFile(null);
      setUploadForm({ title: '', category: 'Laboratory Pathology', notes: '', fileName: 'Report.pdf' });
    }
  });

  const handleOpenSummary = async (report) => {
    setSummaryReport(report);
    setSummaryData(null);
    setIsSummarizing(true);
    try {
      const summary = await recordsApi.summarizeReport(report.id, 'P-1001');
      setSummaryData(summary);
    } finally {
      setIsSummarizing(false);
    }
  };

  const reports = medicalRecord?.reports || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Medical Records & Diagnostic Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            EHR diagnostic imaging, clinical pathology labs, and AI-assisted report summaries
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Report</span>
        </button>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-hospital-700 flex items-center justify-center shrink-0 border border-teal-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                    <Badge variant="primary" size="sm">{report.category}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Date: {report.date}
                    </span>
                    <span>•</span>
                    <span>Size: {report.fileSize || '1.8 MB'}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">{report.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Source: {report.uploadedBy}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {/* AI Summarize action button */}
                <button
                  onClick={() => handleOpenSummary(report)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Summarize</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Summary Modal */}
      {summaryReport && (
        <Modal
          isOpen={!!summaryReport}
          onClose={() => setSummaryReport(null)}
          title={`${USE_MOCK ? 'Prototype Report Summary' : 'AI-Assisted Report Summary'} — ${summaryReport.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {isSummarizing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-hospital-700">
                  <Sparkles className="w-4 h-4 animate-spin text-hospital-600" />
                  <span>{USE_MOCK ? 'Preparing a prototype summary preview...' : 'Extracting report findings for clinician review...'}</span>
                </div>
                <AiSummarySkeleton />
              </div>
            ) : summaryData ? (
              <div className="space-y-4 text-xs animate-fade-in">
                {/* Clinical Grounding Basis Card */}
                <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {USE_MOCK ? 'Prototype summary demo' : 'AI-assisted clinician-review pipeline'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{USE_MOCK ? 'No AI model invoked' : 'Server-configured model'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Modality / Image View Analyzed:</span>
                      <span className="font-medium text-slate-100">
                        {summaryData.modalityBasis || 'Clinical Diagnostic Radiography'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Evidence Grounding Standard:</span>
                      <span className="font-medium text-slate-100">
                        {summaryData.groundingProtocol || 'ACR / Clinical Practice Guidelines'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
                  <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    Radiological & Diagnostic Executive Summary
                  </h4>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {summaryData.executiveSummary}
                  </p>
                </div>

                {/* Key Findings */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                    Key Clinical Findings & Measured Parameters
                  </h4>
                  <ul className="space-y-1.5">
                    {summaryData.keyFindings?.map((kf, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-hospital-600 shrink-0 mt-0.5" />
                        <span>{kf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clinical Significance & Recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <h5 className="font-bold text-slate-800 text-[11px] mb-1">Clinical Significance</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {summaryData.clinicalSignificance}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <h5 className="font-bold text-slate-800 text-[11px] mb-1">Physician Recommendation</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {summaryData.recommendations}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800">
                  {USE_MOCK
                    ? 'Prototype data only: this is not a clinical interpretation and must not be used for medical decisions.'
                    : 'AI-assisted summary for clinician review only. Always verify against the certified radiologist/pathologist report.'}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSummaryReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close Summary
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Upload Patient Diagnostic Report"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Report Title</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g. Holter Monitor 48h Analysis"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Diagnostic Category</label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="Laboratory Pathology">Laboratory Pathology (Blood / Urine / Histology)</option>
                <option value="Diagnostic Imaging">Diagnostic Imaging (MRI / CT / X-Ray / Ultrasound)</option>
                <option value="Cardiovascular Diagnostics">Cardiovascular Diagnostics (Echo / ECG / Holter)</option>
                <option value="Discharge & Surgical Summaries">Discharge & Surgical Summaries</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select / Browse Report File</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="hidden"
              />

              {!recordFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-hospital-500 bg-hospital-50'
                      : 'border-slate-300 hover:border-hospital-400 bg-slate-50 hover:bg-hospital-50/40'
                  }`}
                >
                  <Upload className="w-8 h-8 text-hospital-600 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-800 text-xs">
                    Click to browse file or drag & drop here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PDF, JPG, PNG, DOCX up to 25MB
                  </p>
                </div>
              ) : (
                <div className="p-3.5 border border-emerald-300 rounded-xl bg-emerald-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-900 text-xs truncate">
                        {recordFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{recordFile.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="success" size="sm">File Selected</Badge>
                    <button
                      type="button"
                      onClick={() => {
                        setRecordFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Patient Clinical Notes</label>
              <textarea
                rows={2}
                value={uploadForm.notes}
                onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                placeholder="Additional notes for attending physician..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={uploadMutation.isPending || !uploadForm.title}
                onClick={() => uploadMutation.mutate(uploadForm)}
                className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Save & Upload'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
