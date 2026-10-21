import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PasswordInput } from '../components/common/PasswordInput';
import apiClient from '../api/client';
import {
  Sparkles,
  Lock,
  Hash,
  User,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Github } from '../components/common/Icons';

export const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    name: '',
    registerNumber: '',
    githubRepoUrl: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (!form.name.trim() || !form.registerNumber.trim() || !form.password) {
      setErrorMessage('Name, register number, and password are required');
      return;
    }
    if (form.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (form.githubRepoUrl.trim()) {
      try {
        const parsed = new URL(form.githubRepoUrl.trim());
        const isGithub = /(^|\.)github\.com$/i.test(parsed.hostname);
        if (!isGithub) throw new Error('Not GitHub');
      } catch {
        setErrorMessage('GitHub URL must be a valid github.com link');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', {
        name: form.name.trim(),
        registerNumber: form.registerNumber.trim(),
        githubRepoUrl: form.githubRepoUrl.trim(),
        password: form.password,
      });

      if (res.data.success) {
        // Auto-login: store token the same way AuthContext does
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        // Reload context via login — use stored credentials
        success(`Welcome, ${userData.name}! Your account has been created.`);
        navigate('/student');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Registration failed';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-3 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45] transition-all';

  return (
    <div className="min-h-screen bg-[#FAF8F0] text-[#172E2A] flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#064E45]/20 selection:text-[#064E45]">
      {/* Organic Background Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E0F3E8] rounded-full blur-3xl pointer-events-none opacity-80" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#EAF7EF] rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Back to Login Link */}
      <div className="w-full max-w-md mb-4 relative z-10 flex justify-start">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71817B] hover:text-[#064E45] px-3 py-1.5 rounded-full hover:bg-[#EAF7EF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#064E45] mb-3 shadow-sm">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#064E45]">
            Create your account
          </h1>
          <p className="mt-1 text-xs text-[#71817B]">
            Join the AI Engineer Task Tracker
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 sm:p-8 shadow-sm">
          {errorMessage && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs leading-relaxed animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E86A5B]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Register Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                Register Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                <input
                  type="text"
                  name="registerNumber"
                  required
                  value={form.registerNumber}
                  onChange={handleChange}
                  placeholder="e.g. AI2026001"
                  className={`${inputClass} uppercase tracking-wider font-mono`}
                />
              </div>
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                GitHub Profile / Repo URL{' '}
                <span className="normal-case font-normal text-[#71817B]">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <Github className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                <input
                  type="url"
                  name="githubRepoUrl"
                  value={form.githubRepoUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                Password
              </label>
              <div className="relative">
                <PasswordInput
                  leftIcon={Lock}
                  iconClassName="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45] transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <PasswordInput
                  leftIcon={Lock}
                  iconClassName="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]"
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm placeholder-[#71817B]/60 focus:outline-none focus:ring-2 transition-all border ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'bg-[#FFF0ED] border-[#FAD3CC] text-[#E86A5B] focus:ring-[#E86A5B]/30'
                      : form.confirmPassword && form.password === form.confirmPassword
                      ? 'bg-[#F0FFF6] border-[#A7E3C0] text-[#172E2A] focus:ring-[#2D9B70]/30'
                      : 'bg-[#FAF8F0] border-[#DDE8DF] text-[#172E2A] focus:ring-[#064E45]/20 focus:border-[#064E45]'
                  }`}
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-3.5 text-[#2D9B70] pointer-events-none" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#053d36] transition-all flex items-center justify-center gap-2 mt-2 shadow-sm ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{loading ? 'Creating account…' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#71817B]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#064E45] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

