import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useNotifications } from './NotificationsContext';
import { useApplications } from './ApplicationsContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

interface SignupData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get contexts - these will be undefined if not wrapped in their providers
  let notificationsContext;
  let applicationsContext;
  try {
    notificationsContext = useNotifications();
  } catch {
    // NotificationsProvider not available, continue without notifications
    notificationsContext = null;
  }
  
  try {
    applicationsContext = useApplications();
  } catch {
    // ApplicationsProvider not available, continue without applications
    applicationsContext = null;
  }

  useEffect(() => {
    console.log('AuthContext useEffect running');
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('user');
    console.log('Saved user:', savedUser);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
    console.log('AuthContext loading set to false');
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // Call backend API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Invalid username/password';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Invalid username/password';
        } catch {
          // If response is not JSON, use default message
          errorMessage = 'Invalid username/password';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const user: User = result.user;
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      setIsLoading(false);
      return user;
    } catch (error: any) {
      setIsLoading(false);
      // Handle network errors and other errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error?.message || 'Invalid username/password');
      }
    }
  };

  const signup = async (data: SignupData): Promise<User> => {
    setIsLoading(true);
    try {
      // Call backend API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const result = await response.json();
      const newUser: User = result.user;
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Create notification for admin when new user signs up
      if (notificationsContext) {
        notificationsContext.createSignupNotification(
          data.fullName,
          data.email,
          data.role
        );
      }
      
      setIsLoading(false);
      return newUser;
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}