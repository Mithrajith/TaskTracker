import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (registerNumber, password) => {
    const res = await apiClient.post('/auth/login', {
      registerNumber,
      password,
    });

    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async ({ name, registerNumber, githubRepoUrl, password }) => {
    const res = await apiClient.post('/auth/register', {
      name,
      registerNumber,
      githubRepoUrl,
      password,
    });

    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      // Ignore error on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
    return null;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    if (res.data.success) {
      setUser((prev) => {
        const updated = { ...prev, mustChangePassword: false };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
    throw new Error(res.data.message || 'Failed to update password');
  };

  const updateProfile = async (payload) => {
    const res = await apiClient.patch('/auth/profile', payload);

    if (res.data.success) {
      let updatedUser = null;
      setUser((prev) => {
        updatedUser = { ...prev, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
      return updatedUser;
    }
    throw new Error(res.data.message || 'Failed to update profile');
  };

  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        changePassword,
        updateProfile,
        isAdmin: user?.role === 'admin',
        isStudent,
        mustChangePassword: user?.mustChangePassword === true,
        needsGithubSetup: isStudent && user?.mustSetGithub === true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

