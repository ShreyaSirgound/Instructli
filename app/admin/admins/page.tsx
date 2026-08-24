'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react';

type DynamicAdmin = { identity: string; added_by: string | null; created_at: string };
type AdminsResponse = { seedAdmins: string[]; dynamicAdmins: DynamicAdmin[] };

type AdminRow = {
  identity: string;
  addedBy: string | null;
  source: 'dynamic' | 'env';
};

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

  // Dynamic admins already come back most-recently-added first; env-var
  // admins have no creation timestamp, so they always sit at the bottom.
  const rows: AdminRow[] = data
    ? [
        ...data.dynamicAdmins.map((admin) => ({
          identity: admin.identity,
          addedBy: admin.added_by,
          source: 'dynamic' as const,
        })),
        ...data.seedAdmins.map((identity) => ({
          identity,
          addedBy: null,
          source: 'env' as const,
        })),
      ]
    : [];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">Manage admins</h1>
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
        ) : rows.length ? (
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <th className="px-4 py-3">Identity</th>
                  <th className="px-4 py-3">Added by</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.identity}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.identity}</td>
                    <td className="px-4 py-3 text-gray-500">{row.addedBy ?? '—'}</td>
                    <td className="px-4 py-3">
                      {row.source === 'env' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                          <ShieldCheck size={13} />
                          env var
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">dashboard</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.source === 'dynamic' ? (
                        <button
                          onClick={() => handleRemove(row.identity)}
                          disabled={removingId === row.identity}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          {removingId === row.identity ? 'Removing…' : 'Remove'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No admins found.</p>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Admins configured via ADMIN_SHIBBOLETH_ALLOWED_USERS can only be changed by editing that
          environment variable and redeploying.
        </p>
      </div>
    </main>
  );
}