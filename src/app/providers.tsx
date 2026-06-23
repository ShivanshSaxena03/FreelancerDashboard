'use client';

import { ReactNode, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('Freelancer OS SW registered successfully:', registration.scope);
        },
        (error) => {
          console.error('Freelancer OS SW registration failed:', error);
        }
      );
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Stash the event so it can be triggered later
      (window as any).deferredPrompt = e;
      // Dispatch a custom event so UI components can render the install button
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
