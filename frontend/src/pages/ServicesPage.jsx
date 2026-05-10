import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Navbar from '../components/Navbar';

const ServiceCard = ({ service, selectedServices, setSelectedServices, user, expandedId, setExpandedId, isInactive }) => {
  const [checkedOptions, setCheckedOptions] = useState([]);
  const [justAdded, setJustAdded] = useState(false);

  // Parse options by commas
  const options = React.useMemo(() => {
    if (!service.description) return [];
    return service.description.split(',').map(opt => opt.trim()).filter(Boolean);
  }, [service.description]);

  // Accordion: this card is expanded only if parent says so
  const expanded = expandedId === service.id;

  const handleToggleExpand = () => {
    setExpandedId(expanded ? null : service.id);
  };

  const handleOptionToggle = (opt, e) => {
    e.stopPropagation();
    if (checkedOptions.includes(opt)) {
      setCheckedOptions(checkedOptions.filter(o => o !== opt));
    } else {
      setCheckedOptions([...checkedOptions, opt]);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (options.length > 1 && checkedOptions.length === 0) {
      alert("Please select at least one option.");
      return;
    }
    const uniqueId = service.id + '-' + Date.now();
    const finalOptions = options.length === 1 ? options : checkedOptions;
    setSelectedServices([...selectedServices, { ...service, uniqueCartId: uniqueId, selectedOptions: finalOptions }]);
    setCheckedOptions([]);
    setExpandedId(null);
    
    // Provide visual feedback
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const isSingleOption = options.length <= 1;

  return (
    <div 
      className={`svc-card ${expanded && !isSingleOption ? 'svc-card--expanded' : ''}`} 
      onClick={!isSingleOption ? handleToggleExpand : null} 
      style={{ cursor: isSingleOption ? 'default' : 'pointer' }}
    >
      <h3 className="svc-card__title">{service.name}</h3>
      
      {isSingleOption && (
        <p className="svc-card__price">₹{service.price}</p>
      )}
      
      {isSingleOption ? (
        <>
          {service.description && <p className="svc-card__desc">{service.description}</p>}
          {user ? (
            <button 
              className={`btn-primary svc-card__btn ${isInactive ? 'svc-card__btn--disabled' : ''}`} 
              onClick={isInactive ? null : handleAdd} 
              disabled={isInactive}
              style={{ backgroundColor: justAdded ? '#28a745' : (isInactive ? '#555' : '') }}
            >
              {isInactive ? 'Unavailable' : (justAdded ? 'Added! ✓' : 'Add')}
            </button>
          ) : (
            <div className="svc-card__login-msg">Please login to book</div>
          )}
        </>
      ) : (
        <p className="svc-card__toggle">{expanded ? 'Hide Options ▲' : 'View Options ▼'}</p>
      )}
      
      {(!isSingleOption && expanded) && (
        <div className="svc-card__options" onClick={e => e.stopPropagation()}>
          <p className="svc-card__options-label">Select options:</p>
          {options.map((opt, idx) => (
            <label key={idx} className="svc-card__option" style={{ cursor: user ? 'pointer' : 'default', opacity: user ? 1 : 0.7 }}>
              {user && (
                <input 
                  type="checkbox"
                  className="custom-checkbox"
                  checked={checkedOptions.includes(opt)}
                  onChange={(e) => handleOptionToggle(opt, e)}
                />
              )}
              <span style={{ display: 'list-item', listStyleType: user ? 'none' : 'disc', marginLeft: user ? '0' : '10px' }}>{opt}</span>
            </label>
          ))}
          
          {user && (
            <button 
              className={`btn-primary svc-card__btn ${isInactive ? 'svc-card__btn--disabled' : ''}`} 
              onClick={isInactive ? null : handleAdd} 
              disabled={isInactive}
              style={{ marginTop: '0.75rem', backgroundColor: justAdded ? '#28a745' : (isInactive ? '#555' : '') }}
            >
              {isInactive ? 'Unavailable' : (justAdded ? 'Added! ✓' : 'Add')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '' });
  const [staffStatusMap, setStaffStatusMap] = useState({});
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/services`);
        setServices(data);
      } catch (error) {
        console.error('Error fetching services', error);
      }
    };

    const fetchStaff = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/staff/status`);
        const map = {};
        data.forEach(s => {
          if (s.assigned_service) {
            map[s.assigned_service.trim()] = s.status;
          }
        });
        setStaffStatusMap(map);
      } catch (error) {
        console.error('Error fetching staff', error);
      }
    };
    fetchServices();
    fetchStaff();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage('Please login first to book an appointment.');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const formattedServices = selectedServices.reduce((acc, service) => {
        if (!service.selectedOptions || service.selectedOptions.length === 0) {
          acc.push({
            name: service.name,
            price: Number(service.price) || 0,
            status: 'Pending'
          });
        } else {
          service.selectedOptions.forEach(opt => {
            let itemPrice = Number(service.price) || 0;
            const match = opt.match(/₹([\d,]+)/);
            if (match) {
              itemPrice = parseInt(match[1].replace(/,/g, ''), 10);
            }
            const serviceName = `${service.name} - ${opt.split(':')[0]}`;
            acc.push({
              name: serviceName,
              price: itemPrice,
              status: 'Pending'
            });
          });
        }
        return acc;
      }, []);

      await axios.post(`${API_BASE_URL}/api/appointments`, {
        appointment_date: bookingDetails.date,
        appointment_time: bookingDetails.time,
        paid_advance: false,
        services: formattedServices
      }, config);

      setMessage('All appointments booked successfully! Go to My Appointments to pay in advance.');
      setBookingDetails({ date: '', time: '' });
      setSelectedServices([]);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error booking one or more appointments.');
      }
    }
  };

  // Group services by category
  const categorizedServices = services.reduce((acc, curr) => {
    const category = curr.category || 'Other Services';
    if (!acc[category]) acc[category] = [];
    acc[category].push(curr);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <div className="services-container">
        <h1 className="heading-primary" style={{ textAlign: 'center', margin: '2rem 0' }}>Our Services</h1>
        
        {message && <div className="alert-message">{message}</div>}

        <div className="services-content container">
          <div className="services-list">
            {Object.keys(categorizedServices).map((category) => (
              <div key={category} className="category-section">
                <h2 className="category-header">{category}</h2>
                <div className="category-items">
                    {categorizedServices[category].map(service => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        selectedServices={selectedServices} 
                        setSelectedServices={setSelectedServices}
                        user={user}
                        expandedId={expandedId}
                        setExpandedId={setExpandedId}
                        isInactive={staffStatusMap[service.name.trim()] === 'Inactive'}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="services-sidebar">
            {selectedServices.length > 0 && (
              <div className="card booking-form">
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '1rem' }}>Book Selected ({selectedServices.length})</h3>
                
                <div style={{ marginBottom: '1.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {selectedServices.map(s => {
                    let totalOptionsPrice = 0;
                    if (s.selectedOptions && s.selectedOptions.length > 0) {
                      s.selectedOptions.forEach(opt => {
                        const match = opt.match(/₹([\d,]+)/);
                        if (match) {
                          totalOptionsPrice += parseInt(match[1].replace(/,/g, ''), 10);
                        }
                      });
                    }
                    const displayPrice = totalOptionsPrice > 0 ? totalOptionsPrice : (Number(s.price) || 0);

                    return (
                    <div key={s.uniqueCartId} style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-light)', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>&bull; {s.name}</span>
                        <span>₹{displayPrice}</span>
                      </div>
                      {s.selectedOptions && s.selectedOptions.length > 0 && (
                        <div style={{ paddingLeft: '15px', marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <em>Options:</em> {s.selectedOptions.join(', ')}
                        </div>
                      )}
                    </div>
                  )})}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <span>Total Estimate:</span>
                  <span>
                    ₹{selectedServices.reduce((sum, s) => {
                      let p = 0;
                      if (s.selectedOptions && s.selectedOptions.length > 0) {
                        s.selectedOptions.forEach(opt => {
                          const m = opt.match(/₹([\d,]+)/);
                          if (m) p += parseInt(m[1].replace(/,/g, ''), 10);
                        });
                      }
                      return sum + (p > 0 ? p : (Number(s.price) || 0));
                    }, 0)}
                  </span>
                </div>

                <form onSubmit={handleBooking}>
                  <div className="form-group">
                    <label className="form-label">Select Date</label>
                    <input type="date" className="form-control" required 
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDetails.date} onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Select Time</label>
                    <input type="time" className="form-control" required 
                      value={bookingDetails.time} onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})} 
                    />
                  </div>
                  <button className="btn-primary" type="submit" style={{ width: '100%' }}>Confirm Booking</button>
                  <button className="btn-outline" type="button" style={{ width: '100%', marginTop: '0.5rem', border: 'none' }} onClick={() => setSelectedServices([])}>
                    Clear Selection
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .services-container {
          padding-top: 100px;
          min-height: 100vh;
          padding-bottom: 50px;
        }

        .services-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .category-section {
          margin-bottom: 3rem;
        }

        .category-header {
          font-family: var(--font-serif);
          color: var(--text-light);
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .category-items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          align-items: start;
        }

        /* ======= SERVICE CARD — standalone, does NOT use .card class ======= */
        .svc-card {
          background: rgba(40, 38, 36, 0.6);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .svc-card:hover {
          border-color: var(--primary);
          background-color: rgba(60, 58, 56, 0.8);
        }

        .svc-card--expanded {
          padding: 1.25rem 1.5rem;
        }

        .svc-card__title {
          font-family: var(--font-serif);
          color: var(--primary);
          font-size: 1.2rem;
          margin-bottom: 0.25rem;
        }

        .svc-card__price {
          color: var(--text-muted);
          font-size: 0.85rem;
          font-style: italic;
          margin-bottom: 0.5rem;
        }

        .svc-card__desc {
          font-size: 0.9rem;
          color: var(--text-light);
          margin-bottom: 0.75rem;
        }

        .svc-card__toggle {
          font-size: 0.9rem;
          color: var(--primary);
          font-weight: bold;
          margin: 0;
        }

        .svc-card__login-msg {
          text-align: center;
          margin-top: 0.75rem;
          font-style: italic;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .svc-card__btn {
          width: 100%;
          padding: 10px;
          cursor: pointer;
        }

        .svc-card__btn--disabled {
          background-color: #555 !important;
          cursor: not-allowed !important;
          border-color: #444 !important;
          color: #888 !important;
        }

        .svc-card--inactive {
          opacity: 0.7;
          filter: grayscale(0.5);
        }

        /* ======= OPTIONS DROPDOWN ======= */
        .svc-card__options {
          margin-top: 0.75rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          animation: slideDown 0.2s ease-out;
        }

        .svc-card__options-label {
          font-size: 0.9rem;
          color: var(--text-light);
          margin-bottom: 0.4rem;
        }

        .svc-card__option {
          display: flex;
          align-items: center;
          margin-bottom: 0.4rem;
          font-size: 0.9rem;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .custom-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
          cursor: pointer;
          margin-right: 8px;
        }

        .service-info {
          flex: 1;
        }

        .alert-message {
          max-width: 600px;
          margin: 0 auto 2rem;
          padding: 1rem;
          background-color: rgba(255, 163, 150, 0.1);
          border: 1px solid var(--primary);
          color: var(--primary);
          text-align: center;
          border-radius: 4px;
        }

        @media (max-width: 900px) {
          .services-content {
            grid-template-columns: 1fr;
          }
          .services-sidebar {
            order: -1;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </>
  );
};

export default ServicesPage;
