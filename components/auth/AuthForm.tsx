'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
  Layers,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  const { login, signup } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  const switchMode = (newMode: 'login' | 'signup') => {
    if (newMode === mode) return;
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', newMode === 'login' ? '/login' : '/signup');
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPassword: string = 'demo123') => {
    setError(null);
    setSuccessMessage(null);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success && res.user) {
        setSuccessMessage(`Welcome back, ${res.user.name}! Opening ${res.user.role === 'admin' ? 'Admin Portal' : 'User App'}...`);
        setTimeout(() => {
          window.location.href = res.user?.role === 'admin' ? '/admin' : '/';
        }, 500);
      } else {
        setError(res.error || 'Failed to authenticate demo user.');
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred during demo login.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 4) {
        setError('Password should be at least 4 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify both fields.');
        return;
      }

      setLoading(true);
      try {
        const res = await signup(name, email, password, role);
        if (res.success && res.user) {
          setSuccessMessage(`Account created! Welcome, ${res.user.name}. Redirecting...`);
          setTimeout(() => {
            window.location.href = res.user?.role === 'admin' ? '/admin' : '/';
          }, 600);
        } else {
          setError(res.error || 'Sign up failed.');
          setLoading(false);
        }
      } catch {
        setError('An unexpected error occurred during sign up.');
        setLoading(false);
      }
    } else {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }

      setLoading(true);
      try {
        const res = await login(email, password);
        if (res.success && res.user) {
          setSuccessMessage(`Welcome back, ${res.user.name}! Redirecting...`);
          setTimeout(() => {
            window.location.href = res.user?.role === 'admin' ? '/admin' : '/';
          }, 500);
        } else {
          setError(res.error || 'Invalid credentials.');
          setLoading(false);
        }
      } catch {
        setError('Authentication error occurred.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#09090b]">
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 group mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 p-[1.5px] shadow-xl group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
            </div>
            <div className="text-left">
              <span className="font-extrabold tracking-tight text-white text-xl block leading-tight font-sans">
                AI Wardrobe
              </span>
              <span className="text-[11px] tracking-widest text-neutral-400 uppercase font-semibold">
                Suggestor Studio
              </span>
            </div>
          </Link>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Neural outfit recommendation, closet digitization, and smart style curation
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Animated Tab Switcher */}
          <div className="relative p-1 bg-neutral-950 rounded-2xl border border-neutral-800 mb-6">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-800 rounded-xl shadow-md border border-neutral-700/60 transition-transform duration-300 ease-out ${
                mode === 'login' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <div className="relative grid grid-cols-2 text-xs font-semibold text-center z-10">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2.5 rounded-xl transition-colors cursor-pointer ${
                  mode === 'login' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`py-2.5 rounded-xl transition-colors cursor-pointer ${
                  mode === 'signup' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* 2 REAL ACCOUNTS (1 ADMIN, 1 USER) */}
          <div className="mb-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant 1-Click Login</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">Password: pict@123</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. SHREYAS AUTI (ADMIN) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-400/50 transition-all flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      SuperAdmin
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Control Plane</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Shreyas Auti</h4>
                  <div className="mt-1 space-y-0.5 font-mono text-[11px] text-slate-400">
                    <p className="truncate">shreyasdeep253@gmail.com</p>
                    <p>Pass: <span className="text-slate-200">pict@123</span></p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('shreyasdeep253@gmail.com', 'pict@123')}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Sign In as Admin</span>
                </button>
              </div>

              {/* 2. ADIL DESHPANDE (USER) */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Stylist User
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">User App</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Adil Deshpande</h4>
                  <div className="mt-1 space-y-0.5 font-mono text-[11px] text-neutral-400">
                    <p className="truncate">adildeshpande05@gmail.com</p>
                    <p>Pass: <span className="text-neutral-200">pict@123</span></p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('adildeshpande05@gmail.com', 'pict@123')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                  <span>Sign In as Adil</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up only with smooth slide) */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                mode === 'signup' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  required={mode === 'signup'}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('adildeshpande05@gmail.com');
                      setPassword('pict@123');
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Auto-fill user?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password & Account Type (Sign Up only) */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                mode === 'signup' ? 'max-h-40 opacity-100 space-y-4 pt-1' : 'max-h-0 opacity-0'
              }`}
            >
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
                    required={mode === 'signup'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Register Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'user'
                        ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Stylist User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>SuperAdmin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center border-t border-neutral-800 pt-4">
            {mode === 'login' ? (
              <p className="text-xs text-neutral-400">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline-offset-2 hover:underline transition-colors"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-neutral-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline-offset-2 hover:underline transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center flex items-center justify-center gap-3 text-xs text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
          <span>AI Wardrobe Secure Session • 2 Credentials Preset</span>
        </div>
      </div>
    </div>
  );
};
