import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi, recordsApi } from '../../api';
import {
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Stethoscope,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  Activity,
  HeartPulse
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const DoctorDashboard = () => {
  const { data: appointments = [] } = useQuery({
    queryKey: ['doctor-appointments', 'D-201'],
    queryFn: () => appointmentsApi.getDoctorAppointments('D-201')
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['doctor-patients', 'D-201'],
    queryFn: () => recordsApi.getDoctorPatients('D-201')
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-500/10 rounded-l-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <Badge variant="success" size="sm" className="bg-emerald-800/80 text-emerald-200 border-emerald-600 mb-3">
            Physician Workspace • Room 304, West Wing
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Good morning, Dr. Rajesh Verma
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mb-6">
            Senior Consultant, Interventional Cardiology. You have <strong>4 patients scheduled</strong> for OPD clinic consultations today.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/doctor/patients"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Access "My Patients" Directory</span>
            </Link>
            <Link
              to="/doctor/schedule"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all inline-flex items-center gap-2 border border-white/20"
            >
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>View Clinic Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Today's Queue</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{appointments.length} Consultations</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">1 In-Waiting</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Assigned Patients</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{patients.length} Active</p>
            <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Under Care Pathway</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">AI Report Summaries</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">3 Available</p>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Echo & Holter ready</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Cath Lab Day</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Tomorrow</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">07:30 AM Angiograms</p>
          </div>
        </div>
      </div>

      {/* Main Row: Today's OPD Schedule Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Today's Outpatient Consultation Queue
            </h2>
          </div>
          <Link
            to="/doctor/schedule"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Primary Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">EHR Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-semibold font-mono text-slate-900">{apt.time}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900">{apt.patientName}</span>
                    <span className="block text-[11px] text-slate-400 font-mono">{apt.patientId}</span>
                  </td>
                  <td className="p-3">{apt.type}</td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">{apt.reason}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        apt.status === 'In-Waiting'
                          ? 'warning'
                          : apt.status === 'Scheduled'
                          ? 'primary'
                          : 'success'
                      }
                      size="sm"
                    >
                      {apt.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/doctor/patients/${apt.patientId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-hospital-50 hover:bg-hospital-100 text-hospital-800 font-semibold rounded-lg text-xs border border-hospital-200 transition-colors"
                    >
                      <span>Open Chart</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
