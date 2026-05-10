const API_BASE_URL =
  (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : undefined) ||
  import.meta.env.REACT_APP_API_URL ||
  import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_URL or VITE_API_URL is required');
}

export default API_BASE_URL.replace(/\/$/, '');
