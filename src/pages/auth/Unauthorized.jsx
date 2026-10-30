import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Unauthorized = () => {
  const { role } = useAuth();

  const getDefaultRoute = () => {
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'admin') return '/admin/analytics';
    return '/patient/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Your current profile role (<strong>{role?.toUpperCase()}</strong>) does not have authorization to view this medical workspace.
        </p>
        <Link
          to={getDefaultRoute()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Your Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
