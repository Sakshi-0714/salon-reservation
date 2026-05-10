import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BillModal from '../components/BillModal';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [paymentMethods, setPaymentMethods] = useState({}); // To track "In Person" choices locally
  
  // Review Modal Statean
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewService, setReviewService] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  // Bill Modal State
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_BASE_URL}/api/appointments/myappointments`, config);
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments', error);
      }
    };
    fetchAppointments();
  }, [navigate, user]);

  const appointmentGroups = appointments.map(appt => {
    let parsedServices = appt.services;
    if (typeof parsedServices === 'string') {
      try { parsedServices = JSON.parse(parsedServices); } catch(e) { parsedServices = []; }
    }
    
    const formattedServicesList = (parsedServices || []).map(service => {
      let display = service.name;
      if (service.status && service.status.toLowerCase() === 'not available') {
        display += ' – Not available at the moment';
      } else if (service.status && service.status.toLowerCase() === 'rejected') {
         display += ' – Rejected';
      } else if (service.status && service.status.toLowerCase() === 'cancelled') {
         display += ' – Cancelled';
      } else {
        display += ` – ₹${(Number(service.price) || 0).toFixed(2)}`;
      }
      return { ...service, display };
    });

    const totalPrice = (parsedServices || [])
      .filter(s => {
        const stat = s.status ? s.status.toLowerCase() : '';
        return stat !== 'not available' && stat !== 'rejected' && stat !== 'cancelled';
      })
      .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      
    // Global appointment fallback status based on its constituents
    let globalStatus = 'Pending';
    const statuses = (parsedServices || []).map(s => s.status ? s.status.toLowerCase() : 'pending');
    if (statuses.includes('approved')) globalStatus = 'Approved';
    if (statuses.includes('completed')) globalStatus = 'Completed';
    if (statuses.every(s => s === 'not available' || s === 'rejected')) globalStatus = 'Rejected/Not Available';
    if (statuses.every(s => s === 'cancelled')) globalStatus = 'Cancelled';

    return {
      key: `appt_${appt.id}`,
      appointmentIds: [appt.id],
      date: appt.appointment_date,
      time: appt.appointment_time,
      status: globalStatus,
      paid_advance: appt.paid_advance ? 1 : 0,
      pay_in_person: appt.pay_in_person ? 1 : 0,
      services: formattedServicesList,
      totalPrice
    };
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOpenPayment = async (groupIds, groupKey, totalAmount) => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Fetch Razorpay Key
      const { data: keyData } = await axios.get(`${API_BASE_URL}/api/appointments/razorpay-key`, config);
      
      // Create Order
      const { data: order } = await axios.post(`${API_BASE_URL}/api/appointments/razorpay-order`, {
        amount: totalAmount * 100 // convert to paise
      }, config);

      const options = {
        key: keyData.key,
        amount: order.amount,
        currency: order.currency,
        name: "StaySync Salon",
        description: "Payment for your appointment",
        order_id: order.id,
        handler: async function (response) {
          try {
            await axios.post(`${API_BASE_URL}/api/appointments/verify-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              appointment_ids: groupIds
            }, config);

            setMessage(`Online payment successful via Razorpay for your appointment session!`);
            
            setAppointments(appointments.map(a => 
              groupIds.includes(a.id) ? { ...a, paid_advance: 1, payment_status: 'Paid' } : a
            ));
            
            const newMethods = {...paymentMethods};
            delete newMethods[groupKey];
            setPaymentMethods(newMethods);
          } catch (err) {
            console.error('Payment verification failed', err);
            const messageText = err.response?.data?.message || err.message || 'Payment verification failed. Please try again.';
            setMessage(`Payment verification failed: ${messageText}`);
            alert(`Payment verification failed: ${messageText}`);
          }
        },
        modal: {
          ondismiss: function () {
            setMessage('Payment popup was closed before completion. No charge was made.');
          }
        },
        prefill: {
          name: user.name || 'Customer',
          email: user.email || '',
          contact: user.phone || '9999999999',
          vpa: 'success@razorpay'
        },
        theme: {
          color: "#d4af37"
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              }
            },
            sequence: ["block.upi", "block.card", "block.netbanking", "block.wallet", "block.paylater"],
            preferences: {
              show_default_blocks: true
            }
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        console.error('Razorpay payment failed event:', response);
        const errorMessage = response.error?.description || response.error?.reason || 'Payment failed. Please try again or select another payment method.';
        setMessage(`Payment failed: ${errorMessage}`);
        alert(`Payment failed: ${errorMessage}`);
      });
      paymentObject.open();
    } catch (err) {
      console.error('Failed to create order', err);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handlePayInPerson = async (groupIds, groupKey) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const payPromises = groupIds.map(id => 
        axios.patch(`${API_BASE_URL}/api/appointments/${id}/pay-in-person`, {}, config)
      );
      
      await Promise.all(payPromises);

      setMessage('Noted! You will pay at the salon counter.');
      
      setAppointments(appointments.map(a => 
        groupIds.includes(a.id) ? { ...a, pay_in_person: 1 } : a
      ));
      
      setPaymentMethods({ ...paymentMethods, [groupKey]: 'In Person' });
    } catch (error) {
      console.error('Error recording in-person payment preference', error);
      alert('Failed to set payment preference. Please try again.');
    }
  };

  const handleCancelSession = async (groupIds) => {
    if (!window.confirm('Are you sure you want to cancel this entire appointment session?')) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const cancelPromises = groupIds.map(id => 
        axios.patch(`${API_BASE_URL}/api/appointments/${id}/user-cancel`, {}, config)
      );
      
      await Promise.all(cancelPromises);

      setMessage('Appointment successfully cancelled.');
      
      // Instead of filtering out, we refetch to get updated status
      const { data } = await axios.get(`${API_BASE_URL}/api/appointments/myappointments`, config);
      setAppointments(data);
    } catch (error) {
      console.error('Error cancelling appointment session', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_BASE_URL}/api/reviews`, {
        service_name: reviewService,
        rating: reviewRating,
        comment: reviewComment
      }, config);
      
      setMessage('Review submitted successfully!');
      setReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review', error);
      alert('Failed to submit review.');
    }
  };

  const viewBill = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/appointments/${id}/bill`, config);
      setSelectedBill(data);
      setIsBillModalOpen(true);
    } catch (error) {
      console.error('Error fetching bill', error);
      alert('Bill not found or not generated yet.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#f39c12';
      case 'Approved': return '#3498db';
      case 'Completed': return '#2ecc71';
      case 'Rejected': 
      case 'Cancelled': return '#e74c3c';
      case 'Not Available': return '#95a5a6';
      case 'Rejected/Not Available': return '#e74c3c';
      default: return 'var(--text-light)';
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <h1 className="heading-primary" style={{ textAlign: 'center', margin: '2rem 0' }}>Your Appointments</h1>
        
        {message && <div className="alert-message">{message}</div>}

        <div className="appointments-grid">
          {appointmentGroups.length === 0 ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <p>You have no appointments yet.</p>
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/services')}>
                Explore Services
              </button>
            </div>
          ) : (
            appointmentGroups.map(group => (
              <div className="card appointment-card" key={group.key}>
                <div className="appointment-info">
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '1.4rem' }}>
                    Session: {new Date(group.date).toLocaleDateString()} at {group.time}
                  </h3>
                  
                  <div className="appointment-details">
                    <p style={{ margin: '10px 0', color: 'var(--text-light)' }}><strong>Services Booked:</strong></p>
                    <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginBottom: '10px' }}>
                      {group.services.map((srv, i) => (
                        <li key={i} style={{ marginBottom: '5px' }}>
                            {srv.display}
                        </li>
                      ))}
                    </ul>
                    <p style={{ marginBottom: '1rem' }}><strong>Total Price:</strong> ₹{group.totalPrice.toFixed(2)}</p>

                    {group.status !== 'Rejected/Not Available' && group.status !== 'Cancelled' && (
                      <div style={{ marginTop: '1rem' }}>
                        {!group.paid_advance && !group.pay_in_person && !paymentMethods[group.key] && (
                          <div className="payment-actions">
                            <button className="btn-primary" style={{ padding: '8px 16px', flex: 1 }} onClick={() => handleOpenPayment(group.appointmentIds, group.key, group.totalPrice)}>
                              Pay Online Now
                            </button>
                            <button className="btn-outline" style={{ padding: '8px 16px', flex: 1 }} onClick={() => handlePayInPerson(group.appointmentIds, group.key)}>
                              Pay In Person
                            </button>
                          </div>
                        )}
                        
                        <div style={{ marginTop: '0.5rem' }}>
                           <button 
                             style={{ padding: '4px 10px', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', cursor: 'pointer', borderRadius: '4px' }}
                             onClick={() => handleCancelSession(group.appointmentIds)}
                           >
                              Cancel Booking
                           </button>
                        </div>
                      </div>
                    )}

                    {group.paid_advance === 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <p style={{ color: '#2ecc71', fontSize: '0.9rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                          <span style={{ fontSize: '1.2rem' }}>✓</span> Payment Completed
                        </p>
                        <button 
                          className="btn-gold" 
                          style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'black' }}
                          onClick={() => viewBill(group.appointmentIds[0])}
                        >
                          View Bill
                        </button>
                      </div>
                    )}

                    {(paymentMethods[group.key] === 'In Person' || group.pay_in_person === 1) && !group.paid_advance && (
                      <p style={{ color: '#f39c12', fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        Payment Option: In Person 
                        <span 
                          style={{ marginLeft: '10px', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary)' }}
                          onClick={() => handleOpenPayment(group.appointmentIds, group.key, group.totalPrice)}
                        >
                          (Switch to Pay Online)
                        </span>
                      </p>
                    )}

                    {group.services.some(s => s.status === 'Completed') && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button 
                          className="btn-outline"
                          onClick={() => { 
                            const serviceNames = group.services.filter(s => s.status === 'Completed').map(s => s.name.split(' - ')[0]).join(' & ');
                            setReviewService(serviceNames); 
                            setReviewModalOpen(true); 
                          }}
                          style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <span style={{ fontSize: '1.2rem', color: '#f39c12' }}>★</span> Give Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="appointment-status">
                  <p>Status: <span style={{ color: getStatusColor(group.status), fontWeight: 'bold' }}>{group.status}</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="heading-secondary" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Review {reviewService}</h2>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-light)' }}>Rating (1-5 Stars)</label>
                <div style={{ display: 'flex', gap: '5px', fontSize: '1.5rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      onClick={() => setReviewRating(star)}
                      style={{ color: star <= reviewRating ? '#f39c12' : '#555' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-light)' }}>Comment</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  value={reviewComment} 
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience (Optional)"
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setReviewModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}


      <BillModal 
        isOpen={isBillModalOpen} 
        onClose={() => setIsBillModalOpen(false)} 
        bill={selectedBill} 
      />

      <style>{`
        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
          padding-bottom: 50px;
        }

        .appointment-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          transition: transform 0.2s ease;
        }

        .appointment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .appointment-details {
          margin-top: 1rem;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .appointment-status {
          text-align: right;
          min-width: 180px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .payment-actions {
          display: flex;
          flex-direction: row;
          gap: 1rem;
          margin-top: 0.5rem;
          max-width: 350px;
        }

        .alert-message {
          max-width: 800px;
          margin: 0 auto 2rem;
          padding: 1rem;
          background-color: rgba(46, 204, 113, 0.1);
          border: 1px solid #2ecc71;
          color: #2ecc71;
          text-align: center;
          border-radius: 4px;
        }

        @media (max-width: 600px) {
          .appointment-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .appointment-status {
            text-align: left;
            align-items: flex-start;
            width: 100%;
          }
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modal-content {
          width: 100%;
          max-width: 450px;
          margin: 1rem;
          padding: 2rem;
          animation: slideUp 0.3s ease;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default AppointmentsPage;
