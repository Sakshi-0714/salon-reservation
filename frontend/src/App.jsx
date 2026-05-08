import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import MapPage from './pages/MapPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import StaffDetailsPage from './pages/StaffDetailsPage.jsx';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard.jsx';
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