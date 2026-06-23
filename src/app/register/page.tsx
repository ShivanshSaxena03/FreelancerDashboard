'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { Mail, Lock, User, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

import Link from 'next/link';

function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type: 'register' }),
      });

      const json = await res.json();
      if (json.success) {
        setShowOtpScreen(true);
        setSuccess('Verification code sent! Please check your email.');
      } else {
        setError(json.error || 'Failed to request OTP');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(json.error || 'Failed to complete registration');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-4 border border-neutral-200 sm:rounded sm:px-10">
      {error && (
        <div className="bg-neutral-50 border-l-2 border-black p-3 flex gap-2 items-center text-xs text-neutral-800 mb-5">
          <AlertCircle className="w-4 h-4 shrink-0 text-black" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-neutral-50 border-l-2 border-emerald-500 p-3 flex gap-2 items-center text-xs text-neutral-800 mb-5">
          <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {!showOtpScreen ? (
        <form className="space-y-5" onSubmit={handleRequestOtp}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="block w-full pl-9 pr-3 py-2 border border-neutral-200 rounded text-xs bg-white text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

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
                placeholder="john@example.com"
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
        <form className="space-y-5" onSubmit={handleRegisterSubmit}>
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
              Change Details
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded text-xs font-bold text-white bg-black hover:bg-neutral-900 focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? 'Completing Registration...' : 'Verify & Register'}
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
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
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
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-10 h-10 bg-black rounded flex items-center justify-center mb-4 shadow-sm">
          <span className="text-white text-base font-bold font-mono">F</span>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-neutral-900">
          Create Your Account
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-400">
          Register with email and verify code to join Freelancer OS.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 border border-neutral-200 sm:rounded sm:px-10 text-center text-xs text-neutral-400">
            Loading...
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
