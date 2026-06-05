const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://salon-reservation.onrender.com';

const API_BASE_URL =
  (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : undefined) ||
  DEFAULT_API_BASE_URL;

export default API_BASE_URL.replace(/\/$/, '');
