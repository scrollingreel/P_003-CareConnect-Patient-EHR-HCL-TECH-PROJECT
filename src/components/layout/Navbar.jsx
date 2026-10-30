import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../context/AssistantContext';
import {
  Activity,
  Bot,
  LogOut,
  User,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  Building2,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, role, switchDemoRole, logout } = useAuth();
  const { toggleOpen, isOpen } = useAssistant();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (newRole) => {
    await switchDemoRole(newRole);
    if (newRole === 'patient') navigate('/patient/dashboard');
    else if (newRole === 'doctor') navigate('/doctor/dashboard');
    else if (newRole === 'admin') navigate('/admin/analytics');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Stethoscope className="w-3.5 h-3.5" />
            Physician EHR
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="w-3.5 h-3.5" />
            Hospital Administration
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <User className="w-3.5 h-3.5" />
            Patient Portal
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hospital-700 to-hospital-500 flex items-center justify-center text-white shadow-md shadow-hospital-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  ApexCare <span className="text-hospital-600 font-extrabold text-sm uppercase px-1.5 py-0.5 rounded bg-hospital-50 border border-hospital-200">HMS</span>
                </span>
                <span className="block text-[11px] font-medium text-slate-500 -mt-1 tracking-wider uppercase">
                  RAG-Enhanced Hospital System
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-hospital-600" />
              Demo Role:
            </span>
            <button
              onClick={() => handleRoleSwitch('patient')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                role === 'patient'
                  ? 'bg-white text-hospital-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patient (Ananya)
            </button>
            <button
              onClick={() => handleRoleSwitch('doctor')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                role === 'doctor'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Doctor (Dr. Verma)
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                role === 'admin'
                  ? 'bg-white text-purple-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin (Operations)
            </button>
          </div>

          {/* Right Actions: RAG Assistant Trigger & User Profile */}
          <div className="flex items-center gap-3">
            {/* RAG Assistant Header Button */}
            <button
              onClick={toggleOpen}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                isOpen
                  ? 'bg-hospital-700 text-white shadow-hospital-600/30'
                  : 'bg-hospital-50 text-hospital-700 hover:bg-hospital-100 border border-hospital-200'
              }`}
              title="Open RAG Healthcare Knowledge Assistant"
            >
              <Sparkles className="w-4 h-4 text-hospital-600" />
              <span className="hidden sm:inline">AI Knowledge Assistant</span>
              <span className="sm:hidden">AI</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hospital-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-hospital-600"></span>
              </span>
            </button>

            {/* Role Badge */}
            <div className="hidden lg:block">{getRoleBadge()}</div>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {role === 'patient' && (
                      <Link
                        to="/patient/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Patient Demographics & Insurance
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl shadow-sm transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
