'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAnalyticsSummary, type AnalyticsSummary, type ItemAnalytics } from '../../../src/utils/analytics';
import { Search} from 'lucide-react';

function formatPct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function formatChange(changePct: number | null, digits = 1) {
  if (changePct === null) return 'No data from last week';
  const sign = changePct >= 0 ? '+' : '';
  return `${sign}${changePct.toFixed(digits)}% from last week`;
}

function daysAgo(iso: string | null): number | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredStudents = useMemo(() => {
    const students = summary?.studentStats ?? [];
    const q = searchQuery.toLowerCase();
    return students.filter((student) => {
      return student.label.toLowerCase().includes(q) || student.studentId.toLowerCase().includes(q);
    });
  }, [summary, searchQuery]);

  const { questionItems, simulationItems } = useMemo(() => {
    const items = summary?.itemStats ?? [];
    const byAccuracyAsc = (a: ItemAnalytics, b: ItemAnalytics) => a.accuracy - b.accuracy;
    return {
      questionItems: items.filter((i) => i.type === 'question').sort(byAccuracyAsc),
      simulationItems: items.filter((i) => i.type === 'simulation').sort(byAccuracyAsc),
    };
  }, [summary]);

  const getRatingBadge = (rating: ItemAnalytics['rating']) => {
    switch (rating) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Hard':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Too Hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const ActivityHeatmap = ({ activity }: { activity: number[] }) => {
  const getIntensityClass = (level: number) => {
    if (level === 0) return 'bg-slate-100 border-slate-200/60';
    if (level === 1) return 'bg-indigo-100 border-indigo-200';
    if (level === 2) return 'bg-indigo-300 border-indigo-400';
    if (level === 3) return 'bg-indigo-500 border-indigo-600';
    return 'bg-indigo-700 border-indigo-800';
  };

  return (
    <div className="flex items-center gap-1">
      {activity.map((count, idx) => (
        <div
          key={idx}
          title={`${count} interactions`}
          className={`w-3 h-6 rounded-sm border ${getIntensityClass(count)} transition-all`}
        />
      ))}
    </div>
  );
  };

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 space-y-6 w-full font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <h1 className="text-4xl font-medium text-gray-900">Student usage & performance dashboard</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Weekly Visits</p>
              <h3 className="text-3xl font-medium text-slate-900 mt-1">{(summary?.weeklyVisits ?? 0).toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-1">{formatChange(summary?.weeklyVisitsChangePct ?? null)}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Students</p>
              <h3 className="text-3xl font-medium text-slate-900 mt-1">{(summary?.activeStudents ?? 0).toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-1">{formatChange(summary?.activeStudentsChangePct ?? null)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Weekly Avg. Accuracy</p>
              <h3 className="text-3xl font-medium text-slate-900 mt-1">{formatPct((summary?.weeklyAvgAccuracy ?? 0) * 100)}</h3>
              <p className="text-xs text-slate-500 mt-1">{formatChange(summary?.weeklyAccuracyChangePct ?? null)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Practice Attempts</p>
              <h3 className="text-3xl font-medium text-slate-900 mt-1">{(summary?.totalAttempts ?? 0).toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-1">Avg. {(summary?.avgAttemptsPerStudent ?? 0).toFixed(1)} questions per student</p>
            </div>
          </div>
        </div>
    
        {/* STUDENT ROSTER */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 pt-3 border-b border-slate-100 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-medium text-lg text-slate-900">Student Activity</h2>
                    <p className="mt-1 text-sm text-gray-500">Individual accuracy and past activity</p>
                </div>
                <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input 
                    type="text" 
                    placeholder="Search by email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-56"
                    />
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-gray-400 [&_th]:font-medium">
                <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Questions Attempted</th>
                    <th className="py-3 px-4">Simulations Attempted</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4">7-Day Activity Heatmap</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const lastActive = daysAgo(student.lastActiveAt);
                      const accuracyPct = student.averageAccuracy * 100;
                      return (
                    <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                        <div className={!student.isKnown ? 'text-slate-400 italic font-normal' : ''}>{student.label}</div>
                        </td>
                        <td className="py-3 px-4">
                        <span className={`font-medium ${accuracyPct < 60 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {accuracyPct.toFixed(1)}%
                        </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{student.questionAttempts}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{student.simulationAttempts}</td>
                        <td className="py-3 px-4 text-slate-500">
                        {lastActive === null ? (
                            '—'
                        ) : lastActive === 0 ? (
                            <span className="text-emerald-600 font-medium">Today</span>
                        ) : (
                            `${lastActive}d ago`
                        )}
                        </td>
                        <td className="py-3 px-4">
                        <ActivityHeatmap activity={student.trend.map((t) => t.attempts)} />
                        </td>
                    </tr>
                      );
                    })
                ) : (
                    <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                        No students match your search.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] items-start">
          {/* MODULE ACTIVITY */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm h-[776px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Module activity</h2>
                <p className="mt-1 text-sm text-gray-500">Clicks and visits by module</p>
              </div>
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                {summary?.moduleStats?.length ?? 0} modules
              </div>
            </div>

            <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
              {(summary?.moduleStats ?? []).map((module) => (
                <div key={module.module} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{module.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{module.clicks} clicks • {module.visits} visits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{module.questionAttempts + module.simulationAttempts} interactions</p>
                      <p className="text-sm text-gray-500">{(module.averageScore || 0).toFixed(1)}%</p>
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
                    
                    {(() => {
                      const maxCount = Math.max(...module.trend.map((p) => p.count), 1);

                      return (
                        <div className="flex h-12 items-end gap-2 pt-2">
                          {module.trend.map((point) => {
                            const pct = point.count > 0 ? Math.max(12, Math.round((point.count / maxCount) * 100)) : 8;

                            return (
                              <div key={`${module.module}-${point.day}`} className="flex h-full flex-1 flex-col justify-end items-center gap-1">
                                <div
                                  className="w-full rounded-t-full bg-indigo-500 transition-all duration-300"
                                  style={{ height: `${pct}%` }}
                                  title={`${point.count} interactions`}
                                />
                                <span className="text-[11px] text-gray-500">{point.day}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
              {(summary?.moduleStats ?? []).length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-8">No module activity recorded yet.</div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Question Performance */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-[380px]">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-lg text-slate-900 flex items-center gap-2">
                    Question Performance
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">All-time student attempts, accuracy, and difficulty ratings</p>
                </div>
              </div>
              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {questionItems.map((q) => (
                  <div key={q.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-snug">{q.title}</p>
                        <p className="text-xs text-slate-400">{q.moduleName}</p>
                      </div>
                      <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${getRatingBadge(q.rating)}`}>
                        {q.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>{q.attempts} attempts</span>
                      <span className="font-medium text-slate-700">Accuracy: {q.accuracy}%</span>
                    </div>
                  </div>
                ))}
                {questionItems.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-8">No question attempts recorded yet.</div>
                ) : null}
              </div>
            </div>

            {/* Simulation Performance */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-[380px]">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-lg text-slate-900 flex items-center gap-2">
                    Simulation Performance
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">All-time student attempts and accuracy</p>
                </div>
              </div>
              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {simulationItems.map((sim) => (
                  <div key={sim.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-snug">{sim.title}</p>
                        <p className="text-xs text-slate-400">{sim.moduleName}</p>
                      </div>
                      <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${getRatingBadge(sim.rating)}`}>
                        {sim.rating}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/50">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Attempts</span>
                        <span className="font-medium text-slate-700">{sim.attempts}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Accuracy</span>
                        <span className="font-medium text-slate-700">{sim.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {simulationItems.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-8">No simulation attempts recorded yet.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
    </div>
    </main>
  );
}