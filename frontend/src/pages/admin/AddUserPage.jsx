import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { PasswordInput } from '../../components/common/PasswordInput';
import { useToast } from '../../context/ToastContext';
import { Github } from '../../components/common/Icons';
import {
  User,
  Hash,
  Lock,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const AddUserPage = () => {
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [role, setRole] = useState('student');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  const resetForm = () => {
    setName('');
    setRegisterNumber('');
    setGithubRepoUrl('');
    setInitialPassword('');
    setRole('student');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setCreatedUser(null);

    if (!name.trim() || !registerNumber.trim() || !initialPassword) {
      setFormError('Name, register number, and initial password are required');
      return;
    }
    if (initialPassword.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/users', {
        name: name.trim(),
        registerNumber: registerNumber.trim().toUpperCase(),
        role,
        githubRepoUrl: role === 'student' ? githubRepoUrl.trim() : '',
        initialPassword,
      });

      if (res.data?.success) {
        success(res.data.message || 'User created successfully');
        setCreatedUser(res.data.data);
        resetForm();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create user';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#064E45] tracking-tight flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-[#2D806B]" />
            <span>Add User</span>
          </h1>
          <p className="text-sm text-[#71817B] mt-1">
            Create a new student or admin account. They will be asked to set their own password on
            first login.
          </p>
        </div>
        <Link
          to="/admin/students"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EAF7EF] text-[#064E45] font-bold text-xs border border-[#DDE8DF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </div>

      {createdUser && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#EAF7EF] border border-[#CDE5D6] text-[#064E45] text-sm">
          <CheckCircle2 className="w-5 h-5 text-[#2D9B70] shrink-0 mt-0.5" />
          <span>
            <strong>{createdUser.name}</strong> ({createdUser.registerNumber}) was created as{' '}
            <strong>{createdUser.role === 'admin' ? 'an admin' : 'a student'}</strong>.
          </span>
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <Card className="bg-white">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-[#064E45] mb-2">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'student'
                    ? 'border-[#2D806B] bg-[#EAF7EF]'
                    : 'border-[#DDE8DF] bg-[#FAF8F0] hover:border-[#CDE5D6]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    role === 'student' ? 'bg-[#064E45] text-white' : 'bg-white text-[#71817B]'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#064E45] block">Student</span>
                  <span className="text-[11px] text-[#71817B]">Follows the roadmap</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'admin'
                    ? 'border-[#2D806B] bg-[#EAF7EF]'
                    : 'border-[#DDE8DF] bg-[#FAF8F0] hover:border-[#CDE5D6]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    role === 'admin' ? 'bg-[#064E45] text-white' : 'bg-white text-[#71817B]'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#064E45] block">Admin</span>
                  <span className="text-[11px] text-[#71817B]">Reviews &amp; manages</span>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#064E45] mb-1.5">
                Full Name <span className="text-[#E86A5B]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D806B]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#A3B2AC] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B]"
                />
              </div>
            </div>

            {/* Register number */}
            <div>
              <label className="block text-xs font-bold text-[#064E45] mb-1.5">
                Register / Employee ID <span className="text-[#E86A5B]">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D806B]" />
                <input
                  type="text"
                  required
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="e.g. STU-1001"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#A3B2AC] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B]"
                />
              </div>
              <span className="text-[11px] text-[#71817B] mt-1 block">
                Used as the login ID and must be unique.
              </span>
            </div>
          </div>

          {/* GitHub (students only) */}
          {role === 'student' && (
            <div>
              <label className="block text-xs font-bold text-[#064E45] mb-1.5">
                GitHub Repository URL{' '}
                <span className="text-[#71817B] font-medium">(optional)</span>
              </label>
              <div className="relative">
                <Github className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D806B]" />
                <input
                  type="url"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#A3B2AC] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B]"
                />
              </div>
              <span className="text-[11px] text-[#71817B] mt-1 block">
                Leave blank if unknown — the student can add it later from their profile.
              </span>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#064E45] mb-1.5">
              Initial Temporary Password <span className="text-[#E86A5B]">*</span>
            </label>
            <PasswordInput
              leftIcon={Lock}
              iconClassName="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D806B]"
              required
              minLength={6}
              value={initialPassword}
              onChange={(e) => setInitialPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              className="w-full pl-9 pr-10 py-2.5 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#A3B2AC] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B] font-mono"
            />
            <span className="text-[11px] text-[#D88918] mt-1 block">
              The user will be required to change this password on first login.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDE8DF]">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#085f54] transition-all flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
