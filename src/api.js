import axios from 'axios';

// Determine if we're running locally or on production
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('192.168');

const baseURL = isLocalhost 
  ? 'http://127.0.0.1:8000/api/' 
  : '/api/';

const token = isLocalhost
 ? '5fc8db25bf14ab3c73c9ba1aee9c24041417eb1a'
 : 'f9362bf38eff64c300ec094dc050ca76906e0ede';

const api = axios.create({
  baseURL,
  headers: {
    Authorization: `Token ${token}`,
    Accept: 'application/json',
  }
});

export default api;