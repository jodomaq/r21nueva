import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

const api = axios.create({
  baseURL: isLocalhost ? 'http://localhost:8000' : import.meta.env.VITE_API_BASE
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;