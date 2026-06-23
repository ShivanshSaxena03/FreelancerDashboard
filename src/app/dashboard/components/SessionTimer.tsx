'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Clock } from 'lucide-react';

export default function SessionTimer() {
  const { data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState<number>(3600); // 1 hour in seconds

  useEffect(() => {
    if (!session) return;

    // Track timer using localStorage to preserve state across multiple tabs or page updates
    const LOCAL_STORAGE_KEY = 'session_timer_expiry';
    const initTimer = () => {
      const storedExpiry = localStorage.getItem(LOCAL_STORAGE_KEY);
      const now = Date.now();

      if (storedExpiry) {
        const remaining = Math.max(0, Math.floor((parseInt(storedExpiry) - now) / 1000));
        if (remaining <= 0) {
          handleTimeout();
          return 3600;
        }
        return remaining;
      } else {
        const expiryTime = now + 60 * 60 * 1000; // 1 hour ahead
        localStorage.setItem(LOCAL_STORAGE_KEY, expiryTime.toString());
        return 3600;
      }
    };

    const handleTimeout = () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      signOut({ callbackUrl: '/login?reason=timeout' });
    };

    // Initialize timer
    setTimeLeft(initTimer());

    // Interval to calculate remaining time relative to the absolute expiry timestamp
    const interval = setInterval(() => {
      const storedExpiry = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedExpiry) return;

      const remaining = Math.max(0, Math.floor((parseInt(storedExpiry) - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleTimeout();
      }
    }, 1000);

    // Synchronize tab visibility changes dynamically
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const storedExpiry = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedExpiry) {
          const remaining = Math.max(0, Math.floor((parseInt(storedExpiry) - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining <= 0) {
            handleTimeout();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  if (!session) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 bg-white rounded text-xs font-mono font-bold text-neutral-800 shrink-0">
      <Clock className="w-3.5 h-3.5 text-neutral-400 animate-pulse" />
      <span>Session Expires: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}
