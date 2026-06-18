"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../../../components/Card'
import dynamic from "next/dynamic";
import { returnPath,  JsonResponse} from '../../../src/utils/single-processor';
import  SingleProcessor from '@/components/single-cycle/SingleCycle';
import SingleCycleQuiz from '@/components/single-cycle/SingleCycleQuiz';
import { singleCycleConfig } from '@/app/moduleConfigs';

const Terminal = dynamic(
  () => import('../../../components/single-cycle/Terminal'),
  { ssr: false }
);

type TabId = 'hardware' | 'mux-control' | 'instruction-paths';

type Tab = {
  id: TabId;
  label: string;
};

type QuizOption = {
  label: string;
  text: string;
};

type QuizQuestion = {
  title: string;
  prompt: ReactNode;
  options: QuizOption[];
  correctLabel: string;
  correctExplanation: ReactNode;
  wrongExplanation: ReactNode;
};

const TABS: Tab[] = [
  { id: 'hardware', label: '1. Hardware Blocks' },
  { id: 'mux-control', label: '2. Muxes & Control Signals' },
  { id: 'instruction-paths', label: '3. Instruction Datapaths' },
];

const HARDWARE_QUESTIONS: QuizQuestion[] = [
  {
    title: 'Question 1 of 6 — Program Counter (PC)',
    prompt: 'What is the main job of the PC in a single-cycle datapath?',
    options: [
      { label: 'A', text: 'Store ALU results for later instructions' },
      { label: 'B', text: 'Hold the address of the current instruction' },
      { label: 'C', text: 'Select between memory and ALU write-back data' },
      { label: 'D', text: 'Sign-extend immediate fields' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. The PC holds the instruction address and normally advances to PC + 4 (or branch target if a branch is taken).',
    wrongExplanation: 'The PC stores instruction addresses, not data values. Each cycle it provides the address to instruction memory, then updates to PC + 4 or a branch target.',
  },
  {
    title: 'Question 2 of 6 — Instruction Memory',
    prompt: 'In this module, what does instruction memory output when given a PC value?',
    options: [
      { label: 'A', text: 'The 32-bit instruction word at that address' },
      { label: 'B', text: 'The ALU result for that instruction' },
      { label: 'C', text: 'The destination register value' },
      { label: 'D', text: 'A branch taken/not-taken flag' },
    ],
    correctLabel: 'A',
    correctExplanation: 'Correct. Instruction memory is read-only during execution and returns the 32-bit instruction at the current PC address.',
    wrongExplanation: 'Instruction memory only fetches instruction bits. It does not compute ALU outputs or branch outcomes.',
  },
  {
    title: 'Question 3 of 6 — Register File',
    prompt: 'Which statement best describes the register file in a single-cycle processor?',
    options: [
      { label: 'A', text: 'It can only read one source register per cycle' },
      { label: 'B', text: 'It reads rs1 and rs2 and may write rd in the same cycle' },
      { label: 'C', text: 'It stores only immediate constants' },
      { label: 'D', text: 'It is only used by load/store instructions' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. The register file provides two read ports (rs1, rs2) and one write port (rd) in the same cycle.',
    wrongExplanation: 'The register file contains general-purpose registers and supports two reads plus one write in a cycle, enabling most datapath operations.',
  },
  {
    title: 'Question 4 of 6 — ALU',
    prompt: 'Besides arithmetic/logic, what other key role does the ALU play?',
    options: [
      { label: 'A', text: 'Fetch instructions from instruction memory' },
      { label: 'B', text: 'Compute memory addresses and evaluate branch comparisons' },
      { label: 'C', text: 'Store branch target addresses permanently' },
      { label: 'D', text: 'Decode opcode bits into control lines' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. The ALU also computes effective addresses for loads/stores and performs compare operations for branches.',
    wrongExplanation: 'The ALU does more than add/sub/logic: it computes effective addresses and branch comparisons used by control flow.',
  },
  {
    title: 'Question 5 of 6 — Data Memory',
    prompt: 'When is data memory active in the reduced single-cycle subset?',
    options: [
      { label: 'A', text: 'For every instruction' },
      { label: 'B', text: 'Only for lw and sw style memory instructions' },
      { label: 'C', text: 'Only for branches' },
      { label: 'D', text: 'Only for R-type ALU operations' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. Data memory is read on loads and written on stores. ALU-only and branch instructions leave it idle.',
    wrongExplanation: 'Data memory is separate from instruction memory and is only used when an instruction explicitly loads/stores data.',
  },
  {
    title: 'Question 6 of 6 — Immediate Generator',
    prompt: 'What does the immediate generator produce?',
    options: [
      { label: 'A', text: 'A 32-bit sign-extended immediate extracted from the instruction' },
      { label: 'B', text: 'The next PC address (PC + 4)' },
      { label: 'C', text: 'The write-back data from memory' },
      { label: 'D', text: 'The branch-taken control bit' },
    ],
    correctLabel: 'A',
    correctExplanation: 'Correct. Imm Gen extracts immediate fields from the instruction format and sign-extends to 32 bits.',
    wrongExplanation: 'Immediate generator logic decodes instruction bits and sign-extends immediates so ALU and branch adders can use them.',
  },
];

const MUX_CONTROL_QUESTIONS: QuizQuestion[] = [
  {
    title: 'Question 1 of 6 — Why muxes exist',
    prompt: 'Why are multiplexers necessary in this datapath?',
    options: [
      { label: 'A', text: 'To make the clock run faster automatically' },
      { label: 'B', text: 'To choose one of multiple candidate data sources for one destination path' },
      { label: 'C', text: 'To increase register count from 32 to 64' },
      { label: 'D', text: 'To replace the control unit' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. A mux resolves competing data sources, letting one hardware path serve many instruction types.',
    wrongExplanation: 'Muxes are selectors. They do not compute values; they choose which value reaches the next block based on control signals.',
  },
  {
    title: 'Question 2 of 6 — ALUSrc',
    prompt: 'What does ALUSrc control?',
    options: [
      { label: 'A', text: 'Whether ALU input B is rs2 or sign-extended immediate' },
      { label: 'B', text: 'Whether PC updates to PC+4 or branch target' },
      { label: 'C', text: 'Whether memory writes are enabled' },
      { label: 'D', text: 'Whether register file write-back happens' },
    ],
    correctLabel: 'A',
    correctExplanation: 'Correct. ALUSrc chooses the ALU second operand: register value for R-type, immediate for I/S-type operations.',
    wrongExplanation: 'ALUSrc is an ALU input selector, not a memory or write-back enable.',
  },
  {
    title: 'Question 3 of 6 — MemRead and MemWrite',
    prompt: 'Which signal pair is correct for a store instruction (sw)?',
    options: [
      { label: 'A', text: 'MemRead=1, MemWrite=0' },
      { label: 'B', text: 'MemRead=0, MemWrite=1' },
      { label: 'C', text: 'MemRead=1, MemWrite=1' },
      { label: 'D', text: 'MemRead=0, MemWrite=0' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. sw writes to data memory, so MemWrite=1 and MemRead=0.',
    wrongExplanation: 'MemRead enables memory output (loads). MemWrite enables storing register data into memory (stores).',
  },
  {
    title: 'Question 4 of 6 — MemtoReg',
    prompt: 'What does MemtoReg decide?',
    options: [
      { label: 'A', text: 'Whether ALU does add or subtract' },
      { label: 'B', text: 'Whether rd receives ALU result or memory read data' },
      { label: 'C', text: 'Whether branch comparison is enabled' },
      { label: 'D', text: 'Whether instruction memory is read' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. MemtoReg controls the write-back mux source for rd: ALU output or data memory output.',
    wrongExplanation: 'MemtoReg only affects register write-back source, especially critical for load instructions.',
  },
  {
    title: 'Question 5 of 6 — RegWrite',
    prompt: 'Which instruction type should typically have RegWrite = 0?',
    options: [
      { label: 'A', text: 'R-type arithmetic instruction' },
      { label: 'B', text: 'lw' },
      { label: 'C', text: 'sw' },
      { label: 'D', text: 'addi' },
    ],
    correctLabel: 'C',
    correctExplanation: 'Correct. sw writes to memory, not to a destination register, so RegWrite is 0.',
    wrongExplanation: 'RegWrite only enables writing rd. Store instructions do not write rd, so RegWrite must be disabled.',
  },
  {
    title: 'Question 6 of 6 — Branch control',
    prompt: 'How is a branch decision made in this datapath?',
    options: [
      { label: 'A', text: 'MemRead AND MemWrite' },
      { label: 'B', text: 'RegWrite OR MemtoReg' },
      { label: 'C', text: 'Branch signal combined with ALU comparison result (e.g., Zero)' },
      { label: 'D', text: 'ALUSrc alone' },
    ],
    correctLabel: 'C',
    correctExplanation: 'Correct. Control logic combines Branch with ALU comparison outcome to choose PC+4 or the branch target at the PC mux.',
    wrongExplanation: 'Branch behavior is a control decision using both instruction intent (Branch signal) and comparison result from ALU.',
  },
];

const INSTRUCTION_PATH_QUESTIONS: QuizQuestion[] = [
  {
    title: 'Question 1 of 5 — R-type path',
    prompt: 'Which path best matches an R-type instruction (add/sub/and/or)?',
    options: [
      { label: 'A', text: 'PC -> I-Mem -> Reg file (rs1, rs2) -> ALU -> rd write-back' },
      { label: 'B', text: 'PC -> I-Mem -> Data memory read -> rd write-back' },
      { label: 'C', text: 'PC -> I-Mem -> branch target adder -> memory write' },
      { label: 'D', text: 'PC -> I-Mem -> immediate generator only -> done' },
    ],
    correctLabel: 'A',
    correctExplanation: 'Correct. R-type instructions read two registers, compute in ALU, then write the ALU result to rd.',
    wrongExplanation: 'R-type instructions do not access data memory. They use rs1/rs2 plus ALU, then write back to rd.',
  },
  {
    title: 'Question 2 of 5 — lw path',
    prompt: 'Which sequence describes lw correctly?',
    options: [
      { label: 'A', text: 'Read rs1 -> ALU computes address with immediate -> data memory read -> write rd' },
      { label: 'B', text: 'Read rs1/rs2 -> ALU compare -> branch PC update' },
      { label: 'C', text: 'Read rs2 -> data memory write only' },
      { label: 'D', text: 'ALU result written directly to memory' },
    ],
    correctLabel: 'A',
    correctExplanation: 'Correct. lw uses base+offset addressing, reads memory at that address, then writes the loaded data to rd.',
    wrongExplanation: 'lw requires address generation and memory read before register write-back; this is the longest path in the single-cycle datapath.',
  },
  {
    title: 'Question 3 of 5 — sw path',
    prompt: 'What is true for sw in this datapath?',
    options: [
      { label: 'A', text: 'RegWrite=1 because result goes to rd' },
      { label: 'B', text: 'It writes rs2 data to memory at address from rs1 + immediate' },
      { label: 'C', text: 'It reads data memory and writes that to rd' },
      { label: 'D', text: 'It ignores ALU completely' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. sw computes an address with ALU and writes register data into data memory; no register write-back occurs.',
    wrongExplanation: 'sw uses ALU for address and data memory for write. RegWrite remains 0 because rd is not updated.',
  },
  {
    title: 'Question 4 of 5 — beq path',
    prompt: 'Which statement is correct for beq?',
    options: [
      { label: 'A', text: 'beq reads memory and writes to rd' },
      { label: 'B', text: 'beq compares rs1 and rs2, then selects PC+4 or branch target' },
      { label: 'C', text: 'beq uses MemtoReg to select write-back source' },
      { label: 'D', text: 'beq always takes the branch regardless of comparison' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. beq subtracts/compares register values in ALU, then control selects next PC from either sequential or branch target.',
    wrongExplanation: 'beq is control-flow only: compare operands, decide next PC. No data memory access and no register write-back.',
  },
  {
    title: 'Question 5 of 5 — Why critical path matters',
    prompt: 'Why does a single-cycle CPU use the slowest instruction to set clock period?',
    options: [
      { label: 'A', text: 'Because each instruction gets its own variable clock' },
      { label: 'B', text: 'Because all instructions share one clock edge, and worst-case path must settle in time' },
      { label: 'C', text: 'Because ALU operations are always slower than memory' },
      { label: 'D', text: 'Because branch instructions require two cycles' },
    ],
    correctLabel: 'B',
    correctExplanation: 'Correct. In single-cycle design every instruction must complete before the same clock edge, so clock period must cover worst-case propagation delay.',
    wrongExplanation: 'Single-cycle processors do not vary cycle length per instruction. The clock must be long enough for the critical path (often lw) to finish safely.',
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

export default function SingleCycleModule() {
  const SCROLL_KEY = 'singleCycleScrollProgress';

  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    setScrollProgress(Number(localStorage.getItem(SCROLL_KEY) ?? 0));

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

      setScrollProgress(pct);
      localStorage.setItem(SCROLL_KEY, String(pct));
      window.dispatchEvent(new Event(singleCycleConfig.eventName));
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [code, setCode] = useState<string>("add x28, x6, x7\n");
  const [results, setResults] = useState<JsonResponse | null | undefined>();
  const [activeTab, setActiveTab] = useState<TabId>('hardware');

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
      <div className="max-w-4xl mx-auto px-6 py-0 my-0 pt-12">
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

        {activeTab === 'hardware' && (
          <PracticeBlock
            title="Practice: Core hardware blocks"
            description="Answer questions about the PC, instruction memory, register file, ALU, data memory, and immediate generator. Wrong-answer feedback reteaches each block definition."
            questions={HARDWARE_QUESTIONS}
            name="single-cycle-hardware-quiz"
          />
        )}

        {activeTab === 'mux-control' && (
          <PracticeBlock
            title="Practice: Multiplexers and control signals"
            description="Practice how muxes route data and how control signals (ALUSrc, MemRead, MemWrite, MemtoReg, RegWrite, Branch) steer execution paths."
            questions={MUX_CONTROL_QUESTIONS}
            name="single-cycle-mux-control-quiz"
          />
        )}

        {activeTab === 'instruction-paths' && (
          <>
            <PracticeBlock
              title="Practice: How instructions use the datapath"
              description="Work through R-type, load, store, and branch path behavior. Feedback explains exactly which units are active for each instruction family."
              questions={INSTRUCTION_PATH_QUESTIONS}
              name="single-cycle-instruction-paths-quiz"
            />

            <Card variant="worked" title="The critical path determines the clock period">
              <p className="text-sm text-gray-700 leading-relaxed">
                The clock period must be long enough for every signal to propagate through the longest
                possible chain of hardware — the <strong>critical path</strong>. For the single-cycle
                datapath that path runs through a load instruction:
              </p>
              <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 mt-4 font-mono text-sm space-y-1">
                {[
                  ['I-Mem', '250 ps', 'fetch instruction'],
                  ['Reg read', ' 30 ps', 'read rs1'],
                  ['ALU', '200 ps', 'compute address'],
                  ['D-Mem', '250 ps', 'read data memory'],
                  ['Reg setup', ' 20 ps', 'write result to rd'],
                ].map(([unit, time, note]) => (
                  <div key={unit} className="flex gap-3 leading-7">
                    <span className="w-24 shrink-0 text-indigo-700">{unit}</span>
                    <span className="w-16 shrink-0 text-gray-800">{time}</span>
                    <span className="text-gray-500 text-xs self-center">{note}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex gap-3 font-semibold">
                  <span className="w-24 shrink-0 text-gray-900">Total</span>
                  <span className="w-16 shrink-0 text-gray-900">750 ps</span>
                  <span className="text-gray-500 text-xs self-center font-normal">minimum clock period</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mt-4">
                An R-type instruction only needs around 550 ps, but still waits for the 750 ps cycle.
                This mismatch is why pipelining improves throughput.
              </p>
            </Card>

            <div className="max-w-5xl mx-auto my-0 py-0 px-0">
              <Card variant="simulation" title="Instruction visualizer">
                <div className="flex-none relative bottom-[10px]">
                  <Terminal
                    code={code}
                    onCodeChange={setCode}
                    onExecute={handleExecute}
                    onReset={handleReset}
                  />
                </div>

                <div className="flex-1 overflow-auto bg-white pb-[50px]">
                  <SingleProcessor results={results} />
                </div>
              </Card>
            </div>

            <div className="max-w-5xl mx-auto my-0 py-0 px-0">
              <Card variant="simulation" title="Trace the datapath">
                <div className="p-0">
                  <p className="text-sm text-gray-600 mb-4">
                    For each instruction below, click every path segment on the diagram
                    that carries a signal during execution — one step at a time.
                  </p>
                  <SingleCycleQuiz />
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}