import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  User,
  Phone,
  Mail,
  Shield,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Female',
    bloodGroup: 'A+',
    address: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim()) errs.email = 'Valid email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.dob) errs.dob = 'Date of birth is required';
    if (!formData.emergencyName.trim()) errs.emergencyName = 'Emergency contact is required';
    if (!formData.emergencyPhone.trim()) errs.emergencyPhone = 'Emergency phone is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await register(formData);
      navigate('/patient/dashboard');
    } catch (err) {
      setErrors({ submit: 'Failed to create patient profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-hospital-600 text-white shadow-md shadow-hospital-600/25 mb-3">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Patient Registration Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Create your ApexCare Health System patient record
          </p>
        </div>

        <div className="bg-white shadow-xl border border-slate-200/80 rounded-2xl p-6 sm:p-10">
          {errors.submit && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Demographics */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 text-hospital-800">
                <User className="w-4 h-4 text-hospital-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Personal Demographics
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Ananya"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
                      errors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Sharma"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
                      errors.lastName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ananya.sharma@example.com"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
                      errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 234-8901"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
                      errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
                      errors.dob ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.dob && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.dob}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                    >
                      <option>Female</option>
                      <option>Male</option>
                      <option>Non-Binary</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                    >
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>O+</option>
                      <option>O-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, City, State, ZIP"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Emergency Contact */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 text-hospital-800">
                <HeartHandshake className="w-4 h-4 text-hospital-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Emergency Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
                      errors.emergencyName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.emergencyName && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.emergencyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleChange}
                    placeholder="e.g. Spouse / Sibling"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 901-4432"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
                      errors.emergencyPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.emergencyPhone && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.emergencyPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Health Insurance */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 text-hospital-800">
                <Shield className="w-4 h-4 text-hospital-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Health Insurance Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    placeholder="e.g. BlueCross BlueShield"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Policy / Member ID
                  </label>
                  <input
                    type="text"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    placeholder="e.g. BC-9928130"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Group Number
                  </label>
                  <input
                    type="text"
                    name="groupNumber"
                    value={formData.groupNumber}
                    onChange={handleChange}
                    placeholder="e.g. GRP-4412"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Already have an account? Sign In
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 bg-hospital-600 hover:bg-hospital-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-hospital-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Registering Patient...' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
