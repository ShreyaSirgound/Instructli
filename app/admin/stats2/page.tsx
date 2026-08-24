'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAnalyticsSummary, type AnalyticsSummary } from '../../../src/utils/analytics';
import { Users, Target, CheckCircle2, Search, HelpCircle as QuestionIcon, PlayCircle,} from 'lucide-react';

interface QuestionPerformance {
  id: string;
  questionTitle: string;
  moduleName: string;
  attempts: number;
  accuracy: number;
  rating: 'Easy' | 'Medium' | 'Hard' | 'Too Hard';
}

interface SimulationPerformance {
  id: string;
  simTitle: string;
  moduleName: string;
  averageAccuracy: number;
  abandonmentRate: number;
  avgAbandonmentStep: string;
  rating: 'Easy' | 'Medium' | 'Hard' | 'Too Hard';
}

interface StudentStat {
  utorid: string;
  name: string;
  email: string;
  accuracy: number;
  questionsAttempted: number;
  lastActiveDaysAgo: number;
  weeklyActivity: number[];
}

const MOCK_QUESTIONS: QuestionPerformance[] = [
  { id: 'q-101', questionTitle: 'Direct Cache Indexing Calculation', moduleName: 'Caching fundamentals', attempts: 142, accuracy: 82, rating: 'Easy' },
  { id: 'q-102', questionTitle: 'Set-Associative Tag Offset', moduleName: 'Caching fundamentals', attempts: 98, accuracy: 58, rating: 'Medium' },
  { id: 'q-103', questionTitle: 'Data Hazard Forwarding Paths', moduleName: 'Pipeline hazards', attempts: 115, accuracy: 41, rating: 'Hard' },
  { id: 'q-104', questionTitle: '2-Way Set Cache Miss Penalty', moduleName: 'Caching fundamentals', attempts: 45, accuracy: 18, rating: 'Too Hard' },
];

const MOCK_SIMULATIONS: SimulationPerformance[] = [
  { id: 'sim-1', simTitle: 'Interactive Pipeline Hazard Stalling', moduleName: 'Pipeline hazards', averageAccuracy: 61, abandonmentRate: 38, avgAbandonmentStep: 'Step 3 (Forwarding Unit)', rating: 'Easy' },
  { id: 'sim-2', simTitle: 'Cache Block Replacement Visualizer', moduleName: 'Caching fundamentals', averageAccuracy: 79, abandonmentRate: 12, avgAbandonmentStep: 'Step 5 (Write-Back Policy)', rating: 'Hard' },
];

const MOCK_STUDENTS: StudentStat[] = [
  { utorid: 'smithj21', name: 'Jordan Smith', email: 'jordan.smith@mail.utoronto.ca', accuracy: 48, questionsAttempted: 35, lastActiveDaysAgo: 6, weeklyActivity: [0, 1, 0, 0, 2, 0, 1] },
  { utorid: 'patelm42', name: 'Maya Patel', email: 'maya.patel@mail.utoronto.ca', accuracy: 72, questionsAttempted: 62, lastActiveDaysAgo: 1, weeklyActivity: [2, 4, 1, 3, 0, 2, 4] },
  { utorid: 'chena101', name: 'Alex Chen', email: 'alex.chen@mail.utoronto.ca', accuracy: 89, questionsAttempted: 110, lastActiveDaysAgo: 0, weeklyActivity: [4, 4, 3, 4, 2, 4, 3] },
];

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
    return MOCK_STUDENTS.filter(student => {
      return student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             student.utorid.toLowerCase().includes(searchQuery.toLowerCase()) ||
             student.email.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const getRatingBadge = (rating: QuestionPerformance['rating']) => {
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
          title={`Day ${idx + 1}: ${count} interactions`}
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
          <div>
            <h1 className="text-3xl font-medium text-slate-900 tracking-tight">Student usage & performance dashboard</h1>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Weekly Visits</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">2,480</h3>
              <p className="text-xs text-slate-500 mt-1">+12.4% from last week</p>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Weekly Avg. Accuracy</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">71.4%</h3>
              <p className="text-xs text-slate-500 mt-1">+2.8% from last week</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Practice Attempts</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">1,420</h3>
              <p className="text-xs text-slate-500 mt-1">Avg 7.8 questions per student</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
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
                    placeholder="Search by UTORid or name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-56"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 tracking-wider border-b border-slate-100">
                <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">UTORid</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Questions Attempted</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4">7-Day Activity Heatmap</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                    <tr key={student.utorid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                        <div>{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{student.email}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{student.utorid}</td>
                        <td className="py-3 px-4">
                        <span className={`font-medium ${student.accuracy < 60 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {student.accuracy}%
                        </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{student.questionsAttempted}</td>
                        <td className="py-3 px-4 text-slate-500">
                        {student.lastActiveDaysAgo === 0 ? (
                            <span className="text-emerald-600 font-medium">Today</span>
                        ) : (
                            `${student.lastActiveDaysAgo}d ago`
                        )}
                        </td>
                        <td className="py-3 px-4">
                        <ActivityHeatmap activity={student.weeklyActivity} />
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                        No students match the current search query.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] items-start">
        {/* MODULE ACTIVITY SECTION */}
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

        {/* QUESTION & SIMULATION PERFORMANCE */}
        <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-[380px]">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-lg text-slate-900 flex items-center gap-2">
                  <QuestionIcon className="w-4 h-4 text-indigo-600" />
                  Question Performance
                </h2>
                <p className="mt-1 text-sm text-slate-500">Weekly attempts, accuracy, and difficulty ratings</p>
              </div>
            </div>
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {MOCK_QUESTIONS.map((q) => (
                <div key={q.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">{q.questionTitle}</p>
                      <p className="text-[11px] text-slate-400">{q.moduleName}</p>
                    </div>
                    <span className={`text-[10px] font-medium border px-2 py-0.5 rounded-full ${getRatingBadge(q.rating)}`}>
                        {q.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/50">
                    <span>{q.attempts} attempts</span>
                    <span className="font-medium text-slate-700">Accuracy: {q.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-[380px]">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-lg text-slate-900 flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-indigo-600" />
                  Simulation Performance
                </h2>
                <p className="mt-1 text-sm text-slate-500">Weekly accuracy and abandonment rates</p>
              </div>
            </div>
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {MOCK_SIMULATIONS.map((sim) => (
                <div key={sim.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-xs font-medium text-slate-800 leading-snug">{sim.simTitle}</p>
                            <p className="text-[11px] text-slate-400">{sim.moduleName}</p>
                        </div>
                        <span className={`text-[10px] font-medium border px-2 py-0.5 rounded-full ${getRatingBadge(sim.rating)}`}>
                            {sim.rating}
                        </span>
                    </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/50">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Avg Accuracy</span>
                      <span className="font-medium text-slate-700">{sim.averageAccuracy}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Abandonment Rate</span>
                      <span className="font-medium text-slate-700">{sim.abandonmentRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    </main>
  );
}