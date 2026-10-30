import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../context/AssistantContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsApi } from '../../api';
import {
  Calendar,
  Pill,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  HeartPulse,
  PlusCircle,
  AlertCircle,
  MessageSquare,
  Send,
  Bell,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { openAssistant } = useAssistant();
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');

  const { data: messages = [] } = useQuery({
    queryKey: ['patient-messages', 'P-1001'],
    queryFn: () => recordsApi.getSecureMessages('P-1001')
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['patient-notifications', 'P-1001'],
    queryFn: () => recordsApi.getNotifications('P-1001')
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => recordsApi.sendSecureMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-messages', 'P-1001'] });
      setMessageText('');
      setMessageSubject('');
    }
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate({
      patientId: 'P-1001',
      senderId: 'P-1001',
      senderName: 'Ananya Sharma',
      senderRole: 'PATIENT',
      recipientId: 'D-201',
      recipientName: 'Dr. Rajesh Verma',
      recipientRole: 'DOCTOR',
      subject: messageSubject || 'Medical Question',
      body: messageText
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-hospital-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-hospital-500/10 rounded-l-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <Badge variant="primary" size="sm" className="bg-hospital-700/80 text-hospital-200 border-hospital-600 mb-3">
            CareConnect EHR Patient Portal • MRN: P-1001
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back, Ananya
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            You have an upcoming consultation with <strong>Dr. Rajesh Verma (Cardiology)</strong> scheduled for tomorrow at 10:00 AM.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/patient/book-appointment"
              className="px-4 py-2.5 bg-hospital-500 hover:bg-hospital-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <button
              onClick={openAssistant}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all inline-flex items-center gap-2 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-hospital-300" />
              <span>Ask AI Knowledge Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Appointments</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">1 Scheduled</p>
            <p className="text-[11px] text-hospital-600 font-semibold mt-0.5">Next: Tomorrow 10 AM</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Prescriptions</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">3 Active</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">MAR Log Verified</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Diagnostic Scans</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">3 Reports</p>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">HL7 / FHIR Grounded</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Insurance Status</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">Star Health Premier</p>
            <Badge variant="success" size="sm" className="mt-1">Verified Active</Badge>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Appointment & Active Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Appointment Card (Col 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-hospital-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Next Upcoming Consultation
              </h2>
            </div>
            <Link
              to="/patient/appointments"
              className="text-xs font-semibold text-hospital-600 hover:text-hospital-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-hospital-50/60 rounded-2xl p-5 border border-hospital-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                alt="Dr. Rajesh Verma"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-xs"
              />
              <div>
                <Badge variant="primary" size="sm">Cardiology</Badge>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Dr. Rajesh Verma, MD, FACC</h3>
                <p className="text-xs text-slate-600">Review 3-month BP log and medication response</p>
                <div className="flex items-center gap-3 text-xs text-hospital-800 font-semibold mt-2">
                  <span>Tomorrow (Sep 05) at 10:00 AM</span>
                  <span>•</span>
                  <span>Room 304, West Wing</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <Link
                to="/patient/appointments"
                className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold text-center transition-colors shadow-xs"
              >
                Appointment Details
              </Link>
            </div>
          </div>

          {/* Clinical Tip */}
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
            <HeartPulse className="w-4 h-4 text-hospital-600 shrink-0 mt-0.5" />
            <p>
              Please bring your morning home blood pressure log and current pill bottles to your consultation tomorrow.
            </p>
          </div>
        </div>

        {/* Quick Prescription List (Col 1) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Active Medications
                </h2>
              </div>
              <Link
                to="/patient/prescriptions"
                className="text-xs font-semibold text-hospital-600 hover:text-hospital-700"
              >
                Print Rx
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Lisinopril 10 mg</span>
                  <span className="text-emerald-700 font-mono">1x Daily (AM)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">For blood pressure control</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Atorvastatin 10 mg</span>
                  <span className="text-emerald-700 font-mono">1x Bedtime</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Cholesterol management</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Metoprolol 25 mg</span>
                  <span className="text-emerald-700 font-mono">2x Daily</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">For mild palpitations</p>
              </div>
            </div>
          </div>

          <Link
            to="/patient/prescriptions"
            className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center rounded-xl text-xs font-semibold transition-colors"
          >
            Manage Refills & Schedule
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Secure Messaging & Notifications (Epic 6 & 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Secure Messaging Widget (Epic 7) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Secure Provider Messaging
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              End-to-End EHR Scoped
            </span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {messages.map((m, idx) => {
              const isMe = m.senderRole === 'PATIENT';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs max-w-[88%] ${
                    isMe
                      ? 'ml-auto bg-hospital-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-80">
                    <span className="font-bold">{m.senderName}</span>
                    <span>{m.createdAt ? m.createdAt.slice(0, 10) : 'Recent'}</span>
                  </div>
                  {m.subject && <p className="font-semibold text-[11px] mb-0.5">{m.subject}</p>}
                  <p className="leading-relaxed">{m.body}</p>
                </div>
              );
            })}
          </div>

          {/* Compose message */}
          <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 space-y-2">
            <input
              type="text"
              placeholder="Subject (e.g. Question regarding medication dose)"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message to Dr. Rajesh Verma..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="submit"
                disabled={sendMessageMutation.isPending || !messageText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Notifications & System Events Center (Epic 6 & 7) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-hospital-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Patient Notification Center
              </h2>
            </div>
            <Badge variant="primary" size="sm">System Integration</Badge>
          </div>

          <div className="space-y-3">
            {notifications.map((n, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                  n.severity === 'CRITICAL'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-hospital-100 text-hospital-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <Badge variant={n.severity === 'CRITICAL' ? 'danger' : 'default'} size="sm">
                      {n.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
