import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const signup = async (name, email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/signup', { name, email, password });
      const { success, token, user } = response.data;
      if (success && token && user) {
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true };
      }
      throw new Error('서버 응답 형식이 올바르지 않습니다');
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.error || err.message || '회원가입에 실패했습니다';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { success, token, user } = response.data;
      if (success && token && user) {
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true };
      }
      throw new Error('서버 응답 형식이 올바르지 않습니다');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || err.message || '로그인에 실패했습니다';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
