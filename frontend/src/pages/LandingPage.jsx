import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/reviews`);
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  return (
    <>
      <Navbar />
      <div className="hero-section">
        <div className="hero-content">
          <div className="ornament">
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor">
              <path d="M0 10H15M25 10H40" stroke="var(--primary)" strokeWidth="1" />
              <rect x="15" y="5" width="10" height="10" transform="rotate(45 20 10)" stroke="var(--primary)" strokeWidth="1" />
            </svg>
          </div>
          <h2 className="heading-cursive">Massage therapy and spa</h2>
          <h1 className="heading-primary">Welcome to our salon</h1>
          <p className="hero-subtitle">You owe yourself this moment. Make an appointment in just a click!</p>

          <div className="hero-buttons">
            {!isAdmin && (
              <>
                <button className="btn-primary hero-btn" onClick={() => navigate('/services')}>
                  Explore Services
                </button>
                <button className="btn-outline hero-btn" onClick={() => navigate('/map')}>
                  📍 Find Us
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="reviews-section">
          <div className="container">
            <h2 className="heading-primary" style={{ textAlign: 'center', marginBottom: '3rem' }}>Customer Reviews</h2>
            <div className="reviews-grid">
              {reviews.map(review => (
                <div key={review.id} className="review-card card">
                  <div className="review-stars">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  {review.comment && <p className="review-comment">"{review.comment}"</p>}
                  <div className="review-author">
                    <strong>{review.user_name}</strong>
                    <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}> • {review.service_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hero-section {
          height: 100vh;
          width: 100%;
          background: linear-gradient(rgba(30, 28, 27, 0.7), rgba(30, 28, 27, 0.7)), url('https://images.unsplash.com/photo-1540555694295-8e4ce2ce1f36?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .hero-content {
          animation: fadeIn 1.5s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-top: 5rem;
        }

        .ornament {
          color: var(--primary);
          margin-bottom: -1rem;
        }

        .hero-subtitle {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.85);
        }

        .hero-buttons {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }

        .hero-btn {
          min-width: 180px;
        }

        .btn-gold {
          background: linear-gradient(135deg, #d4af37 0%, #fbd45d 50%, #d4af37 100%);
          color: black;
          padding: 14px 32px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          cursor: pointer;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-gold:hover {
          background: linear-gradient(135deg, #fbd45d 0%, #d4af37 50%, #fbd45d 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
        }

        .btn-outline-gold {
          border: 1px solid #fbd45d;
          color: #fbd45d;
          padding: 14px 32px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          cursor: pointer;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-outline-gold:hover {
          background: linear-gradient(135deg, #fbd45d 0%, #d4af37 50%, #fbd45d 100%);
          color: black !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
          border-color: transparent !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .hero-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .hero-btn {
            min-width: 200px;
          }
        }
        
        .reviews-section {
          padding: 5rem 0;
          background-color: var(--bg-dark);
        }
        
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .review-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(40, 38, 36, 0.8);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          transition: transform 0.3s ease;
        }
        
        .review-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }
        
        .review-stars {
          color: #f39c12;
          font-size: 1.2rem;
          letter-spacing: 2px;
        }
        
        .review-comment {
          font-style: italic;
          color: var(--text-light);
          flex-grow: 1;
        }
        
        .review-author {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </>
  );
};

export default LandingPage;
