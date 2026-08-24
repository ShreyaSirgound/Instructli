'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getAnalyticsSummary, type AnalyticsSummary } from '../../../src/utils/analytics';

function StatCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-medium text-gray-900">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

function StudentTrendChart({ trend }: { trend: Array<{ day: string; attempts: number; accuracy: number | null }> }) {
  return (
    <div className="flex items-end gap-1">
      {trend.map((point) => (
        <div
          key={point.day}
          className="flex flex-col items-center gap-0.5"
          title={
            point.accuracy !== null
              ? `${point.day}: ${point.attempts} attempt${point.attempts === 1 ? '' : 's'}, ${(point.accuracy * 100).toFixed(0)}% accuracy`
              : `${point.day}: no graded attempts`
          }
        >
          <div
            className={`w-2 rounded-t-full ${point.accuracy !== null ? 'bg-indigo-500' : 'bg-gray-200'}`}
            style={{ height: `${point.accuracy !== null ? Math.max(4, Math.round(point.accuracy * 28)) : 4}px` }}
          />
        </div>
      ))}
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

  const knownStudents = useMemo(
    () => summary?.studentStats?.filter((s) => s.isKnown) ?? [],
    [summary]
  );
  const unknownBucket = useMemo(
    () => summary?.studentStats?.find((s) => !s.isKnown) ?? null,
    [summary]
  );
  const unknownHasActivity =
    !!unknownBucket &&
    unknownBucket.clicks + unknownBucket.visits + unknownBucket.questionAttempts + unknownBucket.simulationAttempts > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mt-2 text-3xl font-medium text-gray-900">Student usage & performance dashboard</h1>
          </div>
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
                <h2 className="text-lg font-medium text-gray-900">Module activity</h2>
                <p className="mt-1 text-sm text-gray-500">Clicks and visits by module</p>
              </div>
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">{summary?.moduleStats?.length ?? 0} modules</div>
            </div>

            <div className="mt-6 space-y-4">
              {(summary?.moduleStats ?? []).map((module) => (
                <div key={module.module} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{module.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{module.clicks} clicks • {module.visits} visits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{module.questionAttempts + module.simulationAttempts} interactions</p>
                      <p className="text-sm text-gray-500">{overallAccuracy}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Questions</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">{module.questionAttempts}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Simulations</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">{module.simulationAttempts}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Accuracy</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">{(module.averageScore || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Recent weekly trend</p>
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
            <h2 className="text-lg font-medium text-gray-900">Performance snapshot</h2>
            <p className="mt-1 text-sm text-gray-500">How well students are answering across the curriculum</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Average accuracy</p>
                  <p className="text-lg font-medium text-indigo-700">{overallAccuracy}</p>
                </div>
                <div className="mt-3">
                  <ProgressBar value={Math.round(summary?.averageAccuracy ? summary.averageAccuracy * 100 : 0)} total={100} />
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Best engagement</p>
                <p className="mt-2 text-sm text-gray-600">
                  {summary?.moduleStats?.[0]?.title ?? 'No data yet'} is leading in clicks and visits.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Student activity</h2>
              <p className="mt-1 text-sm text-gray-500">Per-student engagement, accuracy, and progress over time (by utorid/Shibboleth identity)</p>
            </div>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">{knownStudents.length} students</div>
          </div>

          <div className="mt-6 overflow-x-auto">
            {knownStudents.length === 0 ? (
              <p className="text-sm text-gray-500">
                No per-student data yet — identity is only captured when requests pass through the Shibboleth proxy.
              </p>
            ) : (
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="divide-x divide-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                    <th className="pb-2 pr-3">Student</th>
                    <th className="pb-2 px-3">Visits</th>
                    <th className="pb-2 px-3">Clicks</th>
                    <th className="pb-2 px-3">Questions</th>
                    <th className="pb-2 px-3">Simulations</th>
                    <th className="pb-2 px-3">Accuracy</th>
                    <th className="pb-2 px-3">Modules touched</th>
                    <th className="pb-2 px-3">Last active</th>
                    <th className="pb-2 pl-3">7-day progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {knownStudents.map((student) => (
                    <tr key={student.studentId}>
                      <td className="py-2 pr-3 font-medium text-gray-900">{student.label}</td>
                      <td className="py-2 px-3 text-gray-500">{student.visits}</td>
                      <td className="py-2 px-3 text-gray-500">{student.clicks}</td>
                      <td className="py-2 px-3 text-gray-500">{student.questionAttempts}</td>
                      <td className="py-2 px-3 text-gray-500">{student.simulationAttempts}</td>
                      <td className="py-2 px-3 text-gray-500">{(student.averageAccuracy * 100).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-gray-500">{student.modulesTouched.join(', ') || '—'}</td>
                      <td className="py-2 px-3 text-gray-500">
                        {student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 pl-3">
                        <StudentTrendChart trend={student.trend} />
                      </td>
                    </tr>
                  ))}
                  {unknownHasActivity && unknownBucket ? (
                    <tr className="italic text-gray-400">
                      <td className="py-2 pr-3">{unknownBucket.label}</td>
                      <td className="py-2 px-3">{unknownBucket.visits}</td>
                      <td className="py-2 px-3">{unknownBucket.clicks}</td>
                      <td className="py-2 px-3">{unknownBucket.questionAttempts}</td>
                      <td className="py-2 px-3">{unknownBucket.simulationAttempts}</td>
                      <td className="py-2 px-3">{(unknownBucket.averageAccuracy * 100).toFixed(1)}%</td>
                      <td className="py-2 px-3">{unknownBucket.modulesTouched.join(', ') || '—'}</td>
                      <td className="py-2 px-3">
                        {unknownBucket.lastActiveAt ? new Date(unknownBucket.lastActiveAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 pl-3">
                        <StudentTrendChart trend={unknownBucket.trend} />
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
