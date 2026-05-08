import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BillModal from '../components/BillModal';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedBillAppt, setSelectedBillAppt] = useState(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchAllAppointments = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_BASE_URL}/api/appointments`, config);
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching ALL appointments', error);
      }
    };

    fetchAllAppointments();
  }, [navigate, user?.token]);

  const handleSearch = async (e, termOverride) => {
    if (e) e.preventDefault();
    const term = termOverride !== undefined ? termOverride : searchTerm;
    
    if (!term) {
      // Re-fetch all
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/appointments`, config);
      setAppointments(data);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/appointments/search/${encodeURIComponent(term)}`, config);
      setAppointments(data);
      if (data.length === 0) {
        setMessage('No matching appointments found.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error searching appointments', error);
      alert('Failed to search appointments.');
    }
  };

  const generateBill = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_BASE_URL}/api/appointments/${id}/bill`, {}, config);
      setSelectedBillAppt(data.bill);
      setIsBillModalOpen(true);
      setMessage('Bill generated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error generating bill', error);
      alert('Failed to generate bill.');
    }
  };

  const viewBill = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/appointments/${id}/bill`, config);
      setSelectedBillAppt(data);
      setIsBillModalOpen(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If not found, try generating it
        generateBill(id);
      } else {
        console.error('Error fetching bill', error);
        alert('Failed to fetch bill.');
      }
    }
  };

  const updateStatus = async (id, serviceIndex, currentStatus, newStatus) => {
    if (currentStatus === newStatus && newStatus === 'Approved') {
      alert('Already approved!');
      return;
    }
    
    if (currentStatus === newStatus && newStatus === 'Rejected') {
      alert('Already rejected!');
      return;
    }
    
    if (currentStatus === newStatus && newStatus === 'Not Available') {
      alert('Already marked as not available!');
      return;
    }

    if (currentStatus === newStatus && newStatus === 'Completed') {
      alert('Already marked as completed!');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(`${API_BASE_URL}/api/appointments/${id}/status`, { status: newStatus, serviceIndex }, config);
      
      setAppointments(appointments.map(appt => {
        if (appt.id === id) {
          let updatedServices = appt.services;
          if (typeof updatedServices === 'string') {
             try { updatedServices = JSON.parse(updatedServices); } catch(e) { updatedServices = []; }
          }
          if (updatedServices[serviceIndex]) {
             updatedServices[serviceIndex].status = newStatus;
          }
          return { ...appt, services: updatedServices };
        }
        return appt;
      }));
      
      setMessage(`Service ${newStatus.toLowerCase()} successfully.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(`Error updating status`, error);
      alert('Failed to update status. Please try again.');
    }
  };

  const cancelSession = async (id) => {
    if (!window.confirm("Are you sure you want to cancel the entire appointment session?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(`${API_BASE_URL}/api/appointments/${id}/cancel`, {}, config);
      
      setAppointments(appointments.filter(appt => appt.id !== id));
      
      setMessage(`Entire session cancelled and removed from database.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(`Error cancelling session`, error);
      alert('Failed to cancel session.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#f39c12';
      case 'Approved': return '#3498db'; // Changed Approved to blue to make Completed distinct
      case 'Completed': return '#2ecc71'; // Green for Completed
      case 'Rejected': 
      case 'Cancelled': return '#e74c3c';
      case 'Not Available': return '#95a5a6';
      default: return 'var(--text-light)';
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
        <h1 className="heading-primary" style={{ textAlign: 'center', margin: '2rem 0' }}>Admin Dashboard</h1>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button className="btn-gold" style={{ minWidth: '220px', color: 'black', fontWeight: 'bold' }} onClick={() => navigate('/')}>
             Go Back to Dashboard
          </button>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '600px' }}>
            <input 
              type="text" 
              placeholder="Search by phone number or customer name..." 
              className="form-control" 
              style={{ flex: 1, margin: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ minWidth: '100px' }}>Search</button>
            {searchTerm && (
              <button 
                type="button" 
                className="btn-outline" 
                style={{ minWidth: '80px', borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
                onClick={() => { setSearchTerm(''); handleSearch(null, ''); }}
              >
                Clear
              </button>
            )}
          </form>
        </div>
        {searchTerm && appointments.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>
            Showing results for "{searchTerm}"
          </div>
        )}
        {message && <div className="alert-message">{message}</div>}

        <div className="admin-list" style={{ margin: '0 auto', width: '100%' }}>
          {appointments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <p>No appointments found on the system.</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.filter(appt => {
                let parsed = appt.services;
                if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch(e) { parsed = []; } }
                return !parsed.every(s => s.status === 'Cancelled');
              }).map(appt => {
                const d = new Date(appt.appointment_date);
                const formattedDate = !isNaN(d.getTime()) ? d.toLocaleDateString() : appt.appointment_date;
                
                let parsedServices = appt.services;
                if (typeof parsedServices === 'string') {
                  try { parsedServices = JSON.parse(parsedServices); } catch(e) { parsedServices = []; }
                }

                return (
                  <div className="card appointment-card" key={appt.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '5px' }}>
                        Session: {formattedDate} at {appt.appointment_time}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                        <strong>User:</strong> {appt.user_name}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {appt.email} <br/> 📞 {appt.phone || 'N/A'}
                      </p>
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 10px 0', color: 'var(--text-light)', fontWeight: 'bold' }}>Services Booked:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {(parsedServices || []).map((service, idx) => (
                          <div key={`${appt.id}-${idx}`} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                              <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{service.name}</div>
                              <span style={{ 
                                color: getStatusColor(service.status || 'Pending'), 
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                marginLeft: '10px'
                              }}>
                                {service.status || 'Pending'}
                              </span>
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                              ₹{(Number(service.price) || 0).toFixed(2)}
                            </div>
                            
                            {service.assigned_staff && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontStyle: 'italic', marginBottom: '8px' }}>
                                Staff: {service.assigned_staff}
                              </div>
                            )}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                              <button 
                                className={`btn-primary ${service.status === 'Approved' ? 'btn-disabled' : ''}`}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', flex: 1, minWidth: '60px' }} 
                                onClick={() => updateStatus(appt.id, idx, service.status, 'Approved')}
                                disabled={service.status === 'Cancelled' || service.status === 'Completed'}
                              >
                                Approve
                              </button>
                              <button 
                                className={`btn-primary ${service.status === 'Completed' ? 'btn-disabled' : ''}`}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#2ecc71', borderColor: '#2ecc71', flex: 1, minWidth: '60px' }} 
                                onClick={() => updateStatus(appt.id, idx, service.status, 'Completed')}
                                disabled={service.status === 'Cancelled'}
                              >
                                Complete
                              </button>
                              <button 
                                className={`btn-outline ${service.status === 'Not Available' ? 'btn-disabled' : ''}`}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#95a5a6', color: '#95a5a6', flex: 1, minWidth: '60px' }} 
                                onClick={() => updateStatus(appt.id, idx, service.status, 'Not Available')}
                                disabled={service.status === 'Cancelled' || service.status === 'Completed'}
                              >
                                N/A
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                         <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Payment: <strong>{appt.payment_status}</strong></span>
                         {(appt.payment_status === 'Paid' || appt.payment_status === 'In Person' || appt.paid_advance) && (
                            <button 
                                className="btn-gold" 
                                style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'black' }}
                                onClick={() => viewBill(appt.id)}
                            >
                                View Bill
                            </button>
                          )}
                      </div>
                      
                      <button 
                         className="btn-outline" 
                         style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderColor: '#e74c3c', color: '#e74c3c' }}
                         onClick={() => cancelSession(appt.id)}
                      >
                         Cancel Entire Session
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BillModal 
        isOpen={isBillModalOpen} 
        onClose={() => setIsBillModalOpen(false)} 
        bill={selectedBillAppt} 
      />

      <style>{`
        
        .btn-disabled {
          opacity: 0.6;
        }

        .alert-message {
          max-width: 1000px;
          margin: 0 auto 2rem;
          padding: 1rem;
          background-color: rgba(46, 204, 113, 0.1);
          border: 1px solid #2ecc71;
          color: #2ecc71;
          text-align: center;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;
