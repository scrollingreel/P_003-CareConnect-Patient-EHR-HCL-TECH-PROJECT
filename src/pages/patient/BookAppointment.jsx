import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, recordsApi } from '../../api';
import {
  Calendar,
  Clock,
  User,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Stethoscope,
  Activity,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  Star,
  FileText,
  Paperclip,
  Upload,
  Plus,
  Check,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

const departmentIconMap = {
  HeartPulse: HeartPulse,
  Brain: Brain,
  Bone: Bone,
  Baby: Baby,
  Stethoscope: Stethoscope,
  Activity: Activity
};

export const BookAppointment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-09-08');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultType, setConsultType] = useState('In-person Consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Medical report attachment states
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportCategory, setNewReportCategory] = useState('Laboratory Pathology');
  const [customAttachedReports, setCustomAttachedReports] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
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
    setUploadedFile({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'application/pdf',
      raw: file
    });
    if (!newReportTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setNewReportTitle(cleanName);
    }
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

  // Fetch departments
  const { data: departments = [], isLoading: isDeptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => appointmentsApi.getDepartments()
  });

  // Fetch doctors for selected department
  const { data: doctors = [], isLoading: isDocsLoading } = useQuery({
    queryKey: ['doctors', selectedDept?.id],
    queryFn: () => appointmentsApi.getDoctors(selectedDept?.id),
    enabled: !!selectedDept
  });

  // Fetch available slots
  const { data: slots = [], isLoading: isSlotsLoading } = useQuery({
    queryKey: ['slots', selectedDoctor?.id, selectedDate],
    queryFn: () => appointmentsApi.getAvailableSlots(selectedDoctor?.id, selectedDate),
    enabled: !!selectedDoctor && !!selectedDate
  });

  // Fetch patient medical records to allow attaching reports
  const { data: patientRecord } = useQuery({
    queryKey: ['patient-record', 'P-1001'],
    queryFn: () => recordsApi.getPatientMedicalRecord('P-1001')
  });

  const [bookingError, setBookingError] = useState(null);

  // Booking mutation
  const bookMutation = useMutation({
    mutationFn: (data) => appointmentsApi.bookAppointment(data),
    onSuccess: (newApt) => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient-record'] });
      setBookingSuccess(newApt);
      setBookingError(null);
    },
    onError: (err) => {
      console.error('Appointment booking error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to schedule appointment. Please try again.';
      setBookingError(msg);
    }
  });

  const handleToggleReportSelection = (reportId) => {
    setSelectedReportIds((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const handleAddCustomReport = async (e) => {
    e.preventDefault();
    if (!newReportTitle.trim()) return;
    const newDoc = {
      id: `REP-NEW-${Date.now()}`,
      title: newReportTitle,
      category: newReportCategory,
      date: new Date().toISOString().split('T')[0],
      fileName: uploadedFile?.name || `${newReportTitle.replace(/\s+/g, '_')}.pdf`,
      fileType: uploadedFile?.name?.match(/\.(png|jpg|jpeg)$/i) ? 'Image' : 'PDF',
      fileSize: uploadedFile?.size || '1.8 MB',
      status: 'Attached by Patient',
      uploadedBy: 'Patient Upload (Booking Flow)',
      rawContent: `Patient diagnostic report "${newReportTitle}" attached during appointment booking.`
    };

    // Immediately persist into patient records store & localStorage
    try {
      await recordsApi.uploadReport('P-1001', newDoc);
      queryClient.invalidateQueries({ queryKey: ['patient-record'] });
    } catch (err) {
      console.warn('Failed to upload custom report to recordsApi:', err);
    }

    setCustomAttachedReports((prev) => [...prev, newDoc]);
    setSelectedReportIds((prev) => [...prev, newDoc.id]);
    setNewReportTitle('');
    setUploadedFile(null);
    setShowUploadModal(false);
  };

  const handleConfirmBooking = () => {
    const existingSelected = (patientRecord?.reports || []).filter((r) =>
      selectedReportIds.includes(r.id)
    );
    const allAttached = [...existingSelected, ...customAttachedReports];

    bookMutation.mutate({
      doctorId: selectedDoctor.id,
      patientId: 'P-1001',
      patientName: 'Ananya Sharma',
      date: selectedDate,
      time: selectedSlot,
      type: consultType,
      reason: reason || 'Routine specialist consultation',
      notes,
      attachedReports: allAttached
    });
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Appointment Confirmed!</h2>
          <p className="text-xs text-slate-500 mb-6">
            Reference ID: <span className="font-mono font-bold text-slate-700">{bookingSuccess.id}</span>
          </p>

          <div className="bg-slate-50 rounded-xl p-4 text-left text-xs space-y-2.5 border border-slate-200 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Physician:</span>
              <span className="font-semibold text-slate-800">{bookingSuccess.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-800">{bookingSuccess.departmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-semibold text-hospital-700">
                {bookingSuccess.date} at {bookingSuccess.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-800">{bookingSuccess.room}</span>
            </div>
            {bookingSuccess.attachedReports && bookingSuccess.attachedReports.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Attached Patient Reports ({bookingSuccess.attachedReports.length}):</span>
                <div className="flex flex-wrap gap-1.5">
                  {bookingSuccess.attachedReports.map((r, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
                      <FileText className="w-3 h-3 text-emerald-600" />
                      {r.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/patient/appointments')}
              className="px-5 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              View My Appointments
            </button>
            <button
              onClick={() => {
                setBookingSuccess(null);
                setStep(1);
                setSelectedDept(null);
                setSelectedDoctor(null);
                setSelectedSlot(null);
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Progress Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-hospital-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-hospital-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
            <span className="text-xs hidden sm:inline">Select Department</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-hospital-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-hospital-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
            <span className="text-xs hidden sm:inline">Select Doctor</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-hospital-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-hospital-600 text-white' : 'bg-slate-100 text-slate-500'}`}>3</span>
            <span className="text-xs hidden sm:inline">Date & Slot</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-hospital-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-hospital-600 text-white' : 'bg-slate-100 text-slate-500'}`}>4</span>
            <span className="text-xs hidden sm:inline">Confirm</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Department */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select Clinical Department</h2>
            <p className="text-xs text-slate-500">Choose the specialty department for your consultation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => {
              const IconComp = departmentIconMap[dept.icon] || Stethoscope;
              const isSelected = selectedDept?.id === dept.id;

              return (
                <div
                  key={dept.id}
                  onClick={() => {
                    setSelectedDept(dept);
                    setSelectedDoctor(null);
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-hospital-600 bg-hospital-50/50 shadow-sm ring-1 ring-hospital-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${isSelected ? 'bg-hospital-600 text-white' : 'bg-slate-100 text-hospital-700'}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                        {isSelected && <Badge variant="primary" size="sm">Selected</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Lead: {dept.headDoctor}</span>
                        <span>{dept.floor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={!selectedDept}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              <span>Next: Select Doctor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Select Attending Physician</h2>
              <p className="text-xs text-slate-500">
                Showing specialists in <strong className="text-slate-800">{selectedDept?.name}</strong>
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Change Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => {
              const isSelected = selectedDoctor?.id === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-hospital-600 bg-hospital-50/50 shadow-sm ring-1 ring-hospital-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                        <div className="flex items-center text-amber-500 text-xs font-semibold gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{doc.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-hospital-700 font-medium">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.experienceYears} Years Clinical Experience</p>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{doc.room}</span>
                        <span className="font-bold text-slate-800">${doc.consultationFee} Consultation</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={!selectedDoctor}
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              <span>Next: Select Date & Time</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Date & Time Slot */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Choose Date & Consultation Slot</h2>
              <p className="text-xs text-slate-500">
                Booking with <strong className="text-slate-800">{selectedDoctor?.name}</strong>
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Change Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Selection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-hospital-600" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
              />

              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
                <p><strong>OPD Clinic Hours:</strong> {selectedDoctor?.timings}</p>
                <p>
                  <strong>Days:</strong>{' '}
                  {Array.isArray(selectedDoctor?.availabilityDays)
                    ? selectedDoctor.availabilityDays.join(', ')
                    : selectedDoctor?.availabilityDays || 'Monday - Friday'}
                </p>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-hospital-600" />
                Available Consultation Slots
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {slots.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.time)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      !s.available
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-dashed border-slate-200'
                        : selectedSlot === s.time
                        ? 'bg-hospital-600 text-white shadow-sm ring-2 ring-hospital-600'
                        : 'bg-hospital-50/60 hover:bg-hospital-100 text-hospital-800 border border-hospital-200'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Selected Slot: <strong>{selectedSlot}</strong> on {selectedDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={!selectedSlot}
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-6 py-2.5 bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              <span>Next: Review & Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Summary & Confirmation */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Review & Confirm Appointment</h2>
            <p className="text-xs text-slate-500">Verify your consultation details before finalizing</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              {/* Doctor Card */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedDoctor?.avatar}
                  alt={selectedDoctor?.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <Badge variant="primary" size="sm">{selectedDept?.name}</Badge>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedDoctor?.name}</h3>
                  <p className="text-xs text-slate-500">{selectedDoctor?.title}</p>
                  <p className="text-xs font-semibold text-hospital-700 mt-1">{selectedDoctor?.room}</p>
                </div>
              </div>

              {/* Timing Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-bold text-slate-800">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Slot:</span>
                  <span className="font-bold text-hospital-700">{selectedSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-slate-800">${selectedDoctor?.consultationFee} (Covered by BCBS)</span>
                </div>
              </div>
            </div>

            {/* Inputs: Reason for visit & Type */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Consultation Type</label>
                  <select
                    value={consultType}
                    onChange={(e) => setConsultType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  >
                    <option>In-person Consultation</option>
                    <option>Follow-up Review</option>
                    <option>Second Opinion</option>
                    <option>Pre-Op Clearance</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Reason for Visit</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Chest flutter review, BP titration"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Additional Clinical Notes / Symptoms (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention any active medications, allergy changes, or symptoms..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                ></textarea>
              </div>

              {/* Attach Medical Reports Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Paperclip className="w-4 h-4 text-hospital-600" />
                      Attach Medical Reports & Prior Diagnostics (Optional)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Select past lab tests or upload new reports so {selectedDoctor?.name} can review them prior to your visit.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-hospital-50 hover:bg-hospital-100 text-hospital-700 font-semibold rounded-xl text-xs border border-hospital-200 transition-colors shadow-xs self-start sm:self-auto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Report</span>
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  {(patientRecord?.reports || []).map((report) => {
                    const isSelected = selectedReportIds.includes(report.id);
                    return (
                      <div
                        key={report.id}
                        onClick={() => handleToggleReportSelection(report.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-hospital-50/70 border-hospital-400 ring-1 ring-hospital-400'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-hospital-600 rounded border-slate-300 pointer-events-none"
                          />
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{report.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {report.category} • Date: {report.date} • {report.fileSize || '1.8 MB'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isSelected ? 'primary' : 'default'} size="sm">
                          {isSelected ? 'Attached' : 'Include'}
                        </Badge>
                      </div>
                    );
                  })}

                  {customAttachedReports.map((cDoc) => (
                    <div
                      key={cDoc.id}
                      className="flex items-center justify-between p-3 rounded-xl border bg-emerald-50/80 border-emerald-300 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">{cDoc.title}</p>
                          <p className="text-[11px] text-slate-600">
                            Newly Uploaded ({cDoc.category} • {cDoc.fileType})
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">Attached for Doctor</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl animate-fade-in text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900">Upload & Attach Diagnostic Report</h3>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddCustomReport} className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Report / Test Title</label>
                    <input
                      type="text"
                      value={newReportTitle}
                      onChange={(e) => setNewReportTitle(e.target.value)}
                      placeholder="e.g. Recent Blood Sugar & HbA1c Lab"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Diagnostic Category</label>
                    <select
                      value={newReportCategory}
                      onChange={(e) => setNewReportCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option>Laboratory Pathology (Blood / Urine)</option>
                      <option>Diagnostic Imaging (MRI / CT / X-Ray)</option>
                      <option>Cardiovascular Diagnostics (Echo / ECG / Holter)</option>
                      <option>Prior Surgical or Discharge Summary</option>
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

                    {!uploadedFile ? (
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
                            : 'border-hospital-200 hover:border-hospital-400 bg-hospital-50/30 hover:bg-hospital-50/60'
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
                              {uploadedFile.name}
                            </p>
                            <p className="text-[10px] text-slate-500">{uploadedFile.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="success" size="sm">File Selected</Badge>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
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

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newReportTitle.trim()}
                      className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs shadow-sm"
                    >
                      Attach to Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {bookingError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 animate-fade-in shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-bold">Booking Request Failed</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{bookingError}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              disabled={bookMutation.isPending}
              onClick={handleConfirmBooking}
              className="flex items-center gap-2 px-8 py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-md shadow-hospital-600/20 transition-all disabled:opacity-50"
            >
              <span>{bookMutation.isPending ? 'Confirming with Hospital System...' : 'Confirm & Schedule Appointment'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
