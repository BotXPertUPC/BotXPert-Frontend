import axios from 'axios';

// Determine if we're running locally or on production
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('192.168');

const baseURL = isLocalhost 
  ? 'http://127.0.0.1:8000/' 
  : 'http://187.33.149.121/';

const api = axios.create({
  baseURL,
});

export default api;