// frontend/src/pages/SignInPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please provide your work email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#202C25] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-[1080px] w-full mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Panel: Clean Form matching Panel 2 of Reference */}
        <div className="lg:col-span-6 bg-[#FFFFFF] rounded-3xl p-8 sm:p-12 border border-[#DCE5DA] shadow-sm flex flex-col justify-between">
          <div>
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-[#D0E3D1] border border-[#C2D8C4] flex items-center justify-center text-[#26734D] font-bold text-base">
                IT
              </div>
              <span className="font-bold text-[18px] text-[#202C25]">IndusTrace AI</span>
            </Link>

            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#202C25] tracking-tight">
              Welcome to IndusTrace AI
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#56645A] mt-1.5 mb-6">
              Sign in to your account to continue your sustainability journey.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[#FDECEC] border border-[#F5C2C2] text-[#A42D2D] text-[14px] flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                  Enter address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] placeholder-[#778279] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] placeholder-[#778279] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#778279] hover:text-[#202C25] transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[13px] pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#56645A]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#278653] focus:ring-[#278653] border-[#DCE5DA]"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-[#778279] hover:underline cursor-pointer">
                  Forgot password
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[15px] transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-[#DCE5DA] text-center text-[14px] text-[#56645A]">
            Don't have an account?{' '}
            <Link to="/create-account" className="font-semibold text-[#26734D] hover:underline">
              Create a new account
            </Link>
          </div>
        </div>

        {/* Right Panel: Industrial Image Card matching Reference */}
        <div className="hidden lg:block lg:col-span-6 relative rounded-3xl overflow-hidden border border-[#DCE5DA] shadow-md bg-[#10271E]">
          <img
            src="/images/auth-bg.jpg"
            alt="Cleaner Industries Brighter Futures"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10271E] via-[#10271E]/40 to-transparent"></div>

          <div className="absolute bottom-8 left-8 right-8 text-white space-y-4">
            <h3 className="text-[28px] font-bold leading-tight">
              Cleaner Industries,<br />Brighter Futures
            </h3>
            <ul className="space-y-2.5 text-[14px] text-white/90">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#B8E2C1]" />
                <span>Track multi-plant waste streams</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#B8E2C1]" />
                <span>Get 6-factor test recommendations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#B8E2C1]" />
                <span>Discover verified recovery opportunities</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
