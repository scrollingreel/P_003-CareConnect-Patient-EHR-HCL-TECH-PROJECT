import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../../api';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CalendarPlus,
  AlertCircle,
  CheckCircle2,
  CalendarX,
  CalendarClock,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const MyAppointments = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [cancelModalApt, setCancelModalApt] = useState(null);
  const [rescheduleModalApt, setRescheduleModalApt] = useState(null);
  const [cancelReason, setCancelReason] = useState('Schedule conflict');
  const [newDate, setNewDate] = useState('2026-09-15');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [bannerMsg, setBannerMsg] = useState(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentsApi.getPatientAppointments('P-1001')
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => appointmentsApi.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      setCancelModalApt(null);
      setBannerMsg('Appointment cancelled successfully.');
      setTimeout(() => setBannerMsg(null), 4000);
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date, time }) => appointmentsApi.rescheduleAppointment(id, { date, time }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      setRescheduleModalApt(null);
      setBannerMsg('Appointment successfully rescheduled.');
      setTimeout(() => setBannerMsg(null), 4000);
    }
  });

  const upcomingList = appointments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'Rescheduled'
  );
  const pastList = appointments.filter(
    (a) => a.status === 'Completed' || a.status === 'Cancelled'
  );

  const displayedList = activeTab === 'upcoming' ? upcomingList : pastList;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage upcoming consultations, review past visits, or reschedule
          </p>
        </div>

        <Link
          to="/patient/book-appointment"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {bannerMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bannerMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'upcoming'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Upcoming Consultations ({upcomingList.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'past'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Past & Cancelled ({pastList.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : displayedList.length === 0 ? (
        <EmptyState
          icon="calendar"
          title={activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointment history'}
          description={
            activeTab === 'upcoming'
              ? 'You have no scheduled consultations on record. Book one now with our clinical specialists.'
              : 'Historical appointments and completed consultations will appear here.'
          }
          actionText={activeTab === 'upcoming' ? 'Book an Appointment' : null}
          actionLink={activeTab === 'upcoming' ? '/patient/book-appointment' : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedList.map((apt) => {
            const isCancelled = apt.status === 'Cancelled';
            const isCompleted = apt.status === 'Completed';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {apt.id} • {apt.type}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{apt.doctorName}</h3>
                      <p className="text-xs text-hospital-700 font-medium">{apt.departmentName}</p>
                    </div>
                    <Badge
                      variant={
                        isCompleted
                          ? 'success'
                          : isCancelled
                          ? 'danger'
                          : apt.status === 'Rescheduled'
                          ? 'warning'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {apt.status}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 mb-4 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-hospital-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-hospital-600 shrink-0" />
                      <span>{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-hospital-600 shrink-0" />
                      <span>{apt.room || 'Clinical OPD Suite'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 mb-4">
                    <span className="font-semibold text-slate-700">Reason:</span> {apt.reason}
                    {apt.cancelReason && (
                      <p className="text-rose-600 text-[11px] mt-1 italic">
                        Cancelled note: {apt.cancelReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions for Upcoming */}
                {!isCancelled && !isCompleted && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRescheduleModalApt(apt)}
                      className="px-3 py-1.5 text-xs font-semibold text-hospital-700 hover:bg-hospital-50 rounded-lg transition-colors border border-hospital-200"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setCancelModalApt(apt)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalApt && (
        <Modal
          isOpen={!!cancelModalApt}
          onClose={() => setCancelModalApt(null)}
          title="Cancel Appointment"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to cancel your consultation with{' '}
              <strong>{cancelModalApt.doctorName}</strong> on {cancelModalApt.date} at{' '}
              {cancelModalApt.time}?
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cancellation Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option>Schedule conflict</option>
                <option>Symptoms improved</option>
                <option>Transportation issue</option>
                <option>Booking made in error</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Keep Appointment
              </button>
              <button
                disabled={cancelMutation.isPending}
                onClick={() =>
                  cancelMutation.mutate({ id: cancelModalApt.id, reason: cancelReason })
                }
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalApt && (
        <Modal
          isOpen={!!rescheduleModalApt}
          onClose={() => setRescheduleModalApt(null)}
          title="Reschedule Appointment"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Select a new date and time for consultation with{' '}
              <strong>{rescheduleModalApt.doctorName}</strong>:
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">New Date</label>
              <input
                type="date"
                value={newDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">New Time Slot</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option>09:30 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>02:30 PM</option>
                <option>03:45 PM</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={rescheduleMutation.isPending}
                onClick={() =>
                  rescheduleMutation.mutate({
                    id: rescheduleModalApt.id,
                    date: newDate,
                    time: newTime
                  })
                }
                className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50"
              >
                {rescheduleMutation.isPending ? 'Updating...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
