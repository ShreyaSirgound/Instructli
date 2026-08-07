'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/admin';

  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const res = await fetch(`/api/admin/login?from=${encodeURIComponent(from)}`, {
          method: 'POST',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (active) {
            setError(data.error ?? 'You are not authorized for admin access.');
            setErrorDetails(data);
          }
          return;
        }

        if (active) {
          router.replace(from);
          router.refresh();
        }
      } catch {
        if (active) {
          setError('Unable to verify your Shibboleth access right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAccess();
    return () => {
      active = false;
    };
  }, [from, router]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center mb-6 mx-auto">
          <ShieldCheck size={20} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin Access</h1>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          {loading ? 'Checking access…' : error ? <span className="text-red-600">{error}</span> : 'Redirecting…'}
        </div>
        {error ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
            <p>
              If you see this message after a successful Shibboleth login, verify the header identity is being detected by the server.
            </p>
            {errorDetails ? (
              <pre className="overflow-x-auto whitespace-pre-wrap text-left text-[11px] text-red-800">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
