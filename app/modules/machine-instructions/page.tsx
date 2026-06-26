'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RFormatSection } from '@/components/machine-instructions/RFormatSection';
import { IFormatSection } from '@/components/machine-instructions/IFormatSection';
import { SFormatSection } from '@/components/machine-instructions/SFormatSection';
import { MachineInstructionsSimulation } from '@/components/machine-instructions/MachineInstructionsSimulation';
import { getSavedProgress, computeProgress, saveProgress, createEmptyProgress } from '@/app/progressConfig';
import { machineInstructionsConfig } from '@/app/moduleConfigs';

export type TabId = 'r-format' | 'i-format' | 's-format' | 'simulation';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'r-format', label: '1. R-Format' },
  { id: 'i-format', label: '2. I-Format' },
  { id: 's-format', label: '3. S-Format' },
  { id: 'simulation', label: '4. Interactive simulation' },
];

export default function MachineInstructionsModule() {
  const [activeTab, setActiveTab] = useState<TabId>('r-format');
  const [progress, setProgress] = useState(() => createEmptyProgress(machineInstructionsConfig));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getSavedProgress(machineInstructionsConfig));
  }, []);

  const progressValue = useMemo(
    () => mounted ? computeProgress(machineInstructionsConfig, progress) : 0,
    [progress, mounted]
  );
  const currentComplete = progress[activeTab] ?? false;

  function markSectionComplete() {
    const updated = { ...progress, [activeTab]: !currentComplete };
    setProgress(updated);
    saveProgress(machineInstructionsConfig, updated);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition mb-6"
        >
          <ChevronLeft size={16} />
          All modules
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Machine Instructions</h1>

        <div className="mb-8 rounded-3xl border border-gray-200 bg-slate-50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Module progress</p>
              <p className="text-sm text-gray-500">Complete all four sections to reach 100%.</p>
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

        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-1.5 rounded-full border text-sm transition-all duration-150"
              style={
                activeTab === tab.id
                  ? { backgroundColor: '#111827', color: '#ffffff', borderColor: '#111827' }
                  : { backgroundColor: 'transparent', color: '#6B7280', borderColor: '#E5E7EB' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'r-format' && <RFormatSection />}
        {activeTab === 'i-format' && <IFormatSection />}
        {activeTab === 's-format' && <SFormatSection />}
        {activeTab === 'simulation' && <MachineInstructionsSimulation />}

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">Finished this section?</p>
            </div>
            <button
              type="button"
              onClick={markSectionComplete}
              className={`inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${currentComplete ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              aria-pressed={currentComplete}
            >
              {currentComplete ? '✓' : 'Mark section complete'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
