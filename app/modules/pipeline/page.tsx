"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../../../components/Card'
import dynamic from "next/dynamic";
import { InfoNote } from "@/components/InfoNote";
import PipelineProcessor from "@/components/pipeline/PipelineProcessor";
import PipelineQuiz from "@/components/pipeline/PipelineQuiz";
import { PipelineState } from "../../../src/utils/pipeline-types"
import { handlePipeLinePreset } from "@/src/utils/pipeline-processor";
import { recordAnalyticsVisit } from '@/src/utils/analytics';

// dynamically import so it only runs client-side -> ssr is server-side render
const PipelineTerminal = dynamic(
  () => import("../../../components/pipeline/PipelineTerminal"),
  { ssr: false }
);

export type TabId = 'overview' | 'simulation';

type QuizOption = {
  label: string;
  feedback: string;
  correct: boolean;
};

type QuizQuestion = {
  prompt: string;
  options: QuizOption[];
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: '1. Pipeline overview' },
  { id: 'simulation', label: '2. Interactive simulation' },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    prompt: 'Why does a pipelined processor often complete one instruction per clock cycle once it is full?',
    options: [
      {
        label: 'Each instruction uses only one stage, so the processor is always finished after one cycle.',
        feedback: 'Not quite. Each instruction still passes through all five stages, but different instructions overlap across stages.',
        correct: false,
      },
      {
        label: 'Different instructions occupy different pipeline stages at the same time, so one instruction can complete every cycle.',
        feedback: 'Correct. The pipeline overlaps work across instructions so a new instruction finishes each cycle after startup.',
        correct: true,
      },
      {
        label: 'The clock speed doubles whenever the pipeline is full, so instructions complete faster.',
        feedback: 'No. The clock speed is determined by the slowest stage, not by how full the pipeline is.',
        correct: false,
      },
    ],
  },
  {
    prompt: 'What does the IF/ID register do in a 5-stage pipeline?',
    options: [
      {
        label: 'It stores the current instruction and PC so the decode stage can use them in the next cycle.',
        feedback: 'Correct. IF/ID passes the fetched instruction and PC information to ID.',
        correct: true,
      },
      {
        label: 'It holds the ALU result until the write-back stage writes it to the register file.',
        feedback: 'That is the role of a later pipeline register, not IF/ID.',
        correct: false,
      },
      {
        label: 'It stores data memory values for the next instruction.',
        feedback: 'No. IF/ID does not handle data memory values; it carries instruction and control data from IF to ID.',
        correct: false,
      },
    ],
  },
];

export default function PipelineModule() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const [code, setCode] = useState<string>("add x1, x1, x2\n");
  const [results, setResults] = useState<PipelineState[]>([]);
  const [currCycle, setCurrCycle] = useState(-1);
  const [currentPreset, setCurrentPreset] = useState<{ index: number; note: string } | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const currentQuiz = QUIZ_QUESTIONS[quizIndex];
  const selectedQuiz = selectedQuizOption !== null ? currentQuiz.options[selectedQuizOption] : null;

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

  const handleNextQuestion = () => {
  setQuizIndex((index) => (index + 1) % QUIZ_QUESTIONS.length);
  setSelectedQuizOption(null);
  setQuizSubmitted(false);
};

  const handlePreviousQuestion = () => {
    setQuizIndex((index) => (index - 1 + QUIZ_QUESTIONS.length) % QUIZ_QUESTIONS.length);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  useEffect(() => {
    recordAnalyticsVisit('pipeline');
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-0 my-0 pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition mb-6"
        >
          <ChevronLeft size={16} />
          All modules
        </Link>

        <h1 className="text-3xl font-medium text-gray-900 mb-6">
          Module 3: 5-Stage Pipeline Processor
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

        {activeTab === 'overview' && (
          <>
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

            <Card variant="practice" title="Quick check: pipeline thinking">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Answer the question, then check the feedback.
                  </p>
                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{currentQuiz.prompt}</p>
                    {currentQuiz.options.map((option, index) => (
                      <label key={option.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-500 transition">
                        <input
                          type="radio"
                          name="pipeline-quiz"
                          checked={selectedQuizOption === index}
                          onChange={() => setSelectedQuizOption(index)}
                          disabled={quizSubmitted}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizSubmitted(true)}
                    disabled={selectedQuizOption === null || quizSubmitted}
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition"
                  >
                    Submit answer
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handlePreviousQuestion}
                      className="inline-flex items-center justify-center rounded-full bg-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-300 transition"
                    >
                      Previous question
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="inline-flex items-center justify-center rounded-full bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition"
                    >
                      Next question
                    </button>
                  </div>
                </div>

                {quizSubmitted && selectedQuiz && (
                  <div className={`rounded-2xl border px-4 py-4 ${selectedQuiz.correct ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
                    <p className="text-sm font-semibold">{selectedQuiz.correct ? 'Good job!' : 'Not quite.'}</p>
                    <p className="mt-2 text-sm leading-relaxed">{selectedQuiz.feedback}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card variant="worked" title="Timing and register handoff">
              <p className="text-sm text-gray-700 leading-relaxed">
                In a pipelined processor, each stage completes part of an instruction in one cycle and passes intermediate values to the next stage through pipeline registers.
                That means the instruction in ID can be decoded while the previous instruction is in EX and the one before it is in MEM.
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900">Pipeline registers keep stages independent</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The IF/ID, ID/EX, EX/MEM, and MEM/WB registers hold values so each stage can start the next cycle without waiting for the previous stage to finish its own work.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900">Steady-state throughput comes from overlap</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    After the pipeline fills, one instruction enters the pipeline each cycle and one completes each cycle. The slowest stage still sets the clock period, but more work is in flight at once.
                  </p>
                </div>
              </div>
              <InfoNote>
                Hover the grey IF/ID, ID/EX, EX/MEM, and MEM/WB registers in the simulator to see short definitions for each stage boundary.
              </InfoNote>
            </Card>
          </>
        )}

        {activeTab === 'simulation' && (
          <>
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

              <div className="flex-1 min-w-0 overflow-auto bg-white pb-[30]">
                <PipelineProcessor results={results} currCycle={currCycle} currentPreset={currentPreset} />
              </div>
            </Card>

            <Card variant="simulation" title="Trace the datapath">
              <div className="flex-1 min-w-0 overflow-auto bg-white pb-[30px]">
                <PipelineQuiz />
              </div>
            </Card>
          </>
        )}

      </div>
    </main>
  );
}
