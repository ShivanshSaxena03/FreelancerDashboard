'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Users, FileText, Activity, ShieldAlert, Award, Trash, X } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

interface Metric {
  total_users: string;
  total_clients: string;
  total_documents: string;
  total_logins: string;
}

interface UserActivity {
  email: string;
  name: string;
  registered_at: string;
  clients_count: string;
  documents_count: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete User Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [removalReason, setRemovalReason] = useState('');
  const [removalError, setRemovalError] = useState('');

  // Add User Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const loadMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const json = await res.json();
      if (json.success) {
        setMetrics(json.metrics);
        setActivities(json.activities);
      } else {
        setError(json.error || 'Failed to authorize.');
      }
    } catch (err) {
      setError('Network failure compiling administration metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      const user = session.user as any;
      if (user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
    loadMetrics();
  }, [session, router]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');

    try {
      setLoading(true);
      const res = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAddSuccess('User account generated successfully.');
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        loadMetrics();
        setTimeout(() => {
          setAddModalOpen(false);
          setAddSuccess('');
        }, 1500);
      } else {
        setAddError(json.error || 'Failed to create user account.');
      }
    } catch (err) {
      setAddError('Database connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!removalReason.trim()) {
      setRemovalError('A reason for account deactivation must be provided.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userToDelete, reason: removalReason }),
      });

      const json = await res.json();
      if (json.success) {
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
        setRemovalReason('');
        loadMetrics();
      } else {
        setRemovalError(json.error || 'Failed to remove user.');
      }
    } catch (err) {
      setRemovalError('Failed to connect to system API.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return <div className="text-xs uppercase tracking-widest text-neutral-400">Loading System Metrics...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 border border-red-200 rounded text-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-black" />
            <h2 className="text-xl font-bold tracking-tight">System Controls & Metrics</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Platform management overview, active user audits, and resource distributions.</p>
        </div>
        <button
          onClick={() => {
            setAddError('');
            setAddSuccess('');
            setAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-900 transition-all cursor-pointer"
        >
          Add User
        </button>
      </div>

      {/* Admin Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 p-5 rounded">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest">Total Registrations</span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{metrics.total_users}</p>
          </div>

          <div className="bg-white border border-neutral-200 p-5 rounded">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest">System Clients</span>
              <Users className="w-4 h-4 text-neutral-300" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{metrics.total_clients}</p>
          </div>

          <div className="bg-white border border-neutral-200 p-5 rounded">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest">Documents Built</span>
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{metrics.total_documents}</p>
          </div>

          <div className="bg-white border border-neutral-200 p-5 rounded">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest">Total Session Logs</span>
              <Activity className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{metrics.total_logins}</p>
          </div>
        </div>
      )}

      {/* User Performance Audit */}
      <div className="bg-white border border-neutral-200 rounded p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">User Performance Distributions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Registered At</th>
                <th className="px-4 py-2.5 text-center">Clients Created</th>
                <th className="px-4 py-2.5 text-center">Documents Compiled</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {activities.map((act) => (
                <tr key={act.email} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-bold">{act.name || 'Anonymous User'}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-neutral-600">{act.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(act.registered_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center font-semibold text-neutral-800">{act.clients_count}</td>
                  <td className="px-4 py-3 text-center font-semibold text-neutral-800">{act.documents_count}</td>
                  <td className="px-4 py-3 text-right">
                    {act.email !== 'shivanshsaxena03102006@gmail.com' ? (
                      <button
                        onClick={() => {
                          setUserToDelete(act.email);
                          setRemovalError('');
                          setDeleteConfirmOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold border border-red-100 text-red-600 rounded bg-white hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" /> Remove User
                      </button>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">System Root</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Deactivation Reason Dialog Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 w-full max-w-md rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Deactivate User Account
              </h3>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setUserToDelete(null);
                  setRemovalReason('');
                }}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {removalError && (
                <div className="bg-red-50 border-l-2 border-red-500 p-3 text-xs text-red-800 font-medium">
                  {removalError}
                </div>
              )}
              <p className="text-xs text-neutral-500">
                You are about to remove user <strong className="text-neutral-900">{userToDelete}</strong>. Deactivating this profile will cascade delete all corresponding document builds.
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Reason for Account Removal *
                </label>
                <textarea
                  required
                  placeholder="Provide a detailed explanation of account deactivation..."
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-neutral-200 rounded text-xs bg-white text-black resize-none focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setUserToDelete(null);
                    setRemovalReason('');
                  }}
                  className="px-3 py-1.5 border border-neutral-200 rounded text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                >
                  Deactivate User Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add User Account Dialog Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 w-full max-w-md rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Register New User
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserPassword('');
                  setAddError('');
                  setAddSuccess('');
                }}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {addError && (
                <div className="bg-red-50 border-l-2 border-red-500 p-3 text-xs text-red-800 font-medium">
                  {addError}
                </div>
              )}
              {addSuccess && (
                <div className="bg-emerald-50 border-l-2 border-emerald-500 p-3 text-xs text-emerald-800 font-medium">
                  {addSuccess}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="block w-full px-3 py-2 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                  >
                    {showNewUserPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setNewUserName('');
                    setNewUserEmail('');
                    setNewUserPassword('');
                    setAddError('');
                    setAddSuccess('');
                  }}
                  className="px-3 py-1.5 border border-neutral-200 rounded text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-900"
                >
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
