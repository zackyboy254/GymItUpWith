'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogIn, Lock, Mail, Dumbbell, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (session) {
          router.replace('/admin/dashboard');
        }
      } catch (err) {
        console.warn('Admin session check failed:', err);
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your admin email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!signInData.session) {
        throw new Error('Authentication completed but no session was returned.');
      }

      router.replace('/admin/dashboard');
    } catch (err: unknown) {
       console.error('Login error:', err);
       const message = err && typeof err === 'object' && 'message' in err ? (err as any).message : 'Authentication failed. Please verify credentials.';
       setError(message as string);
     } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address to request a password reset.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResetSent(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (resetError) throw resetError;
      setResetSent(true);
    } catch (err: unknown) {
       console.error('Reset error:', err);
       const message = err && typeof err === 'object' && 'message' in err ? (err as any).message : 'Failed to send reset link.';
       setError(message as string);
     } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0c] overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FC6129]/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-[#121214] to-[#0a0a0c] space-y-8 shadow-2xl">
        {/* Logo & title */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FC6129] to-[#ff2a2a] flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <Dumbbell className="w-6 h-6 text-white transform -rotate-45" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Admin CMS Login</h1>
          <p className="text-gray-400 text-xs">
            Enter credentials to manage Gym It Up With content.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Password reset link has been dispatched to your email inbox.</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gymitupwith.co.ke"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FC6129] transition-colors"
                required
              />
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[10px] text-[#0077ff] hover:text-[#00e5ff] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FC6129] transition-colors"
                required
              />
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center px-5 py-3.5 font-bold text-white bg-gradient-to-r from-[#FC6129] to-[#ff2a2a] hover:from-[#ff2a2a] hover:to-[#FC6129] rounded-xl shadow-lg shadow-orange-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:bg-white/5 disabled:text-gray-500"
          >
            {isLoading ? (
              'Authenticating...'
            ) : (
              <>
                Sign In
                <LogIn className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
