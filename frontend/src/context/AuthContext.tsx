'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  creado_el: string;
  rol?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (correo: string, contrasena: string) => Promise<{ success: boolean; error?: string }>;
  register: (nombre: string, correo: string, telefono: string, contrasena: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (nombre: string, telefono: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (correo: string, contrasena: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock API call - replace with real API
      // const res = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ correo, contrasena }),
      // });
      
      // Mock authentication - hardcoded for demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      if (correo === 'demo@reservaya.cl' && contrasena === 'demo123') {
        const mockUser: User = {
          id: '1',
          nombre: 'Usuario Demo',
          correo: 'demo@reservaya.cl',
          telefono: '+56912345678',
          creado_el: new Date().toISOString(),
          rol: 'usuario',
        };

        const mockToken = 'mock_jwt_token_' + Date.now();
        
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        setIsLoggedIn(true);
        
        return { success: true };
      } else {
        return { success: false, error: 'Correo o contraseña incorrectos' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error al iniciar sesión. Intenta nuevamente.' };
    }
  };

  const register = async (
    nombre: string,
    correo: string,
    telefono: string,
    contrasena: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock API call - replace with real API
      // const res = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nombre, correo, telefono, contrasena }),
      // });
      
      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Check if email already exists (mock check)
      const existingEmails = ['existente@example.com'];
      if (existingEmails.includes(correo)) {
        return { success: false, error: 'Este correo ya está registrado' };
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Error al crear la cuenta. Intenta nuevamente.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateProfile = async (nombre: string, telefono: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock API call - replace with real API
      // const token = localStorage.getItem('auth_token');
      // const res = await fetch('/api/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ nombre, telefono }),
      // });

      await new Promise(resolve => setTimeout(resolve, 800));

      if (user) {
        const updatedUser = { ...user, nombre, telefono };
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }

      return { success: false, error: 'Usuario no encontrado' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Error al actualizar perfil' };
    }
  };

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
