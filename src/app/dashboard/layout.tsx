'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, LogOut, ChevronRight, Menu, X, Plus, Award } from 'lucide-react';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import SessionTimer from './components/SessionTimer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Force redirect admin to /dashboard/admin if they try to access other dashboard pages
    if (status === 'authenticated' && isAdmin && pathname !== '/dashboard/admin') {
      router.replace('/dashboard/admin');
    }
  }, [status, isAdmin, pathname, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest text-neutral-400">Loading Operating System...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // Filter navigation items: Admins only get Admin Controls, standard users get normal navigation.
  const navigation = isAdmin
    ? [{ name: 'Admin Controls', href: '/dashboard/admin', icon: Award }]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Clients', href: '/dashboard/clients', icon: Users },
        { name: 'Documents', href: '/dashboard/documents', icon: FileText },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];



  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 p-6 shrink-0 justify-between">
        <div>
          {/* Logo Branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold font-mono">F</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Freelancer OS</h1>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Document Automator</p>
            </div>
          </div>

          {/* Absolute Session Timer Block */}
          <div className="mb-6">
            <SessionTimer />
          </div>

          {/* Nav Items */}

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-100 text-black font-semibold'
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-neutral-100 pt-6">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold uppercase">
              {session.user?.name ? session.user.name.charAt(0) : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-900 truncate">{session.user?.name}</p>
              <p className="text-[10px] text-neutral-400 truncate">{session.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded text-xs font-medium text-neutral-500 hover:text-black hover:bg-neutral-50 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold font-mono">F</span>
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight">Freelancer OS</h1>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-neutral-500 hover:text-black focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold font-mono">F</span>
                </div>
                <h1 className="text-xs font-bold tracking-tight">Freelancer OS</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-neutral-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded text-sm font-medium transition-all ${
                      isActive ? 'bg-neutral-100 text-black font-semibold' : 'text-neutral-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-neutral-100 pt-6">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-bold uppercase">
                {session.user?.name ? session.user.name.charAt(0) : 'A'}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{session.user?.name}</p>
                <p className="text-xs text-neutral-400">{session.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 w-full px-4 py-3 rounded text-sm font-medium text-neutral-500 hover:text-black hover:bg-neutral-50 transition-all text-left"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
