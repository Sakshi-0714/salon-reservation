const DEFAULT_API_BASE_URL = 'https://salon-reservation.onrender.com';

const API_BASE_URL =
  (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : undefined) ||
  import.meta.env.REACT_APP_API_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_BASE_URL;

export default API_BASE_URL.replace(/\/$/, '');
