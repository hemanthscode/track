// src/context/AuthContext.tsx
import { createContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface AuthContextProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<null>(null);

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const { initialize } = useAuthStore();
  
  useEffect(() => {
    // Initialize auth state from localStorage when the app loads
    initialize();
  }, [initialize]);
  
  return (
    <AuthContext.Provider value={null}>
      {children}
    </AuthContext.Provider>
  );
};