import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../../api';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const DoctorSchedule = () => {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['doctor-schedule', 'D-201'],
    queryFn: () => appointmentsApi.getDoctorAppointments('D-201')
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Physician Clinic Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cardiology Outpatient Clinic • Room 304, West Wing • Dr. Rajesh Verma
          </p>
        </div>

        <Badge variant="primary" size="lg">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Badge>
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="space-y-4">
          {appointments.map((apt, idx) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-mono font-bold text-sm shrink-0 border border-emerald-200">
                  {apt.time}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{apt.patientName}</h3>
                    <Badge variant="primary" size="sm">{apt.type}</Badge>
                    <Badge
                      variant={
                        apt.status === 'In-Waiting'
                          ? 'warning'
                          : apt.status === 'Scheduled'
                          ? 'info'
                          : 'success'
                      }
                      size="sm"
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Chief Complaint:</strong> {apt.reason}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Patient ID: {apt.patientId} • Clinical OPD Suite
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Link
                  to={`/doctor/patients/${apt.patientId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <span>Open Patient Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
