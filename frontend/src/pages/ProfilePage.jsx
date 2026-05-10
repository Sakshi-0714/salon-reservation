import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Navbar from '../components/Navbar';
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!user) {
    setTimeout(() => navigate('/auth'), 0);
    return null;
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setFormData({ name: user.name || '', phone: user.phone || '' });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSave = async () => {
    const mobile = String(formData.phone || '').replace(/\D/g, '');
    if (!/^\d{10}$/.test(mobile)) {
      setErrorMsg('Mobile number must be exactly 10 digits');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, { ...formData, phone: mobile }, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
        <h1 className="heading-primary" style={{ textAlign: 'center', margin: '2rem 0' }}>User Profile</h1>
        
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'var(--background)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginRight: '1rem' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : <User size={30} />}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>{user.name || 'User'}</h2>
            </div>
          </div>
          
          {errorMsg && <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: '#ffcccc', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '1rem' }}>{errorMsg}</div>}
          {successMsg && <div style={{ backgroundColor: 'rgba(46,204,113,0.1)', color: '#2ecc71', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '1rem' }}>{successMsg}</div>}

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Full Name</p>
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', border: isEditing ? '1px solid var(--primary)' : 'none' }}>
              <User size={18} style={{ marginRight: '10px', color: 'var(--primary)' }} />
              {isEditing ? (
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', width: '100%', outline: 'none' }} />
              ) : (
                <span>{user.name}</span>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Email Address <span style={{fontSize: '0.75rem', opacity: 0.7}}>(Locked)</span></p>
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', opacity: isEditing ? 0.6 : 1 }}>
              <Mail size={18} style={{ marginRight: '10px', color: 'var(--primary)' }} />
              <span>{user.email}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Phone Number</p>
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', border: isEditing ? '1px solid var(--primary)' : 'none' }}>
              <Phone size={18} style={{ marginRight: '10px', color: 'var(--primary)' }} />
              {isEditing ? (
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} style={{ background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', width: '100%', outline: 'none' }} placeholder="e.g. 8456379156" />
              ) : (
                <span>{user.phone || 'Not provided'}</span>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleSave} disabled={loading}>
                <Save size={18} /> {loading ? 'Saving...' : 'Save Profile'}
              </button>
              <button className="btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleEditToggle} disabled={loading}>
                <X size={18} /> Cancel
              </button>
            </div>
          ) : (
            <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }} onClick={handleEditToggle}>
              <Edit2 size={18} /> Edit Profile
            </button>
          )}

          <button className="btn-outline" style={{ width: '100%' }} onClick={() => navigate('/appointments')}>
            View My Appointments
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
