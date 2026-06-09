"use client";

import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../../../components/Card'
import dynamic from "next/dynamic";
import { getSavedProgress, computeProgress, saveProgress } from '@/app/progressConfig';
import { InfoNote } from "@/components/InfoNote";
import PipelineProcessor from "@/components/pipeline/PipelineProcessor";
import { PipelineState } from "../../../src/utils/pipeline-types"
import { handlePipeLinePreset } from "@/src/utils/pipeline-processor";
import { pipelineConfig } from '@/app/moduleConfigs';

// dynamically import so it only runs client-side -> ssr is server-side render
const PipelineTerminal = dynamic(
  () => import("../../../components/pipeline/PipelineTerminal"),
  { ssr: false }
);

export type TabId = 'overview' | 'stages' | 'timing' | 'simulation';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: '1. Pipeline overview' },
  { id: 'stages', label: '2. Five stages' },
  { id: 'timing', label: '3. Timing and registers' },
  { id: 'simulation', label: '4. Interactive simulation' },
];

export default function PipelineModule() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [progress, setProgress] = useState(() => getSavedProgress(pipelineConfig));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getSavedProgress(pipelineConfig));
  }, []);

  const progressValue = useMemo(
    () => (mounted ? computeProgress(pipelineConfig, progress) : 0),
    [progress, mounted]
  );

  const currentComplete = progress[activeTab] ?? false;

  function markSectionComplete() {
    const updated = { ...progress, [activeTab]: !currentComplete };
    setProgress(updated);
    saveProgress(pipelineConfig, updated);
  }

  const [code, setCode] = useState<string>("add x1, x1, x2\n");
  const [results, setResults] = useState<PipelineState[]>([]);
  const [currCycle, setCurrCycle] = useState(-1);
  const [currentPreset, setCurrentPreset] = useState<{ index: number; note: string } | null>(null);

  const handleBackward = (currCycle: number) => {
    if (currCycle > 0) {
      setCurrCycle(currCycle - 1);
    }
  };

  const handleExecute = async (preset: number) => {
    const newCycle = currCycle + 1;
    setCurrCycle(newCycle);
    const data = handlePipeLinePreset(preset);
    setResults(data);

    if (currCycle >= data[data.length - 1].cycle) {
      setCurrCycle(0);
    }

    localStorage.setItem("pipelineDiagram", JSON.stringify(data));
    localStorage.setItem("currCycle", JSON.stringify(newCycle % (data[data.length - 1].cycle + 1)));
  };

  const handleReset = () => {
    setResults([]);
    setCurrCycle(-1);
  };

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

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Module 3: 5-Stage Pipeline Processor
        </h1>

        <div className="mb-8 rounded-3xl border border-gray-200 bg-slate-50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Module progress</p>
              <p className="text-sm text-gray-500">Complete each section to track your pipeline understanding.</p>
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

        {activeTab === 'overview' && (
          <>
            <Card variant="concept" title="Why pipelining matters">
              <p className="text-sm text-gray-700 leading-relaxed">
                Pipelining lets a processor work on several instructions at once by overlapping the hardware stages for different instructions.
                Instead of waiting for one instruction to finish before starting the next, the CPU keeps the pipeline full so each stage is busy every cycle.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-3">
                The ideal benefit is higher instruction throughput: after the pipeline fills, one instruction can complete on every clock cycle.
                This increases completed instructions per second without making any individual instruction itself execute in fewer stages.
              </p>
              <InfoNote>
                In a perfect pipeline, five different instructions can occupy the five stages simultaneously. Practical pipelines still need to handle control and data interactions.
              </InfoNote>
            </Card>

            <Card variant="worked" title="Washing-machine analogy">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <img
                    src="/images/pipeline-washing-slide.svg"
                    alt="Pipelined laundry slide"
                    className="w-full rounded border"
                  />
                </div>

                <div>
                  <ul className="list-disc ml-6 text-sm text-gray-700 space-y-3">
                    <li><strong>Completing a load</strong> requires four steps (load, add detergent, wash, rinse/spin).</li>
                    <li><strong>Different hardware</strong> is used for each step (e.g., washer, dispenser, rinse, spinner).</li>
                    <li><strong>Overlap for throughput:</strong> by starting new loads before earlier ones finish, the hardware stays busy and throughput increases.</li>
                  </ul>

                  <div className="mt-4 text-sm text-gray-600">
                    This maps directly to the 5-stage pipeline (IF, ID, EX, MEM, WB): each load progresses through stages and different loads can occupy different stages concurrently.
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'stages' && (
          <Card variant="concept" title="The five pipeline stages">
            <p className="text-sm text-gray-700 leading-relaxed">
              A standard 5-stage processor divides execution into sequential pieces: instruction fetch, decode, execute, memory access, and write-back.
              Each stage completes a focused task in one cycle and passes state to the next stage through a pipeline register.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                {
                  title: 'IF: Instruction Fetch',
                  body: 'Read the next instruction from instruction memory using the program counter (PC).',
                },
                {
                  title: 'ID: Instruction Decode',
                  body: 'Decode opcode and operand fields, read register data, and generate control signals.',
                },
                {
                  title: 'EX: Execute',
                  body: 'Perform ALU operations, compute branch targets, or calculate memory addresses.',
                },
                {
                  title: 'MEM: Memory Access',
                  body: 'Read from or write to data memory for load/store instructions.',
                },
                {
                  title: 'WB: Write Back',
                  body: 'Write the ALU result or loaded data back into the register file.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'timing' && (
          <Card variant="worked" title="Timing, registers, and throughput">
            <p className="text-sm text-gray-700 leading-relaxed">
              Each stage in the pipeline must finish its work in a single clock cycle. The clock period is set by the slowest stage plus the latency added by pipeline registers.
              Splitting the datapath into stages usually lets the processor run at a higher clock frequency than a single-cycle design.
            </p>
            <div className="mt-4 space-y-3">
              {[
                {
                  label: 'Pipeline registers',
                  detail: 'Hold intermediate values between stages so each stage can operate independently every cycle.',
                },
                {
                  label: 'Overlap and throughput',
                  detail: 'While one instruction is in MEM, the next can be in EX, the following in ID, and a new instruction in IF.',
                },
                {
                  label: 'Clock period versus latency',
                  detail: 'A pipelined processor generally has lower latency per stage but each instruction still passes through all five stages.',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{item.label}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
            <InfoNote>
              A fully ideal pipeline is disrupted by hazards. We only mention hazards briefly here; the next module dives into hazard detection and resolution.
            </InfoNote>
          </Card>
        )}

        {activeTab === 'simulation' && (
          <Card variant="simulation" title="Pipeline visualizer">
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
              <PipelineProcessor results={results} currCycle={currCycle} currentPreset={currentPreset} />
            </div>
          </Card>
        )}

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
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
              {currentComplete ? '✓ Section complete' : 'Mark section complete'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
