'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, ArrowRight, UserPlus, Eye, Users, FileSignature, Receipt, GraduationCap, Box, CheckSquare, Settings, ChevronRight } from 'lucide-react';


interface Stats {
  clients: number;
  quotations: number;
  agreements: number;
  invoices: number;
  handovers: number;
}

interface Client {
  id: number;
  name: string;
  company_name: string;
  email: string;
  project_type: string;
}

interface Document {
  id: number;
  document_id: string;
  type: string;
  title: string;
  status: string;
  updated_at: string;
  client_name: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({ clients: 0, quotations: 0, agreements: 0, invoices: 0, handovers: 0 });
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Run schema init silently on page load to confirm schemas are created
        await fetch('/api/init');

        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success) {
          setStats(json.stats);
          setRecentClients(json.recentClients || []);
          setRecentDocs(json.recentDocuments || []);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-10 w-48 bg-neutral-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Quotations', count: stats.quotations, icon: FileText, color: 'text-neutral-900' },
    { name: 'Total Agreements', count: stats.agreements, icon: FileSignature, color: 'text-neutral-900' },
    { name: 'Total Invoices', count: stats.invoices, icon: Receipt, color: 'text-neutral-900' },
    { name: 'Total Handovers', count: stats.handovers, icon: CheckSquare, color: 'text-neutral-900' },
  ];

  const quickActions = [
    { name: 'New Quotation', href: '/dashboard/documents?new=quotation', icon: FileText },
    { name: 'New Agreement', href: '/dashboard/documents?new=agreement', icon: FileSignature },
    { name: 'New Invoice', href: '/dashboard/documents?new=invoice', icon: Receipt },
    { name: 'New Requirement Form', href: '/dashboard/documents?new=requirement', icon: Box },
    { name: 'New Handover Doc', href: '/dashboard/documents?new=handover', icon: CheckSquare },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-950">Workspace Overview</h2>
          <p className="text-xs text-neutral-500 mt-1">Real-time tracker for client documents, metrics and workflows.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/clients?action=new"
            className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded text-xs font-semibold hover:bg-neutral-50 bg-white transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Client
          </Link>
          <Link
            href="/dashboard/documents?new=quotation"
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-900 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Document
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white border border-neutral-200 p-5 rounded relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">{stat.name}</span>
                <Icon className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-neutral-900 mt-2">{stat.count}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-neutral-200 rounded p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className="flex flex-col items-center justify-center p-4 border border-neutral-100 rounded hover:border-neutral-900 bg-neutral-50 hover:bg-white transition-all text-center group"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center mb-2.5 group-hover:bg-black group-hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-neutral-800">{action.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Client List */}
        <div className="bg-white border border-neutral-200 rounded p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Recent Clients</h3>
              <Link href="/dashboard/clients" className="text-[11px] font-semibold flex items-center gap-1 text-neutral-900 hover:underline">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentClients.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">No client profiles configured yet.</div>
            ) : (
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex justify-between items-start text-xs border-b border-neutral-50 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 truncate">{client.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{client.company_name || 'Individual'}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-neutral-100 font-medium rounded capitalize">{client.project_type || 'General'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents Table */}
        <div className="bg-white border border-neutral-200 rounded p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Recent Activity & Documents</h3>
            <Link href="/dashboard/documents" className="text-[11px] font-semibold flex items-center gap-1 text-neutral-900 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">No documents generated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-neutral-400 font-semibold border-b border-neutral-100 pb-2">
                    <th className="py-2">Doc ID</th>
                    <th className="py-2">Client</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 font-mono font-medium">{doc.document_id}</td>
                      <td className="py-2.5 font-bold">{doc.client_name || 'N/A'}</td>
                      <td className="py-2.5 capitalize text-[11px] text-neutral-500">{doc.type}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${
                          doc.status === 'paid' || doc.status === 'approved'
                            ? 'bg-neutral-900 text-white'
                            : doc.status === 'pending'
                            ? 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                            : 'bg-neutral-50 text-neutral-500'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/dashboard/documents?edit=${doc.document_id}`}
                          className="inline-flex items-center gap-1 text-neutral-950 font-bold hover:underline"
                        >
                          Open <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
