import React from 'react';
import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
        <h1 className="heading-primary" style={{ textAlign: 'center', margin: '2rem 0' }}>Get in Touch</h1>

        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>StaySync Salon</h2>
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>We'd love to hear from you. Reach out to us below!</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '15px 30px', borderRadius: '50px', width: '100%', maxWidth: '400px' }}>
              <Mail size={24} style={{ color: 'var(--primary)', marginRight: '15px' }} />
              <span style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>staysync@gmail.com</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '15px 30px', borderRadius: '50px', width: '100%', maxWidth: '400px' }}>
              <Phone size={24} style={{ color: 'var(--primary)', marginRight: '15px' }} />
              <span style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>8456379156</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '15px 30px', borderRadius: '50px', width: '100%', maxWidth: '400px' }}>
              <MapPin size={24} style={{ color: 'var(--primary)', marginRight: '15px' }} />
              <span style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>Hindwadi opposite to Lokmanya Society Belagavi, Karnataka</span>
            </div>
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Business Hours:<br />
              Mon-Sat: 9:00 AM - 8:00 PM<br />
              Sun: Closed
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
