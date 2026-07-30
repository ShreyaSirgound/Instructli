'use client';

import { useEffect, useState } from 'react';
import ModuleCard from '@/components/ModuleCard'
import { binaryArithmeticConfig, cachingConfig, hazardsConfig, machineInstructionsConfig, pipelineConfig, singleCycleConfig } from './moduleConfigs';
import { recordAnalyticsVisit } from '../src/utils/analytics';
import { getModuleIcon } from '../lib/moduleIcons';
import type { ModuleRow } from './api/modules/route';

const MODULE_META: Record<string, { href: string; progressConfig: typeof binaryArithmeticConfig; scrollKey?: string }> = {
  'binary-arithmetic': { href: '/modules/binary-arithmetic', progressConfig: binaryArithmeticConfig },
  'single-cycle': { href: '/modules/single-cycle', progressConfig: singleCycleConfig, scrollKey: 'singleCycleScrollProgress' },
  pipeline: { href: '/modules/pipeline', progressConfig: pipelineConfig },
  'machine-instructions': { href: '/modules/machine-instructions', progressConfig: machineInstructionsConfig },
  hazards: { href: '/modules/hazards', progressConfig: hazardsConfig },
  caching: { href: '/modules/caching', progressConfig: cachingConfig },
};

export default function Dashboard() {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recordAnalyticsVisit('app');
  }, []);

  useEffect(() => {
    fetch('/api/modules')
      .then((res) => res.json())
      .then((data) => setModules(data.modules ?? []))
      .finally(() => setLoading(false));
  }, []);

  const visibleModules = modules.filter((m) => !m.hidden);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900">Welcome to Instructli</h1>
            <p className="text-gray-500 mt-4 max-w-4xl mx-auto">This app provides short interactive modules to help you practice and develop a deeper understanding of CSC258 concepts. It is not intended to teach new material. Use it to reinforce and explore the topics you are expected to know after lectures.</p>
          </div>
        </div>

        {/* Module grid */}
        {loading ? (
          <p className="text-center text-sm text-gray-400">Loading modules…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleModules.map((mod) => {
              const meta = MODULE_META[mod.id];
              if (!meta) return null;
              const Icon = getModuleIcon(mod.icon_key);
              return (
                <ModuleCard
                  key={mod.id}
                  title={mod.title}
                  description={mod.description}
                  href={meta.href}
                  icon={<Icon size={22} />}
                  iconBg={mod.icon_bg}
                  barColor={mod.bar_color}
                  progressConfig={meta.progressConfig}
                  scrollKey={meta.scrollKey}
                  moduleKey={mod.id}
                  locked={mod.locked}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
