import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import DoctorLogin from './pages/DoctorLogin';
import DoctorOnboarding from './pages/DoctorOnboarding';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientPanel from './pages/PatientPanel';
import EarningsPage from './pages/EarningsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';

// Colors
const COLORS = {
  navy: '#0A1628',
  card: '#0F1E35',
  teal: '#0B8F8F',
  mint: '#0DD6C8',
  text: '#FFFFFF',
  muted: '#7A9EAE',
  red: '#EF4444',
  green: '#22C55E',
  amber: '#F59E0B',
};

// Protected Route
function ProtectedRoute({ children, isAuthenticated, isLoading }) {
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: COLORS.navy,
      }}>
        <div style={{ color: COLORS.mint, fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedDoctorId = localStorage.getItem('doctor_id');
      const token = localStorage.getItem('doctor_token');
      
      if (storedDoctorId && token) {
        setDoctorId(storedDoctorId);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (id, token) => {
    localStorage.setItem('doctor_id', id);
    localStorage.setItem('doctor_token', token);
    setDoctorId(id);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('doctor_token');
    setDoctorId(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<DoctorLogin onLogin={handleLogin} />} />
        <Route path="/register" element={<DoctorOnboarding onRegister={handleLogin} />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
              <DoctorDashboard doctorId={doctorId} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/patients"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
              <PatientPanel doctorId={doctorId} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/earnings"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
              <EarningsPage doctorId={doctorId} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
              <PrescriptionsPage doctorId={doctorId} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}