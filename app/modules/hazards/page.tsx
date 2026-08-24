"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../../../components/Card'
import HazardSimulation from "@/components/hazards/HazardsSimulation";
import { recordActivityOutcome } from '@/src/utils/analytics';
import { recordAnalyticsVisit } from '@/src/utils/analytics';

export type TabId = 'overview' | 'simulation';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: '1. Hazards overview' },
  { id: 'simulation', label: '2. Interactive simulation' },
];

type QuizOption = {
  label: string;
  text: string;
};

type QuizQuestion = {
  title: string;
  L1: string;
  L2: string;
  L3: string;
  prompt: ReactNode;
  options: QuizOption[];
  correctLabel: string;
  correctExplanation: ReactNode;
  wrongExplanation: ReactNode;
};

const HAZARD_TYPES_QUESTIONS: QuizQuestion[] = [
  {
    title: 'Question 1 of 6 — Hazard categorization',
    prompt: 'Given the following instruction sequence, identify the kind of hazard and where it is located — assuming no forwarding is implemented.',
    L1: 'add $t0, $t1, $t2',
    L2: 'sub $t3, $t0, $t4',
    L3: 'and $t5, $t6, $t7',
    options: [
      { label: 'A', text: 'Data hazard on L1' },
      { label: 'B', text: 'Structural hazard on L2' },
      { label: 'C', text: 'Data hazard on L2' },
      { label: 'D', text: 'Control hazard on L3' },
    ],
    correctLabel: 'C',
    correctExplanation: 'Correct! L1 writes $t0 in the WB stage (cycle 5), but L2 needs to read $t0 in its ID stage (cycle 3). Without forwarding, L2 reads an un-updated value. This register dependency results in a data hazard located at the dependent instruction (L2).',
    wrongExplanation: 'Take a close look at the registers: L1 modifies a register that a subsequent instruction relies on as an input. Think about which instruction suffers from reading outdated information before the write-back stage can complete, and what category of hazard handles register dependencies.',  
  },    
  {
    title: 'Question 2 of 6 — Hazard categorization',
    prompt: 'Given the following instruction sequence, identify the kind of hazard and where it is located — assuming no forwarding is implemented.',
    L1: 'lw  $t0, 0($s0)',
    L2: 'add $t1, $t0, $t2',
    L3: 'or  $t3, $t4, $t5',
    options: [
      { label: 'A', text: 'Data hazard on L2' },
      { label: 'B', text: 'Control hazard on L2' },
      { label: 'C', text: 'Structural hazard on L1' },
      { label: 'D', text: 'Data hazard on L3' },
    ],
    correctLabel: 'A',
    correctExplanation: "Correct! This is a load-use data hazard. The lw instruction does not retrieve its data until the MEM stage, but L2 requires that value early in the execution pipeline. Because an instruction is consumer-dependent on data still in transit, it creates a data hazard on L2.",
    wrongExplanation: "Consider the dependency on $t0 between the load instruction and the subsequent instruction. If one instruction requires data produced by an immediately preceding memory access, what type of hazard occurs, and which specific line is forced to wait for that value?",
  },
  {
    title: 'Question 3 of 6 — Hazard categorization',
    prompt: 'Given the following instruction sequence, identify the kind of hazard and where it is located — assuming no forwarding is implemented.',
    L1: 'beq $t0, $t1, TARGET',
    L2: 'add $t2, $t3, $t4',
    L3: 'sub $t5, $t6, $t7',
    options: [
      { label: 'A', text: 'Data hazard on L2' },
      { label: 'B', text: 'Structural hazard on L3' },
      { label: 'C', text: 'Control hazard on L1' },
      { label: 'D', text: 'Data hazard on L3' },
    ],
    correctLabel: 'C',
    correctExplanation: "Correct! The beq instruction introduces a branch. The processor cannot confirm the next correct instruction address until the branch condition is fully evaluated. This uncertainty regarding instruction flow is a control hazard that originates right at the branch instruction (L1).",
    wrongExplanation: "Notice that L1 is a conditional branch instruction. Ask yourself how the pipeline handles the uncertainty of which instructions to fetch next before the branch decision is actually made. Which type of hazard deals with program flow changes, and where does that threat originate?",
  },
  {
    title: 'Question 4 of 6 — Hazard categorization',
    prompt: 'Given the following instruction sequence, identify the kind of hazard and where it is located — assuming no forwarding is implemented.',
    L1: 'lw  $t0, 0($s0)',
    L2: 'add $t1, $t2, $t3',
    L3: 'sub $t4, $t5, $t6',
    options: [
      { label: 'A', text: 'Data hazard on L2' },
      { label: 'B', text: 'Structural hazard on L1' },
      { label: 'C', text: 'Control hazard on L3' },
      { label: 'D', text: 'Data hazard on L3' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct! A load instruction requires access to data memory in its MEM stage. In hardware setups featuring a single, shared memory resource for instructions and data, an overlapping instruction fetch (IF stage) concurrent with L1\'s memory phase creates a structural conflict originating at L1.',
    wrongExplanation: "Check the registers closely—none of the instructions share data operands, and there are no branches altering program flow. Instead, consider what happens if a hardware design tries to read an instruction from memory at the same time an active 'lw' instruction is accessing data memory.",
  },
  {
    title: 'Question 5 of 6 — Hazard categorization',
    prompt: 'Given the following instruction sequence, identify the kind of hazard and where it is located — assuming no forwarding is implemented.',
    L1: 'add $t0, $t1, $t2',
    L2: 'add $t3, $t4, $t5',
    L3: 'sub $t6, $t0, $t7',
    options: [
      { label: 'A', text: 'Data hazard on L3' },
      { label: 'B', text: 'Control hazard on L1' },
      { label: 'C', text: 'Structural hazard on L2' },
      { label: 'D', text: 'Data hazard on L1' },
    ],
    correctLabel: 'A',
    correctExplanation: "Correct! L1 updates $t0, and L3 attempts to read $t0 two cycles later. Without forwarding, the value isn't committed back to the register file early enough for L3's decode phase. This register dependency produces a data hazard on the consuming instruction, L3.",
    wrongExplanation: "Trace the path of register $t0 across these instructions. If L1 writes to a destination register and a later instruction tries to read that exact register before the data has been securely written back, what category of hazard is triggered, and which instruction feels the impact?",
  },
  {
    title: 'Question 6 of 6 — Hazard categorization',
    prompt: 'Given the following instruction sequence, identify the kind of hazard and where it is located — assuming no forwarding is implemented.',
    L1: 'bne $s0, $s1, LOOP',
    L2: 'lw  $t0, 0($s2)',
    L3: 'add $t1, $t2, $t3',
    options: [
      { label: 'A', text: 'Strctural hazard on L2' },
      { label: 'B', text: 'Data hazard on L3' },
      { label: 'C', text: 'Control hazard on L1' },
      { label: 'D', text: 'Data hazard on L2' },
    ],
    correctLabel: 'C',
    correctExplanation: "Correct! The conditional branch on L1 means the pipeline cannot determine the true next program counter path until evaluation occurs. This disruption to the linear flow of instruction fetching constitutes a control hazard tied to L1.",
    wrongExplanation: "Look at the type of instruction executing on L1. There are no overlapping data dependencies or resource sharing issues across these lines, but there is a choice to be made regarding execution path. What type of hazard arises when a branch makes the next instruction fetch address uncertain?",
  },
];

function PracticeBlock({
  title,
  description,
  questions,
  name,
}: {
  title: string;
  description: string;
  questions: QuizQuestion[];
  name: string;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[questionIndex];
  const isCorrect = selectedOption === currentQuestion.correctLabel;

  function handleSubmit() {
    setSubmitted(true);
    recordActivityOutcome('hazards', 'question', isCorrect ? 'correct' : 'incorrect', isCorrect ? 1 : 0, 1, currentQuestion.title);
  }

  function handleNext() {
    setQuestionIndex((prev) => (prev + 1) % questions.length);
    setSelectedOption(null);
    setSubmitted(false);
  }

  return (
    <Card variant="practice" title={title}>
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">{description}</p>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">{currentQuestion.title}</p>
            <p className="text-sm text-gray-700">{currentQuestion.prompt}</p>
            <div className="bg-gray-50 rounded-lg border border-gray-200 px-5 py-4 mt-4 mb-4 font-mono text-sm leading-7 overflow-x-auto">
                <div className="flex items-baseline gap-3 whitespace-nowrap">
                <span className="text-gray-400 select-none w-4 shrink-0">L1</span>
                <span className="text-gray-900">{currentQuestion.L1}</span>
                <span className="text-gray-400 ml-4"></span>
                </div>
                <div className="flex items-baseline gap-3 whitespace-nowrap">
                <span className="text-gray-400 select-none w-4 shrink-0">L2</span>
                <span className="text-gray-900">{currentQuestion.L2}</span>
                <span className="text-red-700 ml-4"></span>
                </div>
                <div className="flex items-baseline gap-3 whitespace-nowrap">
                <span className="text-gray-400 select-none w-4 shrink-0">L3</span>
                <span className="text-gray-900">{currentQuestion.L3}</span>
                <span className="text-gray-400 ml-4"></span>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <label key={option.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-500 transition">
              <input
                type="radio"
                name={name}
                checked={selectedOption === option.label}
                onChange={() => setSelectedOption(option.label)}
                disabled={submitted}
                className="h-4 w-4 text-indigo-600"
              />
              <span className="text-sm text-gray-700">
                <strong className="font-semibold">{option.label}.</strong> {option.text}
              </span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedOption === null || submitted}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Submit answer
          </button>
          {submitted && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center rounded-full bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition"
            >
              {questionIndex === questions.length - 1 ? 'Start over' : 'Next question'}
            </button>
          )}
        </div>

        {submitted && (
          <div className={`rounded-2xl border px-4 py-4 ${isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
            <p className="text-sm font-semibold">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
            <div className="mt-2 text-sm leading-relaxed">
              {isCorrect ? currentQuestion.correctExplanation : currentQuestion.wrongExplanation}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function HazardsModule() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    recordAnalyticsVisit('hazards');
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
          Module 5: Hazards and Detection
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
            <Card variant="concept" title="Types of hazards">
              <div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">Hazards occur in pipelined processors when the next instruction in a sequence is prevented from executing in the designated clock-cycle, causing the pipeline to stall or behave inefficently.</p>
                  <p className="text-sm text-gray-700 leading-relaxed mt-4">There are 3 main categorizations for hazards:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mt-2 mb-4 pl-4">
                    <li>Data hazard</li>
                    <li>Structural hazard</li>
                    <li>Control hazard</li>
                  </ol>
                  <p className="text-sm text-gray-700 leading-relaxed">We will explore and gain an intuition for when each of these hazards occur, how to identify them, and how to correct the inefficiency created by them.</p>
                </div>
              </div>
            </Card>

            <Card variant="worked" title="Identifying a data hazard">
              <p className="text-sm text-gray-700 leading-relaxed">
                Given this instruction sequence, the second instruction reads $t1 before the first instruction has written its result back. This is a common data hazard in a 5-stage pipeline.
              </p>
                <div className="bg-gray-50 rounded-lg border border-gray-200 px-5 py-4 mt-4 mb-4 font-mono text-sm leading-7 overflow-x-auto">
                    <div className="flex items-baseline gap-3 whitespace-nowrap">
                    <span className="text-gray-400 select-none w-4 shrink-0">L1</span>
                    <span className="text-gray-900">add $t1, $t2, $t3</span>
                    <span className="text-gray-400 ml-4"># writes $t1 in WB (cycle 5)</span>
                    </div>
                    <div className="flex items-baseline gap-3 whitespace-nowrap">
                    <span className="text-gray-400 select-none w-4 shrink-0">L2</span>
                    <span className="text-gray-900">sub $t4, $t1, $t5</span>
                    <span className="text-red-700 ml-4"># reads $t1 in ID (cycle 3) &lt;--- hazard</span>
                    </div>
                    <div className="flex items-baseline gap-3 whitespace-nowrap">
                    <span className="text-gray-400 select-none w-4 shrink-0">L3</span>
                    <span className="text-gray-900">lw $t6, 0($t1)</span>
                    <span className="text-gray-400 ml-4"># also reads $t1 in ID (cycle 4)</span>
                    </div>
                </div>
              <p className="text-sm text-gray-700 leading-relaxed"> 
                The fix: forwarding passes the result from the EX/MEM register directly to the ALU input, bypassing the register file completely.
              </p>
            </Card>

            <PracticeBlock
                title="Practice: Hazard detection"
                description=""

                questions={HAZARD_TYPES_QUESTIONS}
                name="single-cycle-hardware-quiz"
            />
          </>
        )}

        {activeTab === 'simulation' && (
          <>
            <Card variant="simulation" title="Resolving hazards">
              <div className="flex-none relative bottom-[10px]">
                <HazardSimulation/>
              </div>
            </Card>
          </>
        )}

      </div>
    </main>
  );
}
