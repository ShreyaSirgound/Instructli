'use client';

import { useEffect, useState } from 'react';
import { Lock, CircleUserRound, Trash2, UserPlus } from 'lucide-react';

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

  async function handleAdd(e: React.SubmitEvent) {
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
        <p className="text-sm text-gray-500 mb-4">
          Add UofT emails that should have admin access.
        </p>

        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newIdentity}
            onChange={(e) => setNewIdentity(e.target.value)}
            placeholder="Enter UofT email"
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

        <p className="font-medium text-sm text-gray-500 mb-2">
          Admin List
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : rows.length ? (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
            {rows.map((row) => (
              <li key={row.identity} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {/*{row.source === 'env' ? (*/}
                      <CircleUserRound size={14} className="text-gray-400" />
                    {/*) : null}*/}
                    {row.identity}
                  </p>
                </div>
                {row.source === 'dynamic' ? (
                  <button
                    onClick={() => handleRemove(row.identity)}
                    disabled={removingId === row.identity}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    {removingId === row.identity ? 'Removing…' : 'Remove'}
                  </button>
                ) : (
                  <Lock size={14} className="text-gray-400" />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No admins found.</p>
        )}
      </div>
    </main>
  );
}