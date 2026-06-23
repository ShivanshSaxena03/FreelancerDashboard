'use client';

import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white border border-neutral-200 p-10 rounded-2xl shadow-sm space-y-6">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <WifiOff className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">You are offline</h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Freelancer OS is unable to connect to the server. Please check your internet connection and try reloading the page.
          </p>
        </div>
        <div>
          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-900 transition-all shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}
