import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import GreenhousesPage from './pages/GreenhousesPage';
import GreenhouseDetailPage from './pages/GreenhouseDetailPage';
import PlantsPage from './pages/PlantsPage';
import PlantDetailPage from './pages/PlantDetailPage';
import InspectionsPage from './pages/InspectionsPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import NpkAnalyticsPage from './pages/NpkAnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import RobotMonitoringPage from './pages/RobotMonitoringPage';
import CameraPreviewPage from './pages/CameraPreviewPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--emerald-400)', fontFamily: 'var(--font-heading)' }}>
          Initializing FloraBot IoT Station...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, backgroundColor: 'var(--bg-main)', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/greenhouses" element={<GreenhousesPage />} />
            <Route path="/greenhouses/:id" element={<GreenhouseDetailPage />} />
            <Route path="/plants" element={<PlantsPage />} />
            <Route path="/plants/:plantId" element={<PlantDetailPage />} />
            <Route path="/inspections" element={<InspectionsPage />} />
            <Route path="/diseases" element={<DiseaseDetectionPage />} />
            <Route path="/npk-analytics" element={<NpkAnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/robots" element={<RobotMonitoringPage />} />
            <Route path="/camera" element={<CameraPreviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
