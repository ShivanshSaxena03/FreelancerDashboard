'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, Eye, Filter, Edit2, Plus, Download, Trash, RefreshCw } from 'lucide-react';
import DocumentPreviewer from './DocumentPreviewer';
import ConfirmModal from '../components/ConfirmModal';

interface Client {

  id: number;
  name: string;
  company_name: string;
  email: string;
  address: string;
}

interface FreelancerSettings {
  freelancer_name: string;
  freelancer_email: string;
  phone_number: string;
  address: string;
  portfolio_link: string;
  default_revision_count: number;
  default_payment_terms: string;
  default_agreement_clauses: any;
}

export default function DocumentsDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [documents, setDocuments] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [freelancer, setFreelancer] = useState<FreelancerSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Previewer States
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Custom ConfirmModal States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  // Editor States

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [docType, setDocType] = useState<string>('quotation');
  const [docTitle, setDocTitle] = useState<string>('');
  const [docStatus, setDocStatus] = useState<string>('draft');

  // Quotation/Invoice Builder Sub-Items
  const [services, setServices] = useState<any[]>([]);
  const [timeline, setTimeline] = useState('4 Weeks');
  const [paymentSchedule, setPaymentSchedule] = useState('50% Upfront, 50% Handover');
  const [revisions, setRevisions] = useState(3);
  const [advancePercent, setAdvancePercent] = useState(50);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [currency, setCurrency] = useState('$');

  // Agreement Clauses
  const [projectScope, setProjectScope] = useState('');
  const [supportDuration, setSupportDuration] = useState('30 Days');
  const [ownershipClause, setOwnershipClause] = useState('');
  const [confidentialityClause, setConfidentialityClause] = useState('');
  const [liabilityClause, setLiabilityClause] = useState('');

  // Requirement Form
  const [colorPreferences, setColorPreferences] = useState('');
  const [websitePages, setWebsitePages] = useState('');
  const [featuresRequired, setFeaturesRequired] = useState('');
  const [competitorReferences, setCompetitorReferences] = useState('');
  const [brandingDetails, setBrandingDetails] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [seoRequirements, setSeoRequirements] = useState('');

  // Project Handover
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [hostingDetails, setHostingDetails] = useState('');
  const [domainDetails, setDomainDetails] = useState('');
  const [repositoryInfo, setRepositoryInfo] = useState('');
  const [deploymentInfo, setDeploymentInfo] = useState('');
  const [supportInfo, setSupportInfo] = useState('');

  const fetchInitialData = async () => {
    try {
      const docsRes = await fetch('/api/documents');
      const docsJson = await docsRes.json();
      if (docsJson.success) setDocuments(docsJson.data);

      const clientsRes = await fetch('/api/clients');
      const clientsJson = await clientsRes.json();
      if (clientsJson.success) setClients(clientsJson.data);

      const settingsRes = await fetch('/api/settings');
      const settingsJson = await settingsRes.json();
      if (settingsJson.success) setFreelancer(settingsJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const user = session.user as any;
      if (user?.role === 'admin') {
        router.replace('/dashboard/admin');
        return;
      }
    }
    fetchInitialData();
  }, [session, router]);

  useEffect(() => {
    const newType = searchParams.get('new');
    const editId = searchParams.get('edit');

    if (newType) {
      handleOpenCreate(newType);
    } else if (editId) {
      handleOpenEdit(editId);
    }
  }, [searchParams, documents]);

  const handleOpenCreate = (type: string) => {
    setEditingDocId(null);
    setDocType(type);
    setSelectedClient('');
    setDocTitle(`New ${type.toUpperCase()}`);
    setDocStatus('draft');

    // Reset Form Fields with defaults if settings exist
    setServices([{ name: 'Website Development', description: 'Custom dynamic website development', price: 1500 }]);
    setTimeline('4 Weeks');
    setPaymentSchedule(freelancer?.default_payment_terms || '50% Upfront, 50% Handover');
    setRevisions(freelancer?.default_revision_count || 3);
    setAdvancePercent(50);
    setTax(0);
    setDiscount(0);
    setCurrency('$');

    setProjectScope('');
    setSupportDuration('30 Days');
    setOwnershipClause(freelancer?.default_agreement_clauses?.ownership || '');
    setConfidentialityClause(freelancer?.default_agreement_clauses?.confidentiality || '');
    setLiabilityClause(freelancer?.default_agreement_clauses?.liability || '');

    setColorPreferences('');
    setWebsitePages('');
    setFeaturesRequired('');
    setCompetitorReferences('');
    setBrandingDetails('');
    setSocialMedia('');
    setSeoRequirements('');

    setWebsiteUrl('');
    setHostingDetails('');
    setDomainDetails('');
    setRepositoryInfo('');
    setDeploymentInfo('');
    setSupportInfo('');

    setEditorOpen(true);
  };

  const handleOpenEdit = async (docId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${docId}`);
      const json = await res.json();
      if (json.success) {
        const doc = json.data;
        setEditingDocId(doc.document_id);
        setDocType(doc.type);
        setSelectedClient(doc.client_id?.toString() || '');
        setDocTitle(doc.title);
        setDocStatus(doc.status);

        const content = doc.content;
        if (doc.type === 'quotation' || doc.type === 'invoice') {
          setServices(content.services || []);
          setTimeline(content.timeline || '');
          setPaymentSchedule(content.paymentSchedule || '');
          setRevisions(content.revisions || 3);
          setAdvancePercent(content.advancePercent || 50);
          setTax(content.tax || 0);
          setDiscount(content.discount || 0);
          setCurrency(content.currency || '$');
        } else if (doc.type === 'agreement') {
          setProjectScope(content.projectScope || '');
          setSupportDuration(content.supportDuration || '');
          setOwnershipClause(content.ownershipClause || '');
          setConfidentialityClause(content.confidentialityClause || '');
          setLiabilityClause(content.liabilityClause || '');
        } else if (doc.type === 'requirement') {
          setColorPreferences(content.colorPreferences || '');
          setWebsitePages(content.websitePages || '');
          setFeaturesRequired(content.featuresRequired || '');
          setCompetitorReferences(content.competitorReferences || '');
          setBrandingDetails(content.brandingDetails || '');
          setSocialMedia(content.socialMedia || '');
          setSeoRequirements(content.seoRequirements || '');
        } else if (doc.type === 'handover') {
          setWebsiteUrl(content.websiteUrl || '');
          setHostingDetails(content.hostingDetails || '');
          setDomainDetails(content.domainDetails || '');
          setRepositoryInfo(content.repositoryInfo || '');
          setDeploymentInfo(content.deploymentInfo || '');
          setSupportInfo(content.supportInfo || '');
        }

        setEditorOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare content payload
    let content: any = {};
    if (docType === 'quotation' || docType === 'invoice') {
      const subtotal = services.reduce((acc, curr) => acc + parseFloat(curr.price || 0), 0);
      const grandTotal = subtotal + parseFloat(tax as any) - parseFloat(discount as any);
      content = {
        services,
        timeline,
        paymentSchedule,
        revisions,
        advancePercent,
        tax,
        discount,
        currency,
        subtotal,
        grandTotal,
        status: docStatus,
      };
    } else if (docType === 'agreement') {
      content = {
        projectScope,
        supportDuration,
        ownershipClause,
        confidentialityClause,
        liabilityClause,
      };
    } else if (docType === 'requirement') {
      content = {
        colorPreferences,
        websitePages,
        featuresRequired,
        competitorReferences,
        brandingDetails,
        socialMedia,
        seoRequirements,
      };
    } else if (docType === 'handover') {
      content = {
        websiteUrl,
        hostingDetails,
        domainDetails,
        repositoryInfo,
        deploymentInfo,
        supportInfo,
      };
    }

    const payload = {
      document_id: editingDocId || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
      client_id: selectedClient ? parseInt(selectedClient) : null,
      type: docType,
      title: docTitle,
      status: docStatus,
      content,
    };

    try {
      setLoading(true);
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setEditorOpen(false);
        fetchInitialData();
        router.replace('/dashboard/documents');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenPreview = (doc: any) => {
    const docClient = clients.find((c) => c.id === doc.client_id);
    setPreviewDoc({
      ...doc,
      client: docClient,
      freelancer,
    });
    setPreviewOpen(true);
  };

  const addService = () => {
    setServices([...services, { name: '', description: '', price: 0 }]);
  };

  const removeService = (index: number) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    setServices(newServices);
  };

  const updateService = (index: number, key: string, val: any) => {
    const newServices = [...services];
    newServices[index][key] = val;
    setServices(newServices);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || doc.document_id.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Automation Engine</h2>
          <p className="text-xs text-neutral-500 mt-1">Configure and dynamic templates for agency-quality proposals & invoices.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black font-semibold focus:outline-none"
          >
            <option value="all">All Documents</option>
            <option value="quotation">Quotations</option>
            <option value="agreement">Agreements</option>
            <option value="requirement">Requirements</option>
            <option value="invoice">Invoices</option>
            <option value="handover">Handovers</option>
          </select>
          <button
            onClick={() => handleOpenCreate('quotation')}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-900 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Build Doc
          </button>
        </div>
      </div>

      {/* Search & Document List */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden">
        <div className="p-4 border-b border-neutral-100 relative">
          <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-neutral-400">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search documents by ID or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black transition-all"
          />
        </div>

        {filteredDocs.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">No documents matches found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3">Doc ID</th>
                  <th className="px-6 py-3">Title / Document</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Version</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-medium text-neutral-900">{doc.document_id}</td>
                    <td className="px-6 py-3.5 font-bold text-neutral-900">{doc.title}</td>
                    <td className="px-6 py-3.5 text-neutral-600">{doc.client_name || 'N/A'}</td>
                    <td className="px-6 py-3.5 capitalize text-neutral-500 font-semibold">{doc.type}</td>
                    <td className="px-6 py-3.5 font-semibold text-neutral-500">v{doc.version}</td>
                    <td className="px-6 py-3.5">
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
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenPreview(doc)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-900 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/documents?edit=${doc.document_id}`)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold border border-neutral-200 rounded px-2 py-1 bg-white hover:bg-neutral-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDocToDelete(doc.document_id);
                          setDeleteConfirmOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold border border-red-100 text-red-600 rounded px-2 py-1 bg-white hover:bg-red-50"
                      >
                        <Trash className="w-3.5 h-3.5" /> Delete
                      </button>

                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 w-full max-w-3xl rounded-lg shadow-xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-600">
                {editingDocId ? `Edit ${docType.toUpperCase()} (ID: ${editingDocId})` : `New ${docType.toUpperCase()}`}
              </h3>
              <button
                onClick={() => {
                  setEditorOpen(false);
                  router.replace('/dashboard/documents');
                }}
                className="text-neutral-400 hover:text-black font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Meta Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Document Title / Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Client Selection *
                  </label>
                  <select
                    required
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Select a saved client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company_name || 'Individual'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    disabled={!!editingDocId}
                    onChange={(e) => setDocType(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black disabled:opacity-55"
                  >
                    <option value="quotation">Quotation</option>
                    <option value="agreement">Agreement</option>
                    <option value="requirement">Requirement Form</option>
                    <option value="invoice">Invoice</option>
                    <option value="handover">Handover</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Status
                  </label>
                  <select
                    value={docStatus}
                    onChange={(e) => setDocStatus(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Editor View Blocks depending on selected document type */}
              {(docType === 'quotation' || docType === 'invoice') && (
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Line Items & Services</h4>
                    <button
                      type="button"
                      onClick={addService}
                      className="text-xs font-bold flex items-center gap-1 text-black hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {services.map((service, index) => (
                      <div key={index} className="flex gap-3 items-start bg-neutral-50 p-3 border border-neutral-100 rounded">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Service Name (e.g. Website Dev)"
                            required
                            value={service.name}
                            onChange={(e) => updateService(index, 'name', e.target.value)}
                            className="block w-full px-2 py-1 border border-neutral-200 bg-white rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={service.description}
                            onChange={(e) => updateService(index, 'description', e.target.value)}
                            className="block w-full px-2 py-1 border border-neutral-200 bg-white rounded text-xs"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="0"
                            value={service.price === 0 ? '' : service.price}
                            onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                            className="block w-full px-2 py-1 border border-neutral-200 bg-white rounded text-xs"
                          />
                        </div>
                        {services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 mt-0.5"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Calculations Config */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-100">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                      >
                        <option value="$">USD ($)</option>
                        <option value="₹">INR (₹)</option>
                        <option value="€">EUR (€)</option>
                        <option value="£">GBP (£)</option>
                        <option value="¥">JPY (¥)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Tax Amount
                      </label>
                      <input
                        type="number"
                        value={tax === 0 ? '' : tax}
                        placeholder="0"
                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                        className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Discount
                      </label>
                      <input
                        type="number"
                        value={discount === 0 ? '' : discount}
                        placeholder="0"
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                      />
                    </div>
                    {docType === 'quotation' && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Advance %
                        </label>
                        <input
                          type="number"
                          value={advancePercent === 0 ? '' : advancePercent}
                          placeholder="0"
                          onChange={(e) => setAdvancePercent(parseInt(e.target.value) || 0)}
                          className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                        />
                      </div>
                    )}
                  </div>

                  {docType === 'quotation' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Timeline
                        </label>
                        <input
                          type="text"
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Revisions Included
                        </label>
                        <input
                          type="number"
                          value={revisions === 0 ? '' : revisions}
                          placeholder="0"
                          onChange={(e) => setRevisions(parseInt(e.target.value) || 0)}
                          className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Payment Schedule Description
                        </label>
                        <input
                          type="text"
                          value={paymentSchedule}
                          onChange={(e) => setPaymentSchedule(e.target.value)}
                          className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Agreement Clauses Editor */}
              {docType === 'agreement' && (
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Project Scope Specification
                    </label>
                    <textarea
                      value={projectScope}
                      onChange={(e) => setProjectScope(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Timeline & Support Duration
                      </label>
                      <input
                        type="text"
                        value={supportDuration}
                        onChange={(e) => setSupportDuration(e.target.value)}
                        placeholder="e.g. 30 Days support"
                        className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Ownership Transfer Clause (Overwrites Default)
                    </label>
                    <textarea
                      value={ownershipClause}
                      onChange={(e) => setOwnershipClause(e.target.value)}
                      rows={2}
                      className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Confidentiality Clause (Overwrites Default)
                    </label>
                    <textarea
                      value={confidentialityClause}
                      onChange={(e) => setConfidentialityClause(e.target.value)}
                      rows={2}
                      className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Requirement Form Editor */}
              {docType === 'requirement' && (
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Color Preferences
                      </label>
                      <input
                        type="text"
                        value={colorPreferences}
                        onChange={(e) => setColorPreferences(e.target.value)}
                        placeholder="e.g. Dark Theme, Minimal Black/White"
                        className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Required Website Pages
                      </label>
                      <input
                        type="text"
                        value={websitePages}
                        onChange={(e) => setWebsitePages(e.target.value)}
                        placeholder="e.g. Home, About, Services, Contact"
                        className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Core Features Required
                    </label>
                    <textarea
                      value={featuresRequired}
                      onChange={(e) => setFeaturesRequired(e.target.value)}
                      rows={2}
                      className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Competitor References
                    </label>
                    <textarea
                      value={competitorReferences}
                      onChange={(e) => setCompetitorReferences(e.target.value)}
                      rows={2}
                      className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      SEO Requirements
                    </label>
                    <textarea
                      value={seoRequirements}
                      onChange={(e) => setSeoRequirements(e.target.value)}
                      rows={2}
                      className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Handover Document Editor */}
              {docType === 'handover' && (
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Live Website URL
                      </label>
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Domain Access Details
                      </label>
                      <input
                        type="text"
                        value={domainDetails}
                        onChange={(e) => setDomainDetails(e.target.value)}
                        className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Git Repository Information
                    </label>
                    <input
                      type="text"
                      value={repositoryInfo}
                      onChange={(e) => setRepositoryInfo(e.target.value)}
                      placeholder="e.g. GitHub private repo URL"
                      className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Hosting Access & Deployment Details
                    </label>
                    <textarea
                      value={hostingDetails}
                      onChange={(e) => setHostingDetails(e.target.value)}
                      rows={2}
                      className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 shrink-0">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setEditorOpen(false);
                    router.replace('/dashboard/documents');
                  }}
                  className="px-3 py-1.5 border border-neutral-200 rounded text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-900 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {loading ? 'Processing...' : 'Save & Compile Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium PDF Live Document Previewer */}
      {previewOpen && previewDoc && (
        <DocumentPreviewer
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          type={previewDoc.type}
          documentId={previewDoc.document_id}
          title={previewDoc.title}
          client={previewDoc.client}
          freelancer={previewDoc.freelancer}
          content={previewDoc.content}
          date={new Date(previewDoc.updated_at).toLocaleDateString()}
        />
      )}

      {/* Custom Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action will permanently remove all versions and generated data files."
        confirmLabel="Delete Document"
        cancelLabel="Keep Document"
        type="danger"
        onConfirm={async () => {
          if (docToDelete) {
            try {
              const res = await fetch(`/api/documents?documentId=${docToDelete}`, { method: 'DELETE' });
              const json = await res.json();
              if (json.success) fetchInitialData();
            } catch (err) {
              console.error(err);
            } finally {
              setDeleteConfirmOpen(false);
              setDocToDelete(null);
            }
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDocToDelete(null);
        }}
      />

    </div>
  );
}
