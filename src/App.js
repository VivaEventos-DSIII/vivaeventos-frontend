import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/client/CatalogPage';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEventPage from './pages/organizer/CreateEventPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',marginTop:'2rem'}}>Cargando...</div>;
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',marginTop:'2rem'}}>Cargando...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return isAdmin() ? children : <Navigate to="/catalog" />;
};

const HomeRedirect = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated()) return isAdmin() ? <Navigate to="/organizer" /> : <Navigate to="/catalog" />;
  return <Navigate to="/login" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/catalog" element={<PrivateRoute><CatalogPage /></PrivateRoute>} />
    <Route path="/organizer" element={<AdminRoute><OrganizerDashboard /></AdminRoute>} />
    <Route path="/organizer/create" element={<AdminRoute><CreateEventPage /></AdminRoute>} />
    <Route path="/" element={<HomeRedirect />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
