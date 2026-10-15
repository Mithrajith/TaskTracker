import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import {
  Lock,
  KeyRound,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Github } from '../components/common/Icons';

const fieldClass =
  'w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B] transition-colors';

export const ProfilePage = () => {
  const { user, changePassword, mustChangePassword } = useAuth();
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const roleLabel = user?.role === 'admin' ? 'Mentor / Administrator' : 'AI Engineer Trainee';
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'US';

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
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#064E45]">
          Profile &amp; Settings
        </h1>
        <p className="text-sm text-[#71817B] mt-1">
          Manage your account details and login credentials.
        </p>
      </div>

      {mustChangePassword && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFF8EA] border border-[#FCE6BD] text-[#D88918] text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-[#F3B74F] shrink-0" />
          <span>
            Your account was created with a temporary password. Please set a permanent
            personal password below to continue.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <h2 className="text-base font-bold text-[#064E45] mb-5">Account Information</h2>

          <div className="flex items-center gap-4 pb-5 border-b border-[#DDE8DF]">
            <div className="w-14 h-14 rounded-2xl bg-[#064E45] text-white flex items-center justify-center text-lg font-black shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#064E45] truncate">{user?.name}</p>
              <p className="text-xs text-[#2D806B] font-semibold">{roleLabel}</p>
            </div>
          </div>

          <dl className="divide-y divide-[#DDE8DF]">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-xs font-semibold text-[#71817B]">Register Number</dt>
              <dd className="text-xs font-bold text-[#172E2A] font-mono">
                {user?.registerNumber || '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-xs font-semibold text-[#71817B]">Account Status</dt>
              <dd className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D9B70]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active
              </dd>
            </div>
            {user?.githubRepoUrl && (
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-xs font-semibold text-[#71817B]">GitHub Repository</dt>
                <dd>
                  <a
                    href={user.githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#064E45] hover:text-[#2D806B] transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repo</span>
                    <ExternalLink className="w-3 h-3 text-[#71817B]" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Change Password */}
        <Card>
          <h2 className="text-base font-bold text-[#064E45] mb-1">
            {mustChangePassword ? 'Set New Password' : 'Change Password'}
          </h2>
          <p className="text-xs text-[#71817B] mb-5">
            {mustChangePassword
              ? 'Choose a strong personal password to secure your account.'
              : 'Update your account login password.'}
          </p>

          {formError && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs">
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
                  <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-[#71817B]" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={fieldClass}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#064E45] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#71817B]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#064E45] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#71817B]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#085f54] transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Updating Password...' : 'Save Password'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
