// src/services/authService.ts
import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

const API_URL = '/api/auth';

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/register`, data);
  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, credentials);
    
    // Store the token in localStorage
    if (response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.post(`${API_URL}/logout`);
  } finally {
    // Remove token and user from localStorage regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Axios interceptor to add token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage on unauthorized errors
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);