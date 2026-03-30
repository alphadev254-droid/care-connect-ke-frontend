import { api } from '@/lib/api';

export interface User {
  id: number;
  email: string;
  role: 'patient' | 'caregiver' | 'primary_physician' | 'system_manager' | 'regional_manager' | 'Accountant';
  firstName: string;
  lastName: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  permissions?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: string;
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data: RegisterData | FormData) => {
    const response = await api.post('/auth/register', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('user');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  updateUserInStorage: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Synchronous check — just reads localStorage, no API call
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('user');
  }
};
