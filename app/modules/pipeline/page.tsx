"use client";

import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card } from '@/components/Card';
import dynamic from "next/dynamic";
import { getSavedProgress, computeProgress, saveProgress, createEmptyProgress } from '@/app/progressConfig';
import PipelineProcessor from '@/components/pipeline/PipelineProcessor';
import { ProgressConfig } from '@/app/progressConfig';
import { PipelineState } from "'../../../src/utils/pipeline-types"
import { handlePipeLinePreset } from '../../../src/utils/pipeline-processor';

// dynamically import so it only runs client-side -> ssr is server-side render
const PipelineTerminal = dynamic(
  () => import("@/components/pipeline/PipelineTerminal"),
  { ssr: false }
);


const pipelineConfig: ProgressConfig = {
  storageKey: 'pipelineProgress',
  sectionIds: [],
  eventName: 'pipeline-progress-updated',
};

export default function PipelineModule() {
  const [progress, setProgress] = useState(() => createEmptyProgress(pipelineConfig));

  useEffect(() => {
    setProgress(getSavedProgress(pipelineConfig));
  }, []);

  const progressValue = useMemo(() => computeProgress(pipelineConfig, progress), [progress]);

  const [code, setCode] = useState<string>("add x1, x1, x2\n");
  const [results, setResults] = useState<PipelineState[]>([]);
  const [currCycle, setCurrCycle] = useState(-1);
  const [currentPreset, setCurrentPreset] = useState<{index: number, note: string} | null>(null);

  

  const handleBackward = (currCycle: number) => {
    if (currCycle > 0) {
      setCurrCycle(currCycle - 1);
    }
  };

  // sends terminal code to multiCycle using fetch
  const handleExecute = async (preset: number) => {
    const newCycle = currCycle + 1;
    setCurrCycle(newCycle)
    const data = handlePipeLinePreset(preset)
    setResults(data)
    if (currCycle >= data[data.length - 1].cycle){
      setCurrCycle(0)
    }

    localStorage.setItem("pipelineDiagram", JSON.stringify(data));
    localStorage.setItem("currCycle", JSON.stringify(newCycle%(data[data.length - 1].cycle +1)));
    
  };
  

  // resets and clears everything
  const handleReset = () => {
    setResults([]);
    setCurrCycle(-1);
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
          Module 3: 5-Stage Pipeline Processor
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
                <PipelineTerminal
                    code={code}
                    onCodeChange={setCode}
                    onExecute={handleExecute}
                    onBackward={handleBackward}
                    onReset={handleReset}
                    currCycle={currCycle}
                    onPresetChange={setCurrentPreset}
                />
                </div>

                <div className="flex-1 overflow-auto bg-white pb-[50px] p-5">
                    <PipelineProcessor results={results} currCycle={currCycle} currentPreset={currentPreset}/>
                </div>
            </Card>
        </div>
    </main>
  );
}