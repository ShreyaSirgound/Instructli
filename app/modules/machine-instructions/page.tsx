'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RFormatSection } from '@/components/machine-instructions/RFormatSection';
import { IFormatSection } from '@/components/machine-instructions/IFormatSection';
import { SFormatSection } from '@/components/machine-instructions/SFormatSection';
import { MachineInstructionsSimulation } from '@/components/machine-instructions/MachineInstructionsSimulation';
import { recordAnalyticsVisit } from '@/src/utils/analytics';

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

  useEffect(() => {
    recordAnalyticsVisit('machine-instructions');
  }, []);

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

        <h1 className="text-3xl font-medium text-gray-900 mb-6">Machine Instructions</h1>


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

      </div>
    </main>
  );
}
