import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, KeyRound, AlertCircle, ShieldAlert } from 'lucide-react';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { user, changePassword, mustChangePassword } = useAuth();
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!mustChangePassword && !currentPassword) {
      setFormError('Current password is required');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      success('Password successfully changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onClose) onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  // If mandatory change, user cannot dismiss without changing
  const canClose = !mustChangePassword;

  return (
    <Modal
      isOpen={isOpen || mustChangePassword}
      onClose={canClose ? onClose : () => {}}
      title={mustChangePassword ? 'Security Notice: Set New Password' : 'Change Password'}
      subtitle={
        mustChangePassword
          ? 'First-time login: You must set a permanent secure password before accessing your tasks.'
          : 'Update your account login password'
      }
      maxWidth="max-w-md"
    >
      {mustChangePassword && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FFF8EA] border border-[#FCE6BD] text-[#D88918] text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-[#F3B74F] shrink-0" />
          <span>
            Your administrator created this account with a temporary password.
            Please choose a strong personal password to continue.
          </span>
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#E86A5B]" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!mustChangePassword && (
          <div>
            <label className="block text-xs font-bold text-[#064E45] mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-[#71817B]" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-[#71817B]" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-[#71817B]" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DDE8DF]">
          {canClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#71817B] hover:text-[#172E2A] hover:bg-[#EAF7EF] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#085f54] shadow-xs transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Updating Password...' : 'Save Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

