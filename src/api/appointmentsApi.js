import { apiClient, USE_MOCK, simulateDelay } from './client';
import { MOCK_DEPARTMENTS, MOCK_DOCTORS, MOCK_APPOINTMENTS } from './mockData';
import { recordsApi } from './recordsApi';

const APPOINTMENTS_STORAGE_KEY = 'apexcare_appointments';

const loadAppointments = () => {
  try {
    const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read appointments from localStorage:', e);
  }
  const initial = [...MOCK_APPOINTMENTS];
  saveAppointments(initial);
  return initial;
};

const saveAppointments = (apts) => {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(apts));
  } catch (e) {
    console.error('Failed to write appointments to localStorage:', e);
  }
};

// In-memory appointments list initialized from localStorage
let activeAppointments = loadAppointments();

export const appointmentsApi = {
  /**
   * Get all medical departments
   * Spring Boot contract: GET /api/departments
   */
  async getDepartments() {
    if (!USE_MOCK) {
      const res = await apiClient.get('/departments');
      return res.data;
    }
    await simulateDelay(300);
    return MOCK_DEPARTMENTS;
  },

  /**
   * Get doctors filtered by department
   * Spring Boot contract: GET /api/doctors?departmentId={deptId}
   */
  async getDoctors(departmentId = null) {
    if (!USE_MOCK) {
      const res = await apiClient.get('/doctors', { params: { departmentId } });
      return res.data;
    }
    await simulateDelay(350);
    if (!departmentId) return MOCK_DOCTORS;
    return MOCK_DOCTORS.filter(doc => doc.departmentId === departmentId);
  },

  /**
   * Get available time slots for a doctor on a specific date
   * Spring Boot contract: GET /api/doctors/{doctorId}/slots?date={date}
   */
  async getAvailableSlots(doctorId, date) {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/doctors/${doctorId}/slots`, { params: { date } });
      return res.data;
    }
    await simulateDelay(300);
    return [
      { time: '09:00 AM', available: true },
      { time: '09:30 AM', available: false }, // booked
      { time: '10:00 AM', available: true },
      { time: '10:30 AM', available: true },
      { time: '11:15 AM', available: false },
      { time: '11:45 AM', available: true },
      { time: '02:00 PM', available: true },
      { time: '02:30 PM', available: true },
      { time: '03:15 PM', available: true },
      { time: '04:00 PM', available: false }
    ];
  },

  /**
   * Book a new appointment
   * Spring Boot contract: POST /api/appointments
   */
  async bookAppointment(bookingData) {
    if (!USE_MOCK) {
      const res = await apiClient.post('/appointments', bookingData);
      return res.data;
    }
    await simulateDelay(500);
    activeAppointments = loadAppointments();

    const doctor = MOCK_DOCTORS.find(d => d.id === bookingData.doctorId) || MOCK_DOCTORS[0];
    const patientId = bookingData.patientId || 'P-1001';
    const newAppointment = {
      id: `APT-${Math.floor(200 + Math.random() * 800)}`,
      patientId: patientId,
      patientName: bookingData.patientName || 'Ananya Sharma',
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentName: doctor.departmentName,
      date: bookingData.date,
      time: bookingData.time,
      type: bookingData.type || 'In-person Consultation',
      status: 'Scheduled',
      reason: bookingData.reason || 'General Follow-up',
      notes: bookingData.notes || '',
      attachedReports: bookingData.attachedReports || [],
      room: doctor.room
    };

    activeAppointments.unshift(newAppointment);
    saveAppointments(activeAppointments);

    // Auto-upload any attached reports into the patient's medical records
    if (newAppointment.attachedReports && Array.isArray(newAppointment.attachedReports)) {
      for (const rep of newAppointment.attachedReports) {
        try {
          await recordsApi.uploadReport(patientId, {
            ...rep,
            uploadedBy: rep.uploadedBy || `Attached to Appt with Dr. ${doctor.name}`,
            status: 'Attached to Appointment'
          });
        } catch (err) {
          console.warn('Failed to auto-upload attached report into records:', err);
        }
      }
    }

    return newAppointment;
  },

  /**
   * Get all appointments for a patient (Upcoming & Past)
   * Spring Boot contract: GET /api/patients/{patientId}/appointments
   */
  async getPatientAppointments(patientId = 'P-1001') {
    if (!USE_MOCK) {
      const res = await apiClient.get(`/patients/${patientId}/appointments`);
      return res.data;
    }
    await simulateDelay(350);
    activeAppointments = loadAppointments();
    return activeAppointments.filter(apt => apt.patientId === patientId);
  },

  /**
   * Get doctor's scheduled appointments
   * Note: Backend filters by the authenticated doctor's JWT ID
   * Spring Boot contract: GET /api/doctors/me/appointments
   */
  async getDoctorAppointments(doctorId = 'D-201') {
    if (!USE_MOCK) {
      const res = await apiClient.get('/doctors/me/appointments');
      return res.data;
    }
    await simulateDelay(350);
    activeAppointments = loadAppointments();
    return activeAppointments.filter(apt => apt.doctorId === doctorId);
  },

  /**
   * Cancel an appointment
   * Spring Boot contract: PATCH /api/appointments/{id}/cancel
   */
  async cancelAppointment(appointmentId, reason = '') {
    if (!USE_MOCK) {
      const res = await apiClient.patch(`/appointments/${appointmentId}/cancel`, { reason });
      return res.data;
    }
    await simulateDelay(400);
    activeAppointments = loadAppointments().map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'Cancelled', cancelReason: reason } : apt
    );
    saveAppointments(activeAppointments);
    return { success: true, message: 'Appointment cancelled successfully' };
  },

  /**
   * Reschedule an appointment
   * Spring Boot contract: PATCH /api/appointments/{id}/reschedule
   */
  async rescheduleAppointment(appointmentId, { date, time }) {
    if (!USE_MOCK) {
      const res = await apiClient.patch(`/appointments/${appointmentId}/reschedule`, { date, time });
      return res.data;
    }
    await simulateDelay(400);
    activeAppointments = loadAppointments().map(apt =>
      apt.id === appointmentId ? { ...apt, date, time, status: 'Rescheduled' } : apt
    );
    saveAppointments(activeAppointments);
    return { success: true, message: 'Appointment rescheduled successfully' };
  }
};
