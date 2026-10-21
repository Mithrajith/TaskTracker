import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PasswordInput } from '../components/common/PasswordInput';
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
  'w-full pl-9 pr-10 py-2.5 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45] transition-colors';

export const ProfilePage = () => {
  const { user, changePassword, updateProfile, mustChangePassword, needsGithubSetup } = useAuth();
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [githubRepoUrl, setGithubRepoUrl] = useState(user?.githubRepoUrl || '');
  const [githubError, setGithubError] = useState('');
  const [savingGithub, setSavingGithub] = useState(false);

  const roleLabel = user?.role === 'admin' ? 'Mentor / Administrator' : 'AI Engineer Trainee';
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'US';
  const isStudent = user?.role === 'student';
  const showSetupNotice = mustChangePassword || needsGithubSetup;

  const handlePasswordSubmit = async (e) => {
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

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    setGithubError('');

    const clean = githubRepoUrl.trim();

    if (!clean) {
      if (isStudent) {
        setGithubError('GitHub repository link is required');
        return;
      }
      setGithubError('Please provide a GitHub repository URL');
      return;
    }

    if (!/^https?:\/\/(www\.)?github\.com\/.+/i.test(clean)) {
      setGithubError('Enter a valid link, e.g. https://github.com/username/repo');
      return;
    }

    setSavingGithub(true);
    try {
      await updateProfile({ githubRepoUrl: clean });
      success('GitHub repository saved!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setGithubError(msg);
      error(msg);
    } finally {
      setSavingGithub(false);
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

      {showSetupNotice && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFF8EA] border border-[#FCE6BD] text-[#F3B74F] text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-[#F3B74F] shrink-0" />
          <span className="text-[#172E2A]">
            Your account was created with a temporary password.
            {needsGithubSetup
              ? ' Please set a permanent password and add your GitHub repository link below to continue.'
              : ' Please set a permanent personal password below to continue.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          {/* Account Information */}
          <Card className="border-[#DDE8DF] shadow-sm">
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
            </dl>
          </Card>

          {/* GitHub Repository */}
          <Card className="border-[#DDE8DF] shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h2 className="text-base font-bold text-[#064E45]">GitHub Repository</h2>
              {needsGithubSetup && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F3B74F] bg-[#FFF8EA] border border-[#FCE6BD] px-2 py-0.5 rounded">
                  Required
                </span>
              )}
            </div>
            <p className="text-xs text-[#71817B] mb-4">
              {isStudent
                ? 'Link the repository where you push your daily task work.'
                : 'Your public GitHub profile or repository.'}
            </p>

            {githubError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#E86A5B]" />
                <span>{githubError}</span>
              </div>
            )}

            <form onSubmit={handleGithubSubmit} className="space-y-3">
              <div className="relative">
                <Github className="w-4 h-4 absolute left-3 top-3.5 text-[#71817B]" />
                <input
                  type="url"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className={fieldClass}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                {user?.githubRepoUrl ? (
                  <a
                    href={user.githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#064E45] hover:underline transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Open current repository</span>
                    <ExternalLink className="w-3 h-3 text-[#71817B]" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#71817B] italic">Not set yet</span>
                )}

                <button
                  type="submit"
                  disabled={savingGithub}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#053d36] transition-colors ${
                    savingGithub ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {savingGithub ? 'Saving...' : 'Save Link'}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Change Password */}
        <Card className="border-[#DDE8DF] shadow-sm">
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

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {!mustChangePassword && (
              <div>
                <label className="block text-xs font-bold text-[#064E45] mb-1.5">
                  Current Password
                </label>
                <PasswordInput
                  leftIcon={KeyRound}
                  iconClassName="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71817B]"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className={fieldClass}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#064E45] mb-1.5">
                New Password
              </label>
              <PasswordInput
                leftIcon={Lock}
                iconClassName="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71817B]"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#064E45] mb-1.5">
                Confirm New Password
              </label>
              <PasswordInput
                leftIcon={Lock}
                iconClassName="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71817B]"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className={fieldClass}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#053d36] transition-colors ${
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
