'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, FileText, Layout, Play, Plus, ShieldCheck, Sparkles, Download } from 'lucide-react';
import Particles from './dashboard/components/Particles';

export default function LandingPage() {
  const { data: session } = useSession();
  const [installAvailable, setInstallAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      setInstallAvailable(true);
    }

    const handleInstallAvailable = () => {
      setInstallAvailable(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pwa-install-available', handleInstallAvailable);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pwa-install-available', handleInstallAvailable);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`User response to install: ${outcome}`);
    (window as any).deferredPrompt = null;
    setInstallAvailable(false);
  };

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden relative selection:bg-black selection:text-white">
      {/* Background grid accent decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Interactive Particles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          particleColors={["#a3a3a3", "#737373", "#d4d4d4"]}
          particleCount={100}
          particleSpread={8}
          speed={0.15}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold font-mono">F</span>
          </div>
          <span className="text-sm font-bold tracking-tight">Freelancer OS</span>
        </div>
        <div className="flex items-center gap-4">
          {installAvailable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-black text-xs font-bold rounded-full hover:bg-neutral-50 transition-all cursor-pointer bg-white"
            >
              <Download className="w-3.5 h-3.5" /> Install App
            </button>
          )}
          <Link
            href="/login"
            className="text-xs font-bold text-neutral-600 hover:text-black transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-neutral-900 transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center pt-24 pb-16 px-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full mb-6 border border-neutral-200/50">
          <Sparkles className="w-3 h-3 text-neutral-600 animate-spin" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-600">The 21st Century Freelancer Operative System</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-950 leading-[1.1] mb-6">
          Automate proposals,<br />contracts and handovers in minutes.
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed mb-8">
          A premium automation dashboard designed for independent freelancers to draft quotations, invoices, requirement forms, and handovers into agency-quality PDFs.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <Link
            href={session ? '/dashboard' : '/register'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded-full hover:bg-neutral-900 transition-all shadow-md group"
          >
            Claim Your Workspace
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          {installAvailable && (
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-black bg-black text-white hover:bg-neutral-900 text-xs font-bold rounded-full transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Install App
            </button>
          )}
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold rounded-full transition-all shadow-sm"
          >
            <Play className="w-3 h-3 text-neutral-400" />
            Live Demo SignIn
          </Link>
        </div>
      </section>

      {/* Features Grid Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="bg-white border border-neutral-200/60 p-8 rounded-2xl shadow-xs hover:border-black hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200/50 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all">
            <Layout className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2">Automated Builders</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Construct dynamic quotations, support agreements, requirement drafts, and handover manuals using client-specific parameters.
          </p>
        </div>

        <div className="bg-white border border-neutral-200/60 p-8 rounded-2xl shadow-xs hover:border-black hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200/50 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2">Premium Agency PDFs</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Export beautifully designed typography PDFs formatted with default boilerplate clauses, and custom payment milestones.
          </p>
        </div>

        <div className="bg-white border border-neutral-200/60 p-8 rounded-2xl shadow-xs hover:border-black hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200/50 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2">Complete Data Isolation</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Independent workspaces for each user account. Safe session controls and secure authentication via OTP verify pins.
          </p>
        </div>
      </section>

      {/* Modern Typographic Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-neutral-400 text-[11px] font-medium tracking-wide">
        <p>© 2026 Freelancer OS. All Rights Reserved.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <a href="#" className="hover:text-black">Privacy Policy</a>
          <a href="#" className="hover:text-black">Terms of Service</a>
          <a href="https://github.com" className="hover:text-black">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
