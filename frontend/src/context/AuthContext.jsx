import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useNotification } from './NotificationContext.jsx';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('shopez_token');
      const storedUser = localStorage.getItem('shopez_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh profile in background
          const res = await api.getProfile();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('shopez_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.warn('Session expired or invalid:', error.message);
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('shopez_token', res.data.token);
        localStorage.setItem('shopez_user', JSON.stringify(res.data));
        addNotification(`Welcome back, ${res.data.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      addNotification(err.message || 'Login failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.register({ name, email, password });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('shopez_token', res.data.token);
        localStorage.setItem('shopez_user', JSON.stringify(res.data));
        addNotification('Account created successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      addNotification(err.message || 'Registration failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.data) {
        setUser(res.data);
        if (res.data.token) {
          localStorage.setItem('shopez_token', res.data.token);
        }
        localStorage.setItem('shopez_user', JSON.stringify(res.data));
        addNotification('Profile updated successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      addNotification(err.message || 'Update failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = (notify = true) => {
    setUser(null);
    localStorage.removeItem('shopez_token');
    localStorage.removeItem('shopez_user');
    if (notify) {
      addNotification('Logged out successfully', 'info');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
