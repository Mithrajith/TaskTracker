import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PasswordInput } from '../components/common/PasswordInput';
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
    <div className="min-h-screen bg-[#FAF8F0] text-[#172E2A] flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#064E45]/30 selection:text-[#064E45]">
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#064E45] mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#064E45]">
            Sign In to Task Tracker
          </h1>
    
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 sm:p-8">
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
                <PasswordInput
                  leftIcon={Lock}
                  iconClassName="w-4 h-4 absolute left-3.5 top-3.5 text-[#71817B]"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#085f54] transition-all flex items-center justify-center gap-2 mt-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Quick Demo Logins Pill Box */}
         
        </div>

      </div>
    </div>
  );
};
