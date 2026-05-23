'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { TABS, TabId } from '@/components/binary/types';
import { TabNumberSystems }    from '@/components/binary/TabNumberSystems';
import { TabSignedIntegers }   from '@/components/binary/TabSignedIntegers';
import { TabAdditionOverflow } from '@/components/binary/TabAdditionOverflow';
import { TabPrecision }        from '@/components/binary/TabPrecision';

export default function BinaryArithmeticModule() {
  const [activeTab, setActiveTab] = useState<TabId>('number-systems');

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
        {activeTab === 'number-systems'    && <TabNumberSystems />}
        {activeTab === 'signed-integers'   && <TabSignedIntegers />}
        {activeTab === 'addition-overflow' && <TabAdditionOverflow />}
        {activeTab === 'precision'         && <TabPrecision />}

      </div>
    </main>
  );
}