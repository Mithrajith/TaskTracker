import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D806B]" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin' : '/student'}
        replace
      />
    );
  }

  return <Outlet />;
};

