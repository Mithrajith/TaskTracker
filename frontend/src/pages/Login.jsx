import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Lock,
  Hash,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [registerNumber, setRegisterNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!registerNumber.trim() || !password) {
      setErrorMessage('Please enter both Register Number and Password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(registerNumber.trim(), password);
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

  const handleQuickFill = (regNo, pass) => {
    setRegisterNumber(regNo);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F0] text-[#172E2A] flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#FFA77E]/30 selection:text-[#064E45]">
      {/* Organic Background Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E0F3E8] rounded-full blur-3xl pointer-events-none opacity-80" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#FFF3EC] rounded-full blur-3xl pointer-events-none opacity-80" />

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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#064E45] shadow-[0_8px_20px_rgba(6,78,69,0.2)] mb-3">
            <Sparkles className="w-7 h-7 text-[#FFA77E]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#064E45]">
            Sign In to Task Tracker
          </h1>
          <p className="text-sm text-[#71817B] mt-1">
            Access your student roadmap or admin mentor dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 sm:p-8 shadow-[0_10px_35px_rgba(23,46,42,0.06)]">
          {errorMessage && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs leading-relaxed animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E86A5B]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                Register Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                <input
                  type="text"
                  required
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="e.g. ADMIN001 or AI2026001"
                  className="w-full pl-10 pr-3 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#085f54] shadow-[0_6px_18px_rgba(6,78,69,0.2)] transition-all flex items-center justify-center gap-2 mt-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 text-[#FFA77E]" />
            </button>
          </form>

          {/* Quick Demo Logins Pill Box */}
          <div className="mt-6 pt-5 border-t border-[#DDE8DF]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71817B] block mb-2.5 text-center">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN001', 'AdminPassword123!')}
                className="p-3 rounded-xl bg-[#EAF7EF] border border-[#D1E8D9] hover:border-[#2D806B] hover:bg-[#deefe4] text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#064E45]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D806B]" />
                  <span>Lead Mentor</span>
                </div>
                <div className="text-[11px] text-[#71817B] font-mono mt-0.5">
                  ADMIN001
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('AI2026001', 'StudentPassword123!')}
                className="p-3 rounded-xl bg-[#FFF3EC] border border-[#FFDFD0] hover:border-[#FFA77E] hover:bg-[#ffe7db] text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D46C38]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FFA77E]" />
                  <span>Student (Rohan)</span>
                </div>
                <div className="text-[11px] text-[#71817B] font-mono mt-0.5">
                  AI2026001
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-[#71817B] mt-6">
          Encrypted credentials with Argon2/bcrypt &amp; JWT session tokens
        </p>
      </div>
    </div>
  );
};
