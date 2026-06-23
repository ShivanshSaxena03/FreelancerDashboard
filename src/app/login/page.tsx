'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

import Link from 'next/link';

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);


  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }

    const reason = searchParams.get('reason');
    if (reason === 'timeout') {
      setError('Your admin session has expired due to 1 hour inactivity. Please log in again.');
      localStorage.removeItem('session_timer_expiry');
    }
  }, [status, router, searchParams]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type: 'login' }),
      });

      const json = await res.json();
      if (json.success) {
        setShowOtpScreen(true);
      } else {
        setError(json.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failure. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        otp,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected validation error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white py-8 px-4 border border-neutral-200 sm:rounded sm:px-10">
        {error && (
          <div className="bg-neutral-50 border-l-2 border-black p-3 flex gap-2 items-center text-xs text-neutral-800 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 text-black" />
            <span>{error}</span>
          </div>
        )}

        {!showOtpScreen ? (
          <form className="space-y-5" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shivanshsaxena03102006@gmail.com"
                  className="block w-full pl-9 pr-3 py-2 border border-neutral-200 rounded text-xs bg-white text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2 border border-neutral-200 rounded text-xs bg-white text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>


            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded text-xs font-bold text-white bg-black hover:bg-neutral-900 focus:outline-none transition-all disabled:opacity-50"
              >
                {loading ? 'Sending Verification Code...' : 'Request Verification Code'}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleOtpSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                Verification Code (OTP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="block w-full pl-9 pr-3 py-2 border border-neutral-200 rounded text-xs bg-white text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-all tracking-widest font-mono text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="text-xs text-neutral-500 hover:text-black font-semibold"
              >
                Back to credentials
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded text-xs font-bold text-white bg-black hover:bg-neutral-900 focus:outline-none transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating Verification Code...' : 'Verify & Enter Workspace'}
              </button>
            </div>
          </form>
        )}

        {process.env.NEXT_PUBLIC_ENABLE_GOOGLE === 'true' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-white px-2 text-neutral-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-neutral-200 rounded text-xs font-bold text-neutral-800 bg-white hover:bg-neutral-50 focus:outline-none transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.65 0 3.2.57 4.44 1.76l3.32-3.32C17.74 1.58 15.03 1 12 1 7.24 1 3.21 3.73 1.25 7.72l3.96 3.07C6.18 7.64 8.84 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.46-5.02 3.46-8.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.21 13.85c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.25 6.16C.45 7.78 0 9.59 0 11.5s.45 3.72 1.25 5.34l3.96-3.07z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.77-2.92c-1.1.74-2.52 1.18-4.19 1.18-3.16 0-5.82-2.6-6.79-5.75L1.25 16.66C3.21 20.65 7.24 23 12 23z"
                />
              </svg>
              Google Workspace
            </button>
          </>
        )}

      </div>

      <div className="text-center space-y-2">
        <Link href="/register" className="block text-xs font-bold text-black hover:underline">
          Don't have an account? Sign Up
        </Link>
        <Link href="/" className="block text-xs text-neutral-400 hover:text-black">
          Back to landing page
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-10 h-10 bg-black rounded flex items-center justify-center mb-4 shadow-sm">
          <span className="text-white text-base font-bold font-mono">F</span>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-neutral-900">
          Sign in to Freelancer OS
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 border border-neutral-200 sm:rounded sm:px-10 text-center text-xs text-neutral-400">
            Loading Auth Engine...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
