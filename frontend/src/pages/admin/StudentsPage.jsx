import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { StudentTable } from '../../components/admin/StudentTable';
import { CreateStudentModal } from '../../components/admin/CreateStudentModal';
import { EditStudentModal } from '../../components/admin/EditStudentModal';
import { ResetPasswordModal } from '../../components/admin/ResetPasswordModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { ImageModal } from '../../components/common/ImageModal';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserPlus,
  UploadCloud,
  Search,
  Filter,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const StudentsPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [resetPassStudent, setResetPassStudent] = useState(null);
  const [toggleStudent, setToggleStudent] = useState(null);
  const [deleteStudentTarget, setDeleteStudentTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [zoomImageId, setZoomImageId] = useState(null);
  const [togglingLoading, setTogglingLoading] = useState(false);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: searchTerm.trim(),
      };
      if (statusFilter) params.status = statusFilter;

      const res = await apiClient.get('/students', { params });
      if (res.data?.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      error('Failed to fetch students list');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleToggleStatusConfirm = async () => {
    if (!toggleStudent) return;
    setTogglingLoading(true);
    try {
      const res = await apiClient.patch(`/students/${toggleStudent._id}/toggle-status`);
      if (res.data?.success) {
        success(res.data.message);
        setToggleStudent(null);
        fetchStudents(pagination.page);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setTogglingLoading(false);
    }
  };

  const handleDeleteStudentConfirm = async () => {
    if (!deleteStudentTarget) return;
    setDeleteLoading(true);
    try {
      const res = await apiClient.delete(`/students/${deleteStudentTarget._id}`);
      if (res.data?.success) {
        success(res.data.message || 'Student deleted successfully from database');
        setDeleteStudentTarget(null);
        fetchStudents(pagination.page);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span>Student Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage student enrollments, reset credentials, and track daily practical progress.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate('/admin/students/import')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-purple-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or register no..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>

          <button
            onClick={() => fetchStudents(pagination.page)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <StudentTable
          students={students}
          pagination={pagination}
          onPageChange={(page) => fetchStudents(page)}
          onViewProfile={(id) => navigate(`/admin/students/${id}`)}
          onEditStudent={(s) => setEditStudent(s)}
          onResetPassword={(s) => setResetPassStudent(s)}
          onToggleStatus={(s) => setToggleStudent(s)}
          onDeleteStudent={(s) => setDeleteStudentTarget(s)}
          onImageZoom={(id) => setZoomImageId(id)}
        />
      )}

      {/* Modals */}
      <CreateStudentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => fetchStudents(1)}
      />

      {editStudent && (
        <EditStudentModal
          isOpen={!!editStudent}
          onClose={() => setEditStudent(null)}
          student={editStudent}
          onUpdated={() => fetchStudents(pagination.page)}
        />
      )}

      {resetPassStudent && (
        <ResetPasswordModal
          isOpen={!!resetPassStudent}
          onClose={() => setResetPassStudent(null)}
          student={resetPassStudent}
          onReset={() => fetchStudents(pagination.page)}
        />
      )}

      {toggleStudent && (
        <ConfirmationModal
          isOpen={!!toggleStudent}
          onClose={() => setToggleStudent(null)}
          onConfirm={handleToggleStatusConfirm}
          title={
            toggleStudent.status === 'active'
              ? 'Deactivate Student Account?'
              : 'Activate Student Account?'
          }
          message={`Are you sure you want to ${
            toggleStudent.status === 'active' ? 'deactivate' : 'reactivate'
          } ${toggleStudent.name} (${toggleStudent.registerNumber})? ${
            toggleStudent.status === 'active'
              ? 'The student will not be able to log in or submit tasks while deactivated.'
              : 'The student will regain full access to their dashboard and tasks.'
          }`}
          confirmText={toggleStudent.status === 'active' ? 'Deactivate' : 'Activate'}
          danger={toggleStudent.status === 'active'}
          loading={togglingLoading}
        />
      )}

      {deleteStudentTarget && (
        <ConfirmationModal
          isOpen={!!deleteStudentTarget}
          onClose={() => setDeleteStudentTarget(null)}
          onConfirm={handleDeleteStudentConfirm}
          title={`Delete Student "${deleteStudentTarget.name}"?`}
          message={`Are you sure you want to permanently delete student ${deleteStudentTarget.name} (${deleteStudentTarget.registerNumber}) from the database? This action will permanently remove all their task assignments and submissions.`}
          confirmText="Delete Student"
          danger={true}
          loading={deleteLoading}
        />
      )}

      <ImageModal
        isOpen={!!zoomImageId}
        onClose={() => setZoomImageId(null)}
        imgSrc={zoomImageId ? `/api/v1/files/${zoomImageId}` : null}
      />
    </div>
  );
};

