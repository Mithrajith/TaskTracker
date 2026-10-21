import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from './AdminLayout';
import { StudentLayout } from './StudentLayout';

// Pages
import { Login } from '../pages/Login';
import { SignUp } from '../pages/SignUp';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { StudentDetailPage } from '../pages/admin/StudentDetailPage';
import { ImportStudentsPage } from '../pages/admin/ImportStudentsPage';
import { TasksPage } from '../pages/admin/TasksPage';
import { ReviewsPage } from '../pages/admin/ReviewsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { AddUserPage } from '../pages/admin/AddUserPage';
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentHistoryPage } from '../pages/student/StudentHistoryPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LandingPage } from '../pages/LandingPage';

export const AppRoutes = () => {
  const { user, token } = useAuth();


  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          token && user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Public Sign Up Route */}
      <Route
        path="/signup"
        element={
          token && user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
          ) : (
            <SignUp />
          )
        }
      />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/students/import" element={<ImportStudentsPage />} />
          <Route path="/admin/students/:id" element={<StudentDetailPage />} />
          <Route path="/admin/tasks" element={<TasksPage />} />
          <Route path="/admin/reviews" element={<ReviewsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/add-user" element={<AddUserPage />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/history" element={<StudentHistoryPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Root Landing Page Route */}
      <Route
        path="/"
        element={
          token && user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

