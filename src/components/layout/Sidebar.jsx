import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../context/AssistantContext';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Pill,
  FolderHeart,
  UserCheck,
  Users,
  Clock,
  BarChart3,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();
  const { openAssistant } = useAssistant();

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Patient Dashboard', icon: LayoutDashboard },
    { to: '/patient/book-appointment', label: 'Book Appointment', icon: CalendarPlus },
    { to: '/patient/appointments', label: 'My Appointments', icon: CalendarDays },
    { to: '/patient/prescriptions', label: 'My Prescriptions', icon: Pill },
    { to: '/patient/records', label: 'Medical Records', icon: FolderHeart },
    { to: '/patient/profile', label: 'Demographics & Insurance', icon: UserCheck },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Physician Overview', icon: LayoutDashboard },
    { to: '/doctor/patients', label: 'My Patients Directory', icon: Users },
    { to: '/doctor/schedule', label: "Today's Clinic Schedule", icon: Clock },
    { to: '/doctor/prescriptions', label: 'Prescription Records', icon: Pill },
  ];

  const adminLinks = [
    { to: '/admin/analytics', label: 'AI Analytics & RAG Metrics', icon: BarChart3 },
    { to: '/doctor/patients', label: 'Clinical Patient Audit', icon: Users },
  ];

  let currentLinks = patientLinks;
  if (role === 'doctor') currentLinks = doctorLinks;
  else if (role === 'admin') currentLinks = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] no-print">
      {/* Navigation list */}
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {role === 'doctor' ? 'Clinical Workspace' : role === 'admin' ? 'Administration' : 'Patient Services'}
          </p>
          <nav className="space-y-1">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-hospital-50 text-hospital-700 font-bold border border-hospital-200 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-hospital-600 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI Assistant Callout Box */}
        <div className="bg-gradient-to-br from-hospital-900 to-slate-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-hospital-500/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2 text-hospital-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide">RAG Assistant</span>
          </div>
          <p className="text-xs text-slate-200 mb-3 leading-relaxed">
            Instant queries grounded in hospital guidelines, doctors' timings, & policies.
          </p>
          <button
            onClick={openAssistant}
            className="w-full py-2 px-3 bg-hospital-500 hover:bg-hospital-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Ask Healthcare AI</span>
          </button>
        </div>
      </div>

      {/* Footer System Disclaimer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-tight">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>ApexCare EHR & RAG Assistant v1.0. Final Year Major Project.</p>
        </div>
      </div>
    </aside>
  );
};
