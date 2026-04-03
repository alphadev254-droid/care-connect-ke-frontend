import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
  withCredentials: true, // Send cookies with requests
});

// Track if a redirect is already in progress to prevent duplicate redirects
let isRedirectingToLogin = false;

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error;
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isProfileRequest = error.config?.url?.includes('/auth/profile');

      if (isLoginRequest) {
        toast.error(errorMessage || 'Invalid credentials');
        return Promise.reject(error);
      }

      // For profile/init requests, just reject — AuthContext handles cleanup
      if (isProfileRequest) {
        return Promise.reject(error);
      }

      // Session expired mid-session — redirect once
      if (!isRedirectingToLogin && window.location.pathname !== '/login') {
        isRedirectingToLogin = true;
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || 'You do not have permission to perform this action.';
      toast.error('Permission Denied', {
        description: errorMessage,
        duration: 5000,
      });
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      // CORS or network connectivity issue
      if (!error.response) {
        toast.error('Connection failed. This may be a network or firewall issue. Please check your connection or try a different network.');
      } else {
        toast.error('Cannot connect to server. Please check your connection.');
      }
    } else if (error.response?.data) {
      const data = error.response.data;
      
      // Handle validation errors - show only the detailed errors, not the generic message
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const combinedErrors = data.errors.join('\n');
        toast.error(combinedErrors);
      } else if (data.error) {
        toast.error(data.error);
      } else if (data.message) {
        toast.error(data.message);
      }
    } else if (error.message) {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

export default api;