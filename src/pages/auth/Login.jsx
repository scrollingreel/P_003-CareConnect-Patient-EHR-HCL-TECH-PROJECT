import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../api';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Building2,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('patient');
  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('SecurePass2026!');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleTabChange = (roleKey) => {
    setSelectedRole(roleKey);
    const demo = DEMO_ACCOUNTS[roleKey];
    if (demo) {
      setEmail(demo.email);
      setPassword('SecurePass2026!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login({ email, password, role: selectedRole });
      
      const origin = location.state?.from?.pathname;
      if (origin) {
        navigate(origin, { replace: true });
      } else if (user.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/analytics');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-hospital-700 to-hospital-500 text-white shadow-lg shadow-hospital-500/25 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          ApexCare Health System
        </h2>
        <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          AI-Enhanced Hospital Management & EHR Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200/80 rounded-2xl">
          {/* Role selector tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Portal Role
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleTabChange('patient')}
                className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'patient'
                    ? 'bg-white text-hospital-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 mb-1 text-hospital-600" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange('doctor')}
                className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'doctor'
                    ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 mb-1 text-emerald-600" />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-white text-purple-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Reminder */}
          <div className="mb-5 p-3 rounded-xl bg-hospital-50/70 border border-hospital-200 text-xs text-hospital-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-hospital-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-hospital-800">
                Auto-filled Demo: {DEMO_ACCOUNTS[selectedRole]?.name}
              </p>
              <p className="text-[11px] text-hospital-700">
                JWT token managed in-memory per OWASP guidelines.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-hospital-600 hover:bg-hospital-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-hospital-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : `Sign In as ${selectedRole.toUpperCase()}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {selectedRole === 'patient' && (
            <div className="mt-6 text-center pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                New patient at ApexCare?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-hospital-600 hover:text-hospital-700 underline"
                >
                  Register an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
