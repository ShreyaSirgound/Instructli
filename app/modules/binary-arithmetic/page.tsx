'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TabInterpreting } from '@/components/binary/TabInterpreting';
import { TabRepresentationFormats } from '@/components/binary/TabRepresentationFormats';
import { TabAdditionSubtraction } from '@/components/binary/TabAdditionSubtraction';
import { TabOverflowSaturating } from '@/components/binary/TabOverflowSaturating';

export type TabId = 'interpreting' | 'representation-formats' | 'addition-subtraction' | 'overflow-saturating';

export interface Tab {
  id: TabId;
  label: string;
}

export const TABS: Tab[] = [
  { id: 'interpreting',            label: '1. Interpreting Numbers' },
  { id: 'representation-formats',  label: '2. Representation Formats' },
  { id: 'addition-subtraction',    label: '3. Arithmetic' },
  { id: 'overflow-saturating',     label: '4. Overflow' },
];

export default function BinaryArithmeticModule() {
  const [activeTab, setActiveTab] = useState<TabId>('interpreting');

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">

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
          Module 1: Binary Arithmetic
        </h1>


        {/* Tab bar */}
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

        {/* Tab content */}
        {activeTab === 'interpreting'            && <TabInterpreting />}
        {activeTab === 'representation-formats'  && <TabRepresentationFormats />}
        {activeTab === 'addition-subtraction'    && <TabAdditionSubtraction />}
        {activeTab === 'overflow-saturating'     && <TabOverflowSaturating />}


      </div>
    </main>
  );
}