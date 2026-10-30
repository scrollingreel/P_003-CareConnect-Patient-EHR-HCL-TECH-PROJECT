import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { prescriptionsApi } from '../../api';
import {
  Pill,
  Printer,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  Activity,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const PatientPrescriptions = () => {
  const [printModalRx, setPrintModalRx] = useState(null);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: () => prescriptionsApi.getPatientPrescriptions('P-1001')
  });

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Prescription Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active physician prescriptions, refill management, and official Rx printouts
          </p>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton count={2} />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon="fileText"
          title="No active prescriptions"
          description="There are currently no prescriptions recorded for this patient account."
        />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => {
            const isActive = rx.status === 'Active';

            return (
              <div
                key={rx.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Rx Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hospital-100 text-hospital-700 flex items-center justify-center font-bold text-base">
                      Rx
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{rx.id}</span>
                        <Badge variant={isActive ? 'success' : 'default'} size="sm">
                          {rx.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Prescribed by: <strong className="text-slate-800">{rx.doctorName}</strong> ({rx.doctorSpecialty})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Issued: {rx.date}
                    </span>
                    <button
                      onClick={() => setPrintModalRx(rx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-hospital-50 hover:text-hospital-700 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official Rx</span>
                    </button>
                  </div>
                </div>

                {/* Diagnosis note */}
                <div className="my-3 text-xs">
                  <span className="font-semibold text-slate-700">Indication / Diagnosis:</span>{' '}
                  <span className="text-slate-600">{rx.diagnosis}</span>
                </div>

                {/* Medications Table */}
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Medication</th>
                        <th className="p-3">Dosage & Form</th>
                        <th className="p-3">Frequency</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Refills</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {rx.medications.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-900">
                            {med.name}
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5">{med.instructions}</p>
                          </td>
                          <td className="p-3">{med.dosage} ({med.form})</td>
                          <td className="p-3">{med.frequency}</td>
                          <td className="p-3">{med.duration}</td>
                          <td className="p-3 font-mono font-semibold">{med.refills} Remaining</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Special Instructions & Signature */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-700">Instructions:</span> {rx.specialInstructions || 'None'}
                  </div>
                  <div className="text-[11px] text-hospital-800 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{rx.signature}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Printable Rx Modal */}
      {printModalRx && (
        <Modal
          isOpen={!!printModalRx}
          onClose={() => setPrintModalRx(null)}
          title="Official Hospital Prescription"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Printable Area */}
            <div className="p-6 bg-white border border-slate-300 rounded-xl space-y-6 text-slate-800 text-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-hospital-700 text-white flex items-center justify-center font-bold">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                      ApexCare Hospital & Research Institute
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      742 Healthcare Boulevard, Medical District • Tel: +1 (555) 883-0000
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <p className="font-bold text-slate-900">Rx ID: {printModalRx.id}</p>
                  <p className="text-slate-500">Date: {printModalRx.date}</p>
                </div>
              </div>

              {/* Patient & Doctor Snapshot */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Patient Information</p>
                  <p className="font-bold text-slate-900">Ananya Sharma (P-1001)</p>
                  <p className="text-slate-600">Age: 38 • Gender: Female • Blood: A+</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Prescribing Physician</p>
                  <p className="font-bold text-slate-900">{printModalRx.doctorName}</p>
                  <p className="text-slate-600">{printModalRx.doctorSpecialty} (Room 304)</p>
                </div>
              </div>

              {/* Rx Medications */}
              <div>
                <div className="text-lg font-serif font-black text-hospital-800 mb-2">Rx</div>
                <div className="space-y-3">
                  {printModalRx.medications.map((med, idx) => (
                    <div key={idx} className="p-3 border-l-4 border-hospital-600 bg-slate-50/70 rounded-r-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 text-sm">{med.name} {med.dosage}</span>
                        <span className="text-[11px] font-semibold text-slate-600">Qty: {med.quantity}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium">
                        Sig: {med.frequency} for {med.duration}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{med.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="p-3 bg-slate-50 rounded-lg text-xs">
                <span className="font-bold text-slate-700">Clinical Advice:</span>{' '}
                {printModalRx.specialInstructions}
              </div>

              {/* Digital Signature */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                <div className="text-[10px] text-slate-400">
                  <p>Electronically generated via ApexCare EHR.</p>
                  <p>Verification Code: <span className="font-mono font-bold">EHR-SEC-9981-RX</span></p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-b border-slate-400 pb-1 mb-1 font-serif italic text-hospital-900 font-bold text-sm">
                    {printModalRx.doctorName}
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">Attending Physician Digital Signature</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 no-print">
              <button
                onClick={() => setPrintModalRx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleTriggerPrint}
                className="flex items-center gap-2 px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
