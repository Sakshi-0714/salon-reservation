import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Navbar from '../components/Navbar';

const AdminAnalyticsDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // '7', '30', 'all'
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
      return;
    }
    fetchAppointments();
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/appointments`, config);
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    if (timeFilter === 'all') return appointments;
    
    const now = new Date();
    const filterDays = parseInt(timeFilter);
    const cutoffDate = new Date(now.setDate(now.getDate() - filterDays));

    return appointments.filter(app => {
      const appDate = new Date(app.appointment_date);
      return appDate >= cutoffDate;
    });
  };

  const calculateAnalytics = (filteredData) => {
    let totalBookings = 0;
    let completedServices = 0;
    let cancelledServices = 0;
    const serviceCounts = {};

    filteredData.forEach(app => {
      let parsedServices = [];
      try {
        parsedServices = typeof app.services === 'string' ? JSON.parse(app.services) : app.services;
      } catch (e) {
        parsedServices = [];
      }

      parsedServices.forEach(srv => {
        totalBookings++;
        
        if (srv.status === 'Completed') completedServices++;
        if (srv.status === 'Cancelled') cancelledServices++;

        if (srv.status === 'Approved' || srv.status === 'Completed') {
          const name = srv.name.split(' - ')[0].trim();
          serviceCounts[name] = (serviceCounts[name] || 0) + 1;
        }
      });
    });

    const chartData = Object.keys(serviceCounts).map(name => ({
      name,
      bookings: Number(serviceCounts[name])
    })).sort((a, b) => b.bookings - a.bookings);

    const topService = chartData.length > 0 ? chartData[0] : null;
    const leastService = chartData.length > 0 ? chartData[chartData.length - 1] : null;

    return { totalBookings, completedServices, cancelledServices, chartData, topService, leastService };
  };

  const analytics = useMemo(() => calculateAnalytics(getFilteredAppointments()), [appointments, timeFilter]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ paddingTop: '100px', textAlign: 'center', color: 'var(--primary)' }}>
          <h2>Loading Analytics...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container dashboard-container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="heading-primary">Analytics Dashboard</h1>
          <div className="filter-group">
            <button 
              className={`filter-btn ${timeFilter === '7' ? 'active' : ''}`}
              onClick={() => setTimeFilter('7')}
            >Last 7 Days</button>
            <button 
              className={`filter-btn ${timeFilter === '30' ? 'active' : ''}`}
              onClick={() => setTimeFilter('30')}
            >Last 30 Days</button>
            <button 
              className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >All Time</button>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Bookings</h3>
            <p className="summary-value">{analytics.totalBookings}</p>
          </div>
          <div className="summary-card">
            <h3>Completed Services</h3>
            <p className="summary-value" style={{ color: '#2ecc71' }}>{analytics.completedServices}</p>
          </div>
          <div className="summary-card">
            <h3>Cancelled Services</h3>
            <p className="summary-value" style={{ color: '#e74c3c' }}>{analytics.cancelledServices}</p>
          </div>
        </div>

        <div className="chart-section card">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>
            Most Booked Services (Approved & Completed)
          </h2>
          {analytics.chartData.length > 0 ? (
            <div style={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={analytics.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-light)" 
                    tick={{ fill: 'var(--text-light)', fontSize: 12 }} 
                    angle={-45} 
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    stroke="var(--text-light)" 
                    tick={{ fill: 'var(--text-light)' }} 
                    allowDecimals={false} 
                    domain={[0, 'dataMax + 1']}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} 
                    contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--primary)', color: 'white' }}
                  />
                  <Bar 
                    dataKey="bookings" 
                    fill="#f1c40f" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                    stroke="#fff"
                    strokeWidth={1}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>No approved or completed bookings found for this period.</p>
          )}
        </div>

        <div className="insights-section">
          <div className="insight-card card">
            <h3 style={{ color: '#f39c12', marginBottom: '1rem' }}>🏆 Top Performing Service</h3>
            {analytics.topService ? (
              <>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{analytics.topService.name}</p>
                <p style={{ color: 'var(--text-muted)' }}>{analytics.topService.bookings} bookings</p>
              </>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <div className="insight-card card">
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>⚠️ Least Booked Service</h3>
            {analytics.leastService ? (
              <>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{analytics.leastService.name}</p>
                <p style={{ color: 'var(--text-muted)' }}>{analytics.leastService.bookings} bookings</p>
              </>
            ) : (
              <p>N/A</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          padding-bottom: 50px;
        }

        .filter-group {
          display: flex;
          gap: 10px;
          background: rgba(0, 0, 0, 0.2);
          padding: 5px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .filter-btn {
          background: transparent;
          border: none;
          padding: 8px 16px;
          color: var(--text-light);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .filter-btn.active {
          background: var(--primary);
          color: black;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .summary-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .summary-card h3 {
          font-family: var(--font-serif);
          color: var(--text-light);
          margin-bottom: 10px;
        }

        .summary-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
        }

        .chart-section {
          margin-bottom: 30px;
          padding: 30px;
        }

        .insights-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .insight-card {
          padding: 25px;
          border-left: 4px solid transparent;
        }
        
        .insight-card:first-child {
          border-left-color: #f39c12;
        }
        
        .insight-card:last-child {
          border-left-color: #e74c3c;
        }

        @media (max-width: 768px) {
          .dashboard-container > div:first-child {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </>
  );
};

export default AdminAnalyticsDashboard;
