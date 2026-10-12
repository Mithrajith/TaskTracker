import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import apiClient from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Lock, AlertCircle, ShieldAlert } from 'lucide-react';

export const ResetPasswordModal = ({ isOpen, onClose, student, onReset }) => {
  const { success, error } = useToast();
  const [newPassword, setNewPassword] = useState('TempResetPass123!');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newPassword || newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post(`/students/${student._id}/reset-password`, {
        newPassword,
      });

      if (res.data?.success) {
        success(res.data.message || 'Password reset successfully');
        onClose();
        if (onReset) onReset();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Student Password"
      subtitle={`Set temporary login credentials for ${student.name} (${student.registerNumber})`}
      maxWidth="max-w-md"
    >
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          Existing passwords cannot be retrieved for security. After resetting, the student will be forced to change this temporary password immediately upon next login.
        </span>
      </div>

      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            New Temporary Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Resetting...' : 'Set & Force Change'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

