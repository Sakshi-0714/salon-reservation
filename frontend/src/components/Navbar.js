import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

const Navbar = ({ hideLinks = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <img src="/logo.png" alt="StaySync Logo" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-title">StaySync</span>
          </div>
        </Link>
        <ul className="nav-menu">
          {user && user.role === 'admin' ? (
            <>
              <li>
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                  Appointments
                </Link>
              </li>
              <li>
                <Link to="/admin/staff" className={`nav-link ${location.pathname === '/admin/staff' ? 'active' : ''}`}>
                  Staff Details
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                  Dashboard
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}>
                  Services
                </Link>
              </li>
              {user && (
                <li>
                  <Link to="/appointments" className={`nav-link ${location.pathname === '/appointments' ? 'active' : ''}`}>
                    My Appointments
                  </Link>
                </li>
              )}
              <li>
                <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}>
                  Location & Map
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                  Contact
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className="nav-icons">
          {user ? (
            <div className="profile-dropdown">
              <div className="nav-icon" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <User size={20} />
              </div>
              {dropdownOpen && (
                <div className="profile-dropdown-menu">
                  {user.role !== 'admin' && (
                    <Link to="/profile" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <User size={16} />
                      Profile
                    </Link>
                  )}
                  <div className="profile-dropdown-item" onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}>
                    <LogOut size={16} />
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="nav-link" style={{ fontSize: '0.8rem' }}>
              LOGIN / REGISTER
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
