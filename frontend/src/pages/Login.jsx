import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PasswordInput } from '../components/common/PasswordInput';
import { Github } from '../components/common/Icons';
import {
  Sparkles,
  Lock,
  Hash,
  User,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const Login = ({ initialTab = 'signin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { success, error } = useToast();

  // Determine active tab based on prop or route
  const isSignupRoute =
    location.pathname === '/signup' || location.pathname === '/register' || initialTab === 'signup';
  const [activeTab, setActiveTab] = useState(isSignupRoute ? 'signup' : 'signin');

  useEffect(() => {
    if (location.pathname === '/signup' || location.pathname === '/register') {
      setActiveTab('signup');
    } else if (location.pathname === '/login') {
      setActiveTab('signin');
    }
  }, [location.pathname]);

  // Sign In form state
  const [signInReg, setSignInReg] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up form state
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    registerNumber: '',
    githubId: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    // Optionally update URL smoothly without reload
    if (tab === 'signup') {
      window.history.replaceState(null, '', '/signup');
    } else {
      window.history.replaceState(null, '', '/login');
    }
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signInReg.trim() || !signInPassword) {
      setErrorMessage('Please enter both Register Number and Password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(signInReg.trim(), signInPassword);
      success(`Welcome back, ${user.name}!`);

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signUpForm.name.trim() || !signUpForm.registerNumber.trim() || !signUpForm.password) {
      setErrorMessage('Name, register number, and password are required');
      return;
    }

    if (signUpForm.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Normalize github ID or URL
    let cleanGithub = signUpForm.githubId.trim();
    if (cleanGithub) {
      if (!cleanGithub.startsWith('http://') && !cleanGithub.startsWith('https://')) {
        cleanGithub = `https://github.com/${cleanGithub.replace(/^@/, '').replace(/^github\.com\//, '')}`;
      }
      try {
        const parsed = new URL(cleanGithub);
        if (!/(^|\.)github\.com$/i.test(parsed.hostname)) {
          setErrorMessage('Please provide a valid GitHub username or repository link');
          return;
        }
      } catch {
        setErrorMessage('Please enter a valid GitHub username or repository URL');
        return;
      }
    }

    setLoading(true);
    try {
      const user = await register({
        name: signUpForm.name.trim(),
        registerNumber: signUpForm.registerNumber.trim().toUpperCase(),
        githubRepoUrl: cleanGithub,
        password: signUpForm.password,
      });

      success(`Welcome, ${user.name}! Your account has been created.`);
      navigate('/student');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
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

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4 relative z-10 flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71817B] hover:text-[#064E45] px-3 py-1.5 rounded-full hover:bg-[#EAF7EF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#064E45] mb-3 shadow-sm">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#064E45]">
            {activeTab === 'signup' ? 'Create Student Account' : 'Sign In to Task Tracker'}
          </h1>
          <p className="mt-1 text-xs text-[#71817B]">
            {activeTab === 'signup'
              ? 'Join the AI Engineer roadmap & submit practical assignments'
              : 'AI Engineer Roadmap & Practical Assignment Portal'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 sm:p-8 shadow-sm">
          {/* Segmented Tab Switcher */}
          <div className="flex p-1 bg-[#FAF8F0] border border-[#DDE8DF] rounded-2xl mb-6 shadow-inner">
            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-[#064E45] text-white shadow-sm'
                  : 'text-[#71817B] hover:text-[#064E45]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-[#064E45] text-white shadow-sm'
                  : 'text-[#71817B] hover:text-[#064E45]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs leading-relaxed animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E86A5B]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                  Register Number
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                  <input
                    type="text"
                    required
                    value={signInReg}
                    onChange={(e) => setSignInReg(e.target.value)}
                    placeholder="Your Register ID"
                    className="w-full pl-10 pr-3 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45] transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <PasswordInput
                    leftIcon={Lock}
                    iconClassName="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#053d36] transition-all flex items-center justify-center gap-2 mt-2 shadow-sm ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <p className="mt-5 text-center text-xs text-[#71817B]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className="font-bold text-[#064E45] hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                  Full Name <span className="text-[#E86A5B]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={signUpForm.name}
                    onChange={handleSignUpChange}
                    placeholder="e.g. John Doe"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Register Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                  Register Number <span className="text-[#E86A5B]">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                  <input
                    type="text"
                    name="registerNumber"
                    required
                    value={signUpForm.registerNumber}
                    onChange={handleSignUpChange}
                    placeholder="e.g. AI2026001"
                    className={`${inputClass} uppercase tracking-wider font-mono`}
                  />
                </div>
              </div>

              {/* GitHub ID / Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                  GitHub Username or Link{' '}
                  <span className="normal-case font-normal text-[#71817B]">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                  <input
                    type="text"
                    name="githubId"
                    value={signUpForm.githubId}
                    onChange={handleSignUpChange}
                    placeholder="username or https://github.com/username"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Password with Eye Icon */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                  Password <span className="text-[#E86A5B]">*</span>
                </label>
                <div className="relative">
                  <PasswordInput
                    leftIcon={Lock}
                    iconClassName="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]"
                    name="password"
                    required
                    value={signUpForm.password}
                    onChange={handleSignUpChange}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45] transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password with Eye Icon */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                  Confirm Password <span className="text-[#E86A5B]">*</span>
                </label>
                <div className="relative">
                  <PasswordInput
                    leftIcon={Lock}
                    iconClassName="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]"
                    name="confirmPassword"
                    required
                    value={signUpForm.confirmPassword}
                    onChange={handleSignUpChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm placeholder-[#71817B]/60 focus:outline-none focus:ring-2 transition-all border ${
                      signUpForm.confirmPassword &&
                      signUpForm.password !== signUpForm.confirmPassword
                        ? 'bg-[#FFF0ED] border-[#FAD3CC] text-[#E86A5B] focus:ring-[#E86A5B]/30'
                        : signUpForm.confirmPassword &&
                          signUpForm.password === signUpForm.confirmPassword
                        ? 'bg-[#F0FFF6] border-[#A7E3C0] text-[#172E2A] focus:ring-[#2D9B70]/30'
                        : 'bg-[#FAF8F0] border-[#DDE8DF] text-[#172E2A] focus:ring-[#064E45]/20 focus:border-[#064E45]'
                    }`}
                  />
                  {signUpForm.confirmPassword &&
                    signUpForm.password === signUpForm.confirmPassword && (
                      <CheckCircle2 className="w-4 h-4 absolute right-10 top-3.5 text-[#2D9B70] pointer-events-none" />
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
                <span>{loading ? 'Creating account…' : 'Create Account & Sign In'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <p className="mt-5 text-center text-xs text-[#71817B]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signin')}
                  className="font-bold text-[#064E45] hover:underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
