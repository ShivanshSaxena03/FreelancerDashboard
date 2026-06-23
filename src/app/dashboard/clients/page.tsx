'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, CheckCircle2, X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ConfirmModal from '../components/ConfirmModal';

interface Client {

  id: number;
  name: string;
  company_name: string;
  contact_number: string;
  email: string;
  address: string;
  project_type: string;
  project_description: string;
  created_at: string;
}

export default function ClientsModule() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Custom ConfirmModal States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      const user = session.user as any;
      if (user?.role === 'admin') {
        router.replace('/dashboard/admin');
        return;
      }
    }
    fetchClients();
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }
  }, [searchParams, session, router]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setName('');
    setCompanyName('');
    setContactNumber('');
    setEmail('');
    setAddress('');
    setProjectType('');
    setProjectDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompanyName(client.company_name || '');
    setContactNumber(client.contact_number || '');
    setEmail(client.email);
    setAddress(client.address || '');
    setProjectType(client.project_type || '');
    setProjectDescription(client.project_description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      company_name: companyName,
      contact_number: contactNumber,
      email,
      address,
      project_type: projectType,
      project_description: projectDescription,
    };

    try {
      let res;
      if (editingClient) {
        // Edit flow (updates aren't complex, we can use client patch endpoint if built, otherwise reuse save client POST)
        res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingClient.id }),
        });
      } else {
        res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        fetchClients();
        router.replace('/dashboard/clients');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company_name && c.company_name.toLowerCase().includes(search.toLowerCase())) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Clients Portfolio</h2>
          <p className="text-xs text-neutral-500 mt-1">Manage and save client directory for automated proposal generation.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-900 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search by client name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-9 pr-3 py-2 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black transition-all"
        />
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-neutral-100 rounded"></div>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded bg-white text-xs text-neutral-400">
          No clients found match your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white border border-neutral-200 p-5 rounded flex flex-col justify-between hover:border-black transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{client.name}</h3>
                    <p className="text-[11px] text-neutral-400 font-medium">{client.company_name || 'Individual Client'}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-neutral-100 font-semibold rounded text-neutral-600">
                    {client.project_type || 'Custom'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-neutral-500 border-t border-neutral-50 pt-2">
                  <p className="truncate"><strong>Email:</strong> {client.email}</p>
                  <p><strong>Phone:</strong> {client.contact_number || 'N/A'}</p>
                  <p className="line-clamp-2"><strong>Scope:</strong> {client.project_description || 'N/A'}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => {
                    setClientToDelete(client.id);
                    setDeleteConfirmOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold border border-red-100 text-red-600 rounded hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
                <button
                  onClick={() => handleOpenEdit(client)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold border border-neutral-200 rounded hover:bg-neutral-50 transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>


            </div>
          ))}
        </div>
      )}

      {/* Modal - Create/Edit Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 w-full max-w-lg rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                {editingClient ? 'Edit Client Profile' : 'New Client Profile'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Physical Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Project Type (e.g., Website Dev, SEO)
                  </label>
                  <input
                    type="text"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder="e.g. Website Development"
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Project Description / Context
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-200 rounded text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-900"
                >
                  {editingClient ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Client Profile"
        message="Are you sure you want to delete this client profile? This action will remove all project parameters and cannot be undone."
        confirmLabel="Delete Profile"
        cancelLabel="Keep Profile"
        type="danger"
        onConfirm={async () => {
          if (clientToDelete) {
            try {
              const res = await fetch(`/api/clients?id=${clientToDelete}`, { method: 'DELETE' });
              const json = await res.json();
              if (json.success) fetchClients();
            } catch (err) {
              console.error(err);
            } finally {
              setDeleteConfirmOpen(false);
              setClientToDelete(null);
            }
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setClientToDelete(null);
        }}
      />

    </div>
  );
}
