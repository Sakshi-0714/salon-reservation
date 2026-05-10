import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/ServicesPage';
import AuthPage from './pages/AuthPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MapPage from './pages/MapPage';
import AdminDashboard from './pages/AdminDashboard';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import StaffDetailsPage from './pages/StaffDetailsPage';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard';
import './App.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminAnalyticsDashboard />} />
          <Route path="/admin/staff" element={<StaffDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
