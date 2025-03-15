// src/types/auth.ts
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
  message: string;
}