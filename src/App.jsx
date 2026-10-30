import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Unauthorized } from './pages/auth/Unauthorized';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfile } from './pages/patient/PatientProfile';
import { BookAppointment } from './pages/patient/BookAppointment';
import { MyAppointments } from './pages/patient/MyAppointments';
import { PatientPrescriptions } from './pages/patient/PatientPrescriptions';
import { PatientRecords } from './pages/patient/PatientRecords';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { PatientDetailChart } from './pages/doctor/PatientDetailChart';
import { DoctorSchedule } from './pages/doctor/DoctorSchedule';

// Admin Pages
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

const RoleBasedHomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/analytics" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Root redirect */}
      <Route path="/" element={<RoleBasedHomeRedirect />} />

      {/* Authenticated Workspace with Layout */}
      <Route element={<AppLayout />}>
        {/* Patient Scope */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <PatientPrescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/records"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientRecords />
            </ProtectedRoute>
          }
        />

        {/* Doctor Scope */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <DoctorPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:patientId"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <PatientDetailChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <DoctorSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <PatientPrescriptions />
            </ProtectedRoute>
          }
        />

        {/* Admin Scope */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
