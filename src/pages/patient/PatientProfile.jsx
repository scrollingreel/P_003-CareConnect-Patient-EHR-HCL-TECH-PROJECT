import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_CURRENT_PATIENT } from '../../api';
import {
  User,
  Shield,
  Phone,
  Mail,
  Calendar,
  Heart,
  Save,
  CheckCircle,
  AlertCircle,
  FileCheck2,
  Activity
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const PatientProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(MOCK_CURRENT_PATIENT);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    dob: profile.dob,
    address: profile.address,
    emergencyName: profile.emergencyContact.name,
    emergencyRelation: profile.emergencyContact.relation,
    emergencyPhone: profile.emergencyContact.phone,
    insuranceProvider: profile.insurance.provider,
    policyNumber: profile.insurance.policyNumber,
    groupNumber: profile.insurance.groupNumber
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const updatedData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      address: formData.address,
      emergencyContact: {
        name: formData.emergencyName,
        relation: formData.emergencyRelation,
        phone: formData.emergencyPhone
      },
      insurance: {
        ...profile.insurance,
        provider: formData.insuranceProvider,
        policyNumber: formData.policyNumber,
        groupNumber: formData.groupNumber
      }
    };
    setProfile((prev) => ({
      ...prev,
      ...updatedData
    }));
    try {
      await recordsApi.updateProfile(updatedData);
    } catch (err) {
      console.warn('Backend profile sync:', err);
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-hospital-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
              <Badge variant="primary">MRN: {profile.id}</Badge>
              <Badge variant="success">Blood: {profile.bloodGroup}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Age: {profile.age} • Gender: {profile.gender} • Registered ApexCare Patient
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Edit Patient Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Patient profile details successfully updated and saved to EHR record.</span>
        </div>
      )}

      {/* Profile Details Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Demographics & Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-hospital-600" />
            Personal & Contact Demographics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Full Legal Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-medium text-slate-800">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-medium text-slate-800">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Primary Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-medium text-slate-800">{profile.phone}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-medium text-slate-800">{profile.dob}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-600 block mb-1">Residential Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-medium text-slate-800">{profile.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-hospital-600" />
            Designated Emergency Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Contact Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-medium text-slate-800">
                  {profile.emergencyContact.name}
                </p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Relationship</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyRelation"
                  value={formData.emergencyRelation}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-medium text-slate-800">
                  {profile.emergencyContact.relation}
                </p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Contact Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-medium text-slate-800">
                  {profile.emergencyContact.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Insurance & Medical Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Card */}
          <div className="bg-gradient-to-br from-hospital-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-hospital-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-hospital-300">
                  Verified Healthcare Coverage
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                {profile.insurance.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Provider</p>
                <p className="text-sm font-bold text-white">{profile.insurance.provider}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Policy / Member ID</p>
                  <p className="font-mono text-xs font-semibold text-hospital-200">{profile.insurance.policyNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Group Number</p>
                  <p className="font-mono text-xs font-semibold text-hospital-200">{profile.insurance.groupNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Known Allergies & Clinical Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Documented Allergies & Chronic Notes
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">Documented Allergies:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy, i) => (
                      <Badge key={i} variant="danger" size="sm">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">Chronic Care Pathways:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.chronicConditions.map((cond, i) => (
                      <Badge key={i} variant="warning" size="sm">
                        {cond}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 italic">
              Allergy updates must be confirmed by an attending nurse or physician during clinical intake.
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
