import { apiClient, USE_MOCK, simulateDelay } from './client';
import { MOCK_PATIENT_RECORDS } from './mockData';

let activePrescriptions = [...MOCK_PATIENT_RECORDS['P-1001'].prescriptions];

export const prescriptionsApi = {
  /**
   * Get prescriptions for patient
   * Spring Boot contract: GET /api/patients/{patientId}/prescriptions
   */
  async getPatientPrescriptions(patientId = 'P-1001') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/patients/${patientId}/prescriptions`);
      return res.data;
    }
    await simulateDelay(350);
    return activePrescriptions;
  },

  /**
   * Get prescriptions issued by a doctor
   * Spring Boot contract: GET /api/doctors/me/prescriptions
   */
  async getDoctorPrescriptions(doctorId = 'D-201') {
    if (!USE_MOCK) {
      const res = await apiClient.get('/doctors/me/prescriptions');
      return res.data;
    }
    await simulateDelay(350);
    return activePrescriptions.filter(p => p.doctorId === doctorId);
  },

  /**
   * Create a new prescription tied to a patient and appointment
   * Spring Boot contract: POST /api/prescriptions
   */
  async createPrescription(prescriptionData) {
    if (!USE_MOCK) {
      const res = await apiClient.post('/prescriptions', prescriptionData);
      return res.data;
    }
    await simulateDelay(500);

    const newPrescription = {
      id: `RX-${Math.floor(9000 + Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      doctorId: prescriptionData.doctorId || 'D-201',
      doctorName: prescriptionData.doctorName || 'Dr. Rajesh Verma, MD',
      doctorSpecialty: prescriptionData.doctorSpecialty || 'Cardiology',
      appointmentId: prescriptionData.appointmentId || 'APT-101',
      status: 'Active',
      diagnosis: prescriptionData.diagnosis,
      medications: prescriptionData.medications || [],
      specialInstructions: prescriptionData.specialInstructions || '',
      signature: `Digitally signed by ${prescriptionData.doctorName || 'Dr. Rajesh Verma, MD'} (Verified EHR Signature)`
    };

    activePrescriptions.unshift(newPrescription);
    return newPrescription;
  },

  /**
   * Get Medication Administration Records (MAR) (Epic 4)
   * Spring Boot contract: GET /api/patients/{patientId}/mar
   */
  async getMarRecords(patientId = 'P-1001') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/patients/${patientId}/mar`);
      return res.data;
    }
    await simulateDelay(250);
    return [
      { id: 'MAR-6001', prescriptionId: 'RX-8821', medicationName: 'Lisinopril', dosage: '10 mg', route: 'Oral', scheduledTime: '2026-08-20 08:00 AM', administeredTime: '2026-08-20 08:05 AM', administeredBy: 'Staff Nurse Deepa Nair', status: 'Administered', notes: 'Dose taken with water; pre-dose BP 124/82 mmHg.' },
      { id: 'MAR-6002', prescriptionId: 'RX-8821', medicationName: 'Atorvastatin Calcium', dosage: '10 mg', route: 'Oral', scheduledTime: '2026-08-20 09:00 PM', administeredTime: '2026-08-20 09:10 PM', administeredBy: 'Staff Nurse Deepa Nair', status: 'Administered', notes: 'Night dose administered per schedule.' },
      { id: 'MAR-6003', prescriptionId: 'RX-8821', medicationName: 'Metoprolol Tartrate', dosage: '25 mg', route: 'Oral', scheduledTime: '2026-08-20 08:00 AM', administeredTime: '2026-08-20 08:05 AM', administeredBy: 'Staff Nurse Deepa Nair', status: 'Administered', notes: 'Pulse 74 bpm prior to administration. Tolerated well.' }
    ];
  },

  /**
   * Record Medication Administration (Epic 4)
   * Spring Boot contract: POST /api/patients/{patientId}/mar
   */
  async recordMar(patientId = 'P-1001', marData) {
    if (!USE_MOCK) {
      const res = await apiClient.post(`/patients/${patientId}/mar`, marData);
      return res.data;
    }
    await simulateDelay(300);
    return {
      id: `MAR-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      ...marData,
      administeredTime: new Date().toISOString()
    };
  }
};
