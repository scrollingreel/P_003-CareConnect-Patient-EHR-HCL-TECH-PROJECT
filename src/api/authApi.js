import { apiClient, USE_MOCK, simulateDelay, setAuthToken, clearAuthToken } from './client';
import { MOCK_CURRENT_PATIENT, MOCK_DOCTORS } from './mockData';

// Preset mock accounts for demo/testing
export const DEMO_ACCOUNTS = {
  patient: {
    id: 'P-1001',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    role: 'patient',
    bloodGroup: 'A+',
    avatar: MOCK_CURRENT_PATIENT.avatar,
    details: MOCK_CURRENT_PATIENT
  },
  doctor: {
    id: 'D-201',
    name: 'Dr. Rajesh Verma',
    title: 'MD, FACC - Senior Consultant',
    email: 'rajesh.verma@apexcare.org',
    role: 'doctor',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology',
    avatar: MOCK_DOCTORS[0].avatar,
    details: MOCK_DOCTORS[0]
  },
  admin: {
    id: 'ADM-01',
    name: 'Amanda Ross',
    title: 'Clinical Operations Administrator',
    email: 'admin@apexcare.org',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80'
  }
};

export const authApi = {
  /**
   * Log in user with credentials and optional role context
   * Spring Boot contract: POST /api/auth/login -> { token, user: {...} }
   */
  async login({ email, password, role = 'patient' }) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/auth/login', { email, password, role });
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    }

    await simulateDelay(500);

    // Pick demo profile corresponding to selected role
    const matchedUser = DEMO_ACCOUNTS[role] || {
      id: `USR-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    };

    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: matchedUser.id, role: matchedUser.role, exp: Date.now() + 3600000 })
    )}.mockSignatureHash`;

    setAuthToken(mockJwt);

    return {
      token: mockJwt,
      user: matchedUser
    };
  },

  /**
   * Register a new patient
   * Spring Boot contract: POST /api/auth/register -> { token, user: {...} }
   */
  async register(patientData) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/auth/register', patientData);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    }

    await simulateDelay(600);

    const newPatient = {
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${patientData.firstName} ${patientData.lastName}`,
      email: patientData.email,
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      details: {
        ...patientData,
        name: `${patientData.firstName} ${patientData.lastName}`,
        insurance: {
          provider: patientData.insuranceProvider || 'Pending Verification',
          policyNumber: patientData.policyNumber || 'N/A',
          groupNumber: patientData.groupNumber || 'N/A',
          status: 'Active'
        }
      }
    };

    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: newPatient.id, role: 'patient', exp: Date.now() + 3600000 })
    )}.mockSignatureHash`;

    setAuthToken(mockJwt);

    return {
      token: mockJwt,
      user: newPatient
    };
  },

  /**
   * Fetch current authenticated user info
   * Spring Boot contract: GET /api/auth/me
   */
  async getCurrentUser() {
    if (!USE_MOCK) {
      const response = await apiClient.get('/auth/me');
      return response.data;
    }

    await simulateDelay(250);
    return DEMO_ACCOUNTS.patient;
  },

  /**
   * Update patient profile information
   * Spring Boot contract: PUT /api/patients/profile
   */
  async updateProfile(profileData) {
    if (!USE_MOCK) {
      const response = await apiClient.put('/patients/profile', profileData);
      return response.data;
    }

    await simulateDelay(400);
    return {
      success: true,
      profile: {
        ...MOCK_CURRENT_PATIENT,
        ...profileData
      }
    };
  },

  /**
   * Log out and clear in-memory token
   */
  logout() {
    clearAuthToken();
  }
};
