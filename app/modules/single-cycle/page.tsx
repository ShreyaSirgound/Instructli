'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getSavedProgress, computeProgress, saveProgress, createEmptyProgress } from '@/app/progressConfig';
import { SingleProcessor } from '@/components/single-cycle/SingleCycle';
import { ProgressConfig } from '@/app/progressConfig';

const singleCycleConfig: ProgressConfig = {
  storageKey: 'singleCycleProgress',
  sectionIds: ['intro', 'datapath', 'control', 'putting-it-together'],
  eventName: 'single-cycle-progress-updated',
};

export default function SingleCycleModule() {
  const [progress, setProgress] = useState(() => createEmptyProgress(singleCycleConfig));

  useEffect(() => {
    setProgress(getSavedProgress(singleCycleConfig));
  }, []);

  const progressValue = useMemo(() => computeProgress(singleCycleConfig, progress), [progress]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition mb-6"
        >
          <ChevronLeft size={16} />
          All modules
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Module 2: Single Cycle Processor
        </h1>

        {/* Progress bar */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-slate-50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Module progress</p>
              <p className="text-sm text-gray-500">Complete all sections to reach 100%.</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{progressValue}% complete</p>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressValue}%`, backgroundColor: progressValue === 100 ? '#16a34a' : '#4f46e5' }}
            />
          </div>
        </div>

        {/* Processor diagram card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <SingleProcessor results={null} />
        </div>

      </div>
    </main>
  );
}