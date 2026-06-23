'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsModule() {
  const [freelancerName, setFreelancerName] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [defaultRevisionCount, setDefaultRevisionCount] = useState(3);
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('');

  // Default Clauses
  const [ownership, setOwnership] = useState('');
  const [confidentiality, setConfidentiality] = useState('');
  const [liability, setLiability] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      const user = session.user as any;
      if (user?.role === 'admin') {
        router.replace('/dashboard/admin');
        return;
      }
    }

    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) {
          const settings = json.data;
          setFreelancerName(settings.freelancer_name || '');
          setFreelancerEmail(settings.freelancer_email || '');
          setPhoneNumber(settings.phone_number || '');
          setAddress(settings.address || '');
          setPortfolioLink(settings.portfolio_link || '');
          setDefaultRevisionCount(settings.default_revision_count || 3);
          setDefaultPaymentTerms(settings.default_payment_terms || '');

          const clauses = settings.default_agreement_clauses || {};
          setOwnership(clauses.ownership || '');
          setConfidentiality(clauses.confidentiality || '');
          setLiability(clauses.liability || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const payload = {
      freelancer_name: freelancerName,
      freelancer_email: freelancerEmail,
      phone_number: phoneNumber,
      address,
      portfolio_link: portfolioLink,
      default_revision_count: defaultRevisionCount,
      default_payment_terms: defaultPaymentTerms,
      default_agreement_clauses: {
        ownership,
        confidentiality,
        liability,
      },
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 rounded"></div>
        <div className="h-64 bg-neutral-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">System Settings</h2>
        <p className="text-xs text-neutral-500 mt-1">Configure workspace defaults, contact info, branding and contract clauses.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded p-6 space-y-6">
        {success && (
          <div className="bg-neutral-50 border-l-2 border-black p-3 text-xs font-semibold text-neutral-800">
            Settings profile and contract clauses updated successfully.
          </div>
        )}

        {/* Profile Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Freelancer Identity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Full Name / Brand Name
              </label>
              <input
                type="text"
                required
                value={freelancerName}
                onChange={(e) => setFreelancerName(e.target.value)}
                className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Professional Email Address
              </label>
              <input
                type="email"
                required
                value={freelancerEmail}
                onChange={(e) => setFreelancerEmail(e.target.value)}
                className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Contact Number (10 digits)
              </label>
              <input
                type="text"
                maxLength={10}
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setPhoneNumber(val);
                }}
                className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Portfolio Web Link
              </label>
              <input
                type="url"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                placeholder="https://myportfolio.com"
                className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Registered Office Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none focus:border-black resize-none"
            />
          </div>
        </div>

        {/* Quotation Defaults */}
        <div className="space-y-4 pt-6 border-t border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Quotation & Invoice Defaults</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Default Revision Count
              </label>
              <input
                type="number"
                value={defaultRevisionCount}
                onChange={(e) => setDefaultRevisionCount(parseInt(e.target.value) || 0)}
                className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Default Payment Terms
              </label>
              <input
                type="text"
                value={defaultPaymentTerms}
                onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                placeholder="e.g. 50% upfront, 50% on completion"
                className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Agreement Clauses */}
        <div className="space-y-4 pt-6 border-t border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Agreement Boilerplate Clauses</h3>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Ownership & Transfer of Intellectual Property
            </label>
            <textarea
              value={ownership}
              onChange={(e) => setOwnership(e.target.value)}
              rows={3}
              className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Confidentiality & Non-Disclosure
            </label>
            <textarea
              value={confidentiality}
              onChange={(e) => setConfidentiality(e.target.value)}
              rows={3}
              className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Limitation of Liability
            </label>
            <textarea
              value={liability}
              onChange={(e) => setLiability(e.target.value)}
              rows={3}
              className="block w-full px-3 py-1.5 border border-neutral-200 rounded text-xs bg-white text-black resize-none focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-black text-white text-xs font-bold rounded hover:bg-neutral-900 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Settings...' : 'Save Settings & Clauses'}
          </button>
        </div>
      </form>
    </div>
  );
}
