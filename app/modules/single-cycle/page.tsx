"use client";

import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card } from '@/components/Card';
import dynamic from "next/dynamic";
import { getSavedProgress, computeProgress, saveProgress, createEmptyProgress } from '@/app/progressConfig';
import { returnPath,  JsonResponse} from '../../../src/utils/single-processor';
import { SingleProcessor } from '@/components/single-cycle/SingleCycle';
import { ProgressConfig } from '@/app/progressConfig';

// dynamically import so it only runs client-side
const Terminal = dynamic(
  () => import('@/components/single-cycle/Terminal'),
  { ssr: false }
);

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

  const [code, setCode] = useState<string>("add x28, x6, x7\n");
  const [results, setResults] = useState<JsonResponse | null | undefined>();

  const handleExecute = (command: string, instructionType: string) => {
    const newResults = returnPath(command, instructionType)

    const diagramString = {
      data_path: newResults.data_path,
      block_data: newResults.block_data,
      command_type: newResults.command_type,
      command: command,
    };
    localStorage.setItem("singleDiagram", JSON.stringify(diagramString));
    setResults(newResults);
  }

  const handleReset = () => {
    setResults(null);
    localStorage.removeItem("singleDiagram");
  };

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
          Module 2: Single Cycle Processor
        </h1>

        {/* Progress bar */}
        <div className="rounded-3xl border border-gray-200 bg-slate-50 p-6">
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
      </div>

      <div className="max-w-5xl mx-auto pt-0 px-6 py-12">
        {/* Processor diagram card */}
            <Card variant="simulation" title="Instruction visualizer">
                <div className="flex-none relative bottom-[10px]">
                <Terminal
                    code={code}
                    onCodeChange={setCode}
                    onExecute={handleExecute}
                    onReset={handleReset}
                />
                </div>

                <div className="flex-1 overflow-auto bg-white pb-[50px] p-5">
                    <SingleProcessor results={results}/>
                </div>
            </Card>
        </div>
    </main>
  );
}