import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Navbar from '../components/Navbar';

const validateEmail = (email) => {
  if (!email) return '';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? '' : 'Please enter a valid email address';
};

const validatePhone = (phone) => {
  if (!phone) return '';
  const re = /^\d{10}$/;
  return re.test(phone) ? '' : 'Phone number must be exactly 10 digits';
};

const validatePassword = (password) => {
  return {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  };
};

const isPasswordValid = (password) => {
  const rules = validatePassword(password);
  return rules.minLength && rules.hasUppercase && rules.hasNumber;
};

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: 'transparent' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: '#ff4d4d' };
  if (score === 2) return { level: 2, label: 'Fair', color: '#ffa726' };
  if (score === 3) return { level: 3, label: 'Strong', color: '#66bb6a' };
  return { level: 4, label: 'Very Strong', color: '#00e676' };
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [registerStep, setRegisterStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    code: ''
  });

  const [fieldErrors, setFieldErrors] = useState({ email: '', phone: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({
    email: '',
    code: '',
    newPassword: ''
  });

  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 10000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 10000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (forgotError) {
      const t = setTimeout(() => setForgotError(''), 10000);
      return () => clearTimeout(t);
    }
  }, [forgotError]);

  useEffect(() => {
    if (forgotSuccess) {
      const t = setTimeout(() => setForgotSuccess(''), 10000);
      return () => clearTimeout(t);
    }
  }, [forgotSuccess]);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setRegisterStep(1);
    setError('');
    setSuccessMsg('');
    setFormData({ name: '', email: '', phone: '', password: '', code: '' });
    setFieldErrors({ email: '', phone: '' });
    setForgotMode(false);
    setForgotStep(1);
    setForgotData({ email: '', code: '', newPassword: '' });
    setForgotError('');
    setForgotSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'code') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setFormData({ ...formData, code: cleaned });
      return;
    }

    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: cleaned });
      setFieldErrors((prev) => ({ ...prev, phone: validatePhone(cleaned) }));
      return;
    }

    setFormData({ ...formData, [name]: value });

    if (name === 'email') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const hasFieldErrors = Object.values(fieldErrors).some((msg) => msg !== '');

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordRules = validatePassword(formData.password);
  const isPasswordAcceptable = isPasswordValid(formData.password);

  const forgotPasswordStrength = getPasswordStrength(forgotData.newPassword);
  const forgotPasswordRules = validatePassword(forgotData.newPassword);
  const isForgotPasswordAcceptable = isPasswordValid(forgotData.newPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }

    setLoading(false);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }

    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);

    if (emailErr || phoneErr) {
      setFieldErrors({ email: emailErr, phone: phoneErr });
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/send-verification`, {
        email: formData.email
      });

      setSuccessMsg(data.devCode
        ? `Verification code: ${data.devCode}. Enter this code to continue.`
        : 'Verification code sent! Please check your email inbox. This code is valid for 10 minutes.');
      setRegisterStep(2);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Error sending code');
      } else if (err.request) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('An unexpected error occurred: ' + err.message);
      }
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/send-verification`, {
        email: formData.email
      });

      setSuccessMsg(data.devCode
        ? `New verification code: ${data.devCode}. Enter this code to continue.`
        : 'New verification code sent! Check your email. This code is valid for 10 minutes.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    }

    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.code || formData.code.length !== 4) {
      setError('Please enter the 4-digit verification code');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-code`, {
        email: formData.email,
        code: formData.code
      });

      setSuccessMsg('Code verified! Please create a password.');
      setRegisterStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    }

    setLoading(false);
  };

  const handleRegisterFinal = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordAcceptable) {
      setError('Password must be at least 6 characters, include 1 uppercase letter and 1 number.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      setSuccessMsg('Registration successful! Please log in.');
      setIsLogin(true);
      setRegisterStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }

    setLoading(false);
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;

    if (name === 'code') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setForgotData({ ...forgotData, code: cleaned });
      return;
    }

    setForgotData({ ...forgotData, [name]: value });
  };

  const handleForgotSendCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const emailErr = validateEmail(forgotData.email);
    if (emailErr) {
      setForgotError(emailErr);
      return;
    }

    setForgotLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/send-reset-code`, {
        email: forgotData.email
      });

      setForgotSuccess(data.devCode
        ? `Reset code: ${data.devCode}. Enter this code to continue.`
        : 'Reset code sent! Please check your email inbox. This code is valid for 10 minutes.');
      setForgotStep(2);
    } catch (err) {
      if (err.response) {
        setForgotError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setForgotError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setForgotError('An unexpected error occurred: ' + err.message);
      }
    }

    setForgotLoading(false);
  };

  const handleForgotResendCode = async () => {
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/send-reset-code`, {
        email: forgotData.email
      });

      setForgotSuccess(data.devCode
        ? `New reset code: ${data.devCode}. Enter this code to continue.`
        : 'New reset code sent! Check your email. This code is valid for 10 minutes.');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to resend code');
    }

    setForgotLoading(false);
  };

  const handleForgotVerifyCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotData.code || forgotData.code.length !== 4) {
      setForgotError('Please enter the 4-digit verification code');
      return;
    }

    setForgotLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-code`, {
        email: forgotData.email,
        code: forgotData.code
      });

      setForgotSuccess('Code verified! Set your new password.');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid code');
    }

    setForgotLoading(false);
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!isForgotPasswordAcceptable) {
      setForgotError('Password must be at least 6 characters, include 1 uppercase letter and 1 number.');
      return;
    }

    setForgotLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email: forgotData.email,
        code: forgotData.code,
        newPassword: forgotData.newPassword
      });

      setForgotSuccess('Password reset successful! Please log in.');

      setTimeout(() => {
        setForgotMode(false);
        setForgotStep(1);
        setForgotData({ email: '', code: '', newPassword: '' });
        setForgotError('');
        setForgotSuccess('');
      }, 1500);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Password reset failed');
    }

    setForgotLoading(false);
  };

  const PasswordStrengthBar = ({ strength }) => {
    if (!strength.label) return null;

    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: '0.78rem', color: strength.color, fontWeight: 500 }}>
          {strength.label}
        </span>
      </div>
    );
  };

  const PasswordRulesChecklist = ({ rules, password }) => {
    if (!password) return null;

    const ruleItems = [
      { key: 'minLength', label: 'At least 6 characters', met: rules.minLength },
      { key: 'hasUppercase', label: 'At least 1 uppercase letter', met: rules.hasUppercase },
      { key: 'hasNumber', label: 'At least 1 number', met: rules.hasNumber },
    ];

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: '0.82rem' }}>
        {ruleItems.map((r) => (
          <li
            key={r.key}
            style={{
              color: r.met ? '#66bb6a' : '#ff6b6b',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{r.met ? '✓' : '✗'}</span>
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
    );
  };

  const StepIndicator = ({ currentStep, totalSteps, labels }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', gap: '8px' }}>
      {labels.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={stepNum}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                background: isCompleted ? 'var(--primary)' : isActive ? 'rgba(255,163,150,0.2)' : 'rgba(255,255,255,0.05)',
                color: isCompleted ? 'var(--bg-darker)' : isActive ? 'var(--primary)' : 'var(--text-muted)',
                border: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : stepNum}
              </div>
              <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{label}</span>
            </div>

            {stepNum < totalSteps && (
              <div
                style={{
                  width: '30px',
                  height: '2px',
                  background: isCompleted ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  marginBottom: '18px',
                  transition: 'background 0.3s ease'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <>
      <Navbar />

      <div className="auth-container">
        <div className="card auth-card">
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>
            {forgotMode ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {forgotMode ? (
            <>
              <StepIndicator currentStep={forgotStep} totalSteps={3} labels={['Email', 'Code', 'Password']} />

              {forgotError && <div className="feedback-message error-message">{forgotError}</div>}
              {forgotSuccess && <div className="feedback-message success-message">{forgotSuccess}</div>}

              {forgotStep === 1 && (
                <form onSubmit={handleForgotSendCode}>
                  <div className="form-group">
                    <label className="form-label">Registered Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      required
                      value={forgotData.email}
                      onChange={handleForgotChange}
                      placeholder="Enter your registered email"
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={forgotLoading}>
                    {forgotLoading ? <><span className="auth-spinner"></span> Sending...</> : 'Send Reset Code'}
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    style={{ width: '100%', marginTop: '0.5rem', border: 'none' }}
                    onClick={() => {
                      setForgotMode(false);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                  >
                    ← Back to Login
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleForgotVerifyCode}>
                  <div className="form-group">
                    <label className="form-label">Verification Code sent to {forgotData.email}</label>
                    <input
                      type="text"
                      name="code"
                      className="form-control code-input"
                      required
                      value={forgotData.code}
                      onChange={handleForgotChange}
                      placeholder="0000"
                      maxLength={4}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Code is valid for 10 minutes.
                    </p>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={forgotLoading}>
                    {forgotLoading ? <><span className="auth-spinner"></span> Verifying...</> : 'Verify Code'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <button type="button" className="btn-outline" style={{ border: 'none', padding: '8px 0' }} onClick={() => setForgotStep(1)}>
                      ← Edit Email
                    </button>

                    <button
                      type="button"
                      className="btn-outline"
                      style={{ border: 'none', padding: '8px 0' }}
                      onClick={handleForgotResendCode}
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleForgotResetPassword}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>

                    <div style={{ position: 'relative' }}>
                      <input
                        type={showForgotPassword ? 'text' : 'password'}
                        name="newPassword"
                        className="form-control"
                        required
                        value={forgotData.newPassword}
                        onChange={handleForgotChange}
                        style={{ paddingRight: '40px' }}
                      />

                      <span
                        onClick={() => setShowForgotPassword(!showForgotPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          userSelect: 'none'
                        }}
                      >
                        {showForgotPassword ? '🙈' : '👁️'}
                      </span>
                    </div>

                    <PasswordStrengthBar strength={forgotPasswordStrength} />
                    <PasswordRulesChecklist rules={forgotPasswordRules} password={forgotData.newPassword} />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    disabled={forgotLoading || !isForgotPasswordAcceptable}
                  >
                    {forgotLoading ? <><span className="auth-spinner"></span> Resetting...</> : 'Reset Password'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              {error && <div className="feedback-message error-message">{error}</div>}
              {successMsg && <div className="feedback-message success-message">{successMsg}</div>}

              {isLogin ? (
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${fieldErrors.email ? 'input-error' : ''}`}
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>

                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="form-control"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        style={{ paddingRight: '40px' }}
                        placeholder="Enter your password"
                      />

                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          userSelect: 'none'
                        }}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                    <span
                      className="forgot-password-link"
                      onClick={() => {
                        setForgotMode(true);
                        setError('');
                        setSuccessMsg('');
                      }}
                    >
                      Forgot Password?
                    </span>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={hasFieldErrors || loading}>
                    {loading ? <><span className="auth-spinner"></span> Logging in...</> : 'Log In'}
                  </button>
                </form>
              ) : (
                <>
                  <StepIndicator currentStep={registerStep} totalSteps={3} labels={['Details', 'Verify', 'Password']} />

                  {registerStep === 1 && (
                    <form onSubmit={handleSendCode}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className={`form-control ${fieldErrors.email ? 'input-error' : ''}`}
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                        />
                        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Phone Number <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Optional)</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className={`form-control ${fieldErrors.phone ? 'input-error' : ''}`}
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g., 8456379156"
                          maxLength={10}
                          inputMode="numeric"
                        />
                        {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                      </div>

                      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || hasFieldErrors}>
                        {loading ? <><span className="auth-spinner"></span> Sending...</> : 'Send Verification Code'}
                      </button>
                    </form>
                  )}

                  {registerStep === 2 && (
                    <form onSubmit={handleVerifyCode}>
                      <div className="form-group">
                        <label className="form-label">Verification Code sent to {formData.email}</label>
                        <input
                          type="text"
                          name="code"
                          className="form-control code-input"
                          required
                          value={formData.code}
                          onChange={handleChange}
                          placeholder="0000"
                          maxLength={4}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                          Code is valid for 10 minutes.
                        </p>
                      </div>

                      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? <><span className="auth-spinner"></span> Verifying...</> : 'Verify Code'}
                      </button>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <button type="button" className="btn-outline" style={{ border: 'none', padding: '8px 0' }} onClick={() => setRegisterStep(1)}>
                          ← Edit Email
                        </button>

                        <button
                          type="button"
                          className="btn-outline"
                          style={{ border: 'none', padding: '8px 0' }}
                          onClick={handleResendCode}
                          disabled={loading}
                        >
                          {loading ? 'Sending...' : 'Resend OTP'}
                        </button>
                      </div>
                    </form>
                  )}

                  {registerStep === 3 && (
                    <form onSubmit={handleRegisterFinal}>
                      <div className="form-group">
                        <label className="form-label">Create a Password</label>

                        <div style={{ position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className="form-control"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            style={{ paddingRight: '40px' }}
                          />

                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              userSelect: 'none'
                            }}
                          >
                            {showPassword ? '🙈' : '👁️'}
                          </span>
                        </div>

                        <PasswordStrengthBar strength={passwordStrength} />
                        <PasswordRulesChecklist rules={passwordRules} password={formData.password} />
                      </div>

                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={!isPasswordAcceptable || loading}
                      >
                        {loading ? <><span className="auth-spinner"></span> Registering...</> : 'Complete Registration'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </>
          )}

          <p className="auth-toggle">
            {isLogin || forgotMode ? "Don't have an account? " : "Already have an account? "}
            <span onClick={handleToggle} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLogin || forgotMode ? 'Register' : 'Log In'}
            </span>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 80px;
          background: transparent;
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          backdrop-filter: blur(8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        }

        .auth-toggle {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .feedback-message {
          padding: 10px;
          margin-bottom: 1rem;
          border-radius: 4px;
          text-align: center;
          font-size: 0.9rem;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .error-message {
          background-color: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.4);
          color: #ffcccc;
        }

        .field-error {
          display: block;
          color: #ff6b6b;
          font-size: 0.8rem;
          margin-top: 4px;
          padding-left: 2px;
        }

        .input-error {
          border-color: #ff6b6b !important;
          box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.25);
        }

        .success-message {
          background-color: rgba(46, 204, 113, 0.1);
          border: 1px solid #2ecc71;
          color: #2ecc71;
        }

        .forgot-password-link {
          color: var(--primary);
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .forgot-password-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .code-input {
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
          letter-spacing: 12px;
          font-family: 'Courier New', monospace;
        }

        .code-input::placeholder {
          letter-spacing: 12px;
          font-size: 1.5rem;
          opacity: 0.3;
        }

        .auth-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top: 2px solid var(--bg-darker);
          border-radius: 50%;
          animation: authSpin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }

        @keyframes authSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AuthPage;
