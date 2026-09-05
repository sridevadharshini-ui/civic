import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { InspectorDashboard } from './pages/InspectorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ConsumerDashboard } from './pages/ConsumerDashboard';
import { ScannerPage } from './pages/ScannerPage';
import { InspectionDetailPage } from './pages/InspectionDetailPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RulesAdminPage } from './pages/RulesAdminPage';
import { UsersAdminPage } from './pages/UsersAdminPage';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Authenticating CivicFlow session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* App Portal Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/inspections" element={<InspectorDashboard />} />
            <Route path="/inspections/:id" element={<InspectionDetailPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Role Dashboards */}
            <Route path="/inspector/dashboard" element={<InspectorDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />

            {/* Admin Management Routes */}
            <Route path="/admin/rules" element={<RulesAdminPage />} />
            <Route path="/admin/users" element={<UsersAdminPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
