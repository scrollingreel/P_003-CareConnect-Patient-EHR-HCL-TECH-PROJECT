import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordsApi } from '../../api';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Calendar,
  Pill,
  ArrowRight,
  ShieldCheck,
  Filter,
  UserCheck,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const DoctorPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['doctor-patients', 'D-201', searchTerm],
    queryFn: () => recordsApi.getDoctorPatients('D-201', searchTerm)
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">My Patients Directory</h1>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Doctor-Scoped EHR
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Patients currently assigned to <strong>Dr. Rajesh Verma</strong> through clinical appointments and treatment care plans
          </p>
        </div>

        {/* Security scoping banner */}
        <div className="text-[11px] text-hospital-800 bg-hospital-50 border border-hospital-200 px-3 py-1.5 rounded-xl font-medium self-start sm:self-auto">
          Scoped to Doctor ID: <strong>D-201</strong> (Enforced via JWT)
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assigned patients by name or condition..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          Showing <strong>{patients.length}</strong> assigned patients
        </div>
      </div>

      {/* Patients List Table */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : patients.length === 0 ? (
        <EmptyState
          icon="users"
          title="No matching patients"
          description="No patients assigned to your care match the current search query."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Patient Demographics</th>
                  <th className="p-4">Primary Clinical Diagnosis</th>
                  <th className="p-4">Last Consultation</th>
                  <th className="p-4">Next Scheduled Visit</th>
                  <th className="p-4">Active Rx</th>
                  <th className="p-4">Risk Profile</th>
                  <th className="p-4 text-right">EHR Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {patients.map((pt) => (
                  <tr
                    key={pt.patientId}
                    className="hover:bg-hospital-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={pt.avatar}
                          alt={pt.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-hospital-700 transition-colors">
                            {pt.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {pt.patientId} • {pt.age}y • {pt.bloodGroup}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{pt.primaryDiagnosis}</span>
                    </td>

                    <td className="p-4 text-slate-600 font-mono">
                      {pt.lastVisit}
                    </td>

                    <td className="p-4 text-hospital-700 font-semibold">
                      {pt.nextAppointment}
                    </td>

                    <td className="p-4 font-mono font-semibold text-slate-800">
                      {pt.activePrescriptionCount} Medications
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          pt.riskLevel === 'High'
                            ? 'danger'
                            : pt.riskLevel === 'Moderate'
                            ? 'warning'
                            : 'success'
                        }
                        size="sm"
                      >
                        {pt.riskLevel}
                      </Badge>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/doctor/patients/${pt.patientId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-hospital-600 group-hover:bg-hospital-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                      >
                        <span>Open Chart</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
