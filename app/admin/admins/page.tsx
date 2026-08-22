'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Trash2, UserPlus } from 'lucide-react';

type DynamicAdmin = { identity: string; added_by: string | null; created_at: string };
type AdminsResponse = { seedAdmins: string[]; dynamicAdmins: DynamicAdmin[] };

export default function ManageAdminsPage() {
  const [data, setData] = useState<AdminsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIdentity, setNewIdentity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/admins');
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError('Could not load admins.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newIdentity.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: newIdentity.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? 'Failed to add admin.');
        return;
      }
      setNewIdentity('');
      await load();
    } catch {
      setError('Failed to add admin.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(identity: string) {
    setRemovingId(identity);
    setError(null);
    try {
      const res = await fetch(`/api/admin/admins/${encodeURIComponent(identity)}`, {
        method: 'DELETE',
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? 'Failed to remove admin.');
        return;
      }
      await load();
    } catch {
      setError('Failed to remove admin.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition mb-8">
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage admins</h1>
        <p className="text-sm text-gray-500 mb-8">
          Add or remove utorids/emails that should have admin access via Shibboleth.
        </p>

        <form onSubmit={handleAdd} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newIdentity}
            onChange={(e) => setNewIdentity(e.target.value)}
            placeholder="utorid or email"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <UserPlus size={15} />
            {submitting ? 'Adding…' : 'Add admin'}
          </button>
        </form>

        {error ? <p className="text-sm text-red-600 mb-6">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-medium text-gray-500 mb-3">Added from the dashboard</h2>
              {data?.dynamicAdmins.length ? (
                <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
                  {data.dynamicAdmins.map((admin) => (
                    <li key={admin.identity} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{admin.identity}</p>
                        {admin.added_by ? (
                          <p className="text-xs text-gray-400">added by {admin.added_by}</p>
                        ) : null}
                      </div>
                      <button
                        onClick={() => handleRemove(admin.identity)}
                        disabled={removingId === admin.identity}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {removingId === admin.identity ? 'Removing…' : 'Remove'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No admins have been added from the dashboard yet.</p>
              )}
            </section>

            <section>
              <h2 className="text-sm font-medium text-gray-500 mb-3">Configured via environment variable</h2>
              {data?.seedAdmins.length ? (
                <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
                  {data.seedAdmins.map((identity) => (
                    <li key={identity} className="flex items-center justify-between px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-gray-400" />
                        {identity}
                      </p>
                      <span className="text-xs text-gray-400">env var</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No admins are configured via ADMIN_SHIBBOLETH_ALLOWED_USERS.</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                These can only be removed by editing ADMIN_SHIBBOLETH_ALLOWED_USERS and redeploying.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
