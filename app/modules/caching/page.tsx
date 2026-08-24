"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../../../components/Card'
import CacheTracer from "@/components/caching/CacheTracer";
import TabCachingBasics from "@/components/caching/TabCachingBasics";
import TabAssociativeCaching from "@/components/caching/TabAssociativeCaching";
import { recordAnalyticsVisit } from '@/src/utils/analytics';

export type TabId = 'simulation' | 'caching-basics' | 'associative-caching';

const TABS: { id: TabId; label: string }[] = [
  { id: 'caching-basics', label: '1. Caching fundamentals' },
  { id: 'associative-caching', label: '2. Associative caching' },
  { id: 'simulation', label: '3. Interactive simulation' },
];

export default function CachingModule() {
  const [activeTab, setActiveTab] = useState<TabId>('simulation');

  useEffect(() => {
    recordAnalyticsVisit('caching');
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-0 my-0 pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition mb-6"
        >
          <ChevronLeft size={16} />
          All modules
        </Link>

        <h1 className="text-3xl font-medium text-gray-900 mb-6">
          Module 6: Caching
        </h1>


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

        {activeTab === 'simulation' && (
          <>
            <Card variant="simulation" title="Cache Tracer">
              <div className="flex-none relative bottom-[10px]">
                <CacheTracer/>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'caching-basics' && (
          <TabCachingBasics />
        )}

        {activeTab === 'associative-caching' && (
          <TabAssociativeCaching />
        )}

      </div>
    </main>
  );
}
