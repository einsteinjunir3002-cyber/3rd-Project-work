import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  adminView: 'admin' | 'student' | 'lecturer';
  setAdminView: (view: 'admin' | 'student' | 'lecturer') => void;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; message: string }>;
  signUp: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  switchUserRole: (role: 'student' | 'lecturer') => void;
  registerBiometrics: () => Promise<void>;
  signInWithBiometrics: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminView, setAdminViewInternal] = useState<'admin' | 'student' | 'lecturer'>(() => {
    return (localStorage.getItem('smartlearn_admin_view') as 'admin' | 'student' | 'lecturer') || 'admin';
  });

  const setAdminView = (view: 'admin' | 'student' | 'lecturer') => {
    setAdminViewInternal(view);
    localStorage.setItem('smartlearn_admin_view', view);
  };

  useEffect(() => {
    const verifySession = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        
        const response = await axios.get('/api/auth/session');
        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('Session verification failed.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await axios.post('/api/auth/signin', { email, password, rememberMe });
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      const loggedUser: User = response.data.user;
      setUser(loggedUser);
      localStorage.setItem('smartlearn_user', JSON.stringify(loggedUser));
      return { success: true, message: response.data.message || 'Logged in!' };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Authentication failed.');
    }
  };

  const signUp = async (data: any) => {
    try {
      const response = await axios.post('/api/auth/signup', data);
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      const loggedUser: User = response.data.user;
      setUser(loggedUser);
      localStorage.setItem('smartlearn_user', JSON.stringify(loggedUser));
      return { success: true, message: response.data.message || 'Account created!' };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout endpoint offline.');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('smartlearn_user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const switchUserRole = (role: 'student' | 'lecturer') => {
    localStorage.setItem('preferred_email', role === 'student' ? 'stu@smartlearn.edu' : 'lec@smartlearn.edu');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('smartlearn_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const registerBiometrics = async () => {
    throw new Error('Biometric features have been disabled.');
  };

  const signInWithBiometrics = async (email: string) => {
    throw new Error('Biometric features have been disabled.');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      adminView, 
      setAdminView, 
      signIn, 
      signUp, 
      logout, 
      switchUserRole,
      registerBiometrics,
      signInWithBiometrics
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
