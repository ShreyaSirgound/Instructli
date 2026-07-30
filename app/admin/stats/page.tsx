'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getAnalyticsSummary, type AnalyticsSummary } from '../../../src/utils/analytics';

function StatCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const width = total > 0 ? Math.max(8, Math.round((value / total) * 100)) : 0;
  return (
    <div className="h-2 rounded-full bg-gray-100">
      <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function AdminStatsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const data = await getAnalyticsSummary();
        if (!cancelled) {
          setSummary(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Could not load analytics.');
      }
    };

    refresh();
    const interval = setInterval(refresh, 15000); // poll for fresh data every 15s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const overallAccuracy = useMemo(() => {
    if (!summary) return '0%';
    const value = summary.averageAccuracy * 100;
    return `${value.toFixed(1)}%`;
  }, [summary]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Analytics</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">Student usage & performance dashboard</h1>
          </div>
          <Link href="/admin" className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400">
            Back to admin
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total clicks" value={summary?.clicks?.toString() ?? '0'} subtitle="Tracked interactions across the app" />
          <StatCard label="Visits" value={summary?.visits?.toString() ?? '0'} subtitle="Session starts recorded in the browser" />
          <StatCard label="Question attempts" value={summary?.questionAttempts?.toString() ?? '0'} subtitle="Practice questions answered" />
          <StatCard label="Simulation attempts" value={summary?.simulationAttempts?.toString() ?? '0'} subtitle="Simulation exercises completed" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Module activity</h2>
                <p className="mt-1 text-sm text-gray-500">Clicks and visits by module</p>
              </div>
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">{summary?.moduleStats?.length ?? 0} modules</div>
            </div>

            <div className="mt-6 space-y-4">
              {(summary?.moduleStats ?? []).map((module) => (
                <div key={module.module} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{module.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{module.clicks} clicks • {module.visits} visits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{module.questionAttempts + module.simulationAttempts} interactions</p>
                      <p className="text-sm text-gray-500">{overallAccuracy}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Questions</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{module.questionAttempts}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Simulations</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{module.simulationAttempts}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Accuracy</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{(module.averageScore || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Recent weekly trend</p>
                    <div className="flex items-end gap-2">
                      {module.trend.map((point) => (
                        <div key={`${module.module}-${point.day}`} className="flex flex-1 flex-col items-center gap-1">
                          <div className="w-full rounded-t-full bg-indigo-500" style={{ height: `${Math.max(8, point.count * 16)}px` }} />
                          <span className="text-[11px] text-gray-500">{point.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Performance snapshot</h2>
            <p className="mt-1 text-sm text-gray-500">How well students are answering across the curriculum</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Average accuracy</p>
                  <p className="text-lg font-semibold text-indigo-700">{overallAccuracy}</p>
                </div>
                <div className="mt-3">
                  <ProgressBar value={Math.round(summary?.averageAccuracy ? summary.averageAccuracy * 100 : 0)} total={100} />
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Best engagement</p>
                <p className="mt-2 text-sm text-gray-600">
                  {summary?.moduleStats?.[0]?.title ?? 'No data yet'} is leading in clicks and visits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
