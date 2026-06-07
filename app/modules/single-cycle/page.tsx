"use client";

import { useState, useEffect} from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../../../components/Card'
import dynamic from "next/dynamic";
import { returnPath,  JsonResponse} from '../../../src/utils/single-processor';
import  SingleProcessor from '@/components/single-cycle/SingleCycle';
import { InfoNote } from "@/components/InfoNote";
import { PracticeQuestion } from "../../../components/PracticeQuestion";
import { singleCycleConfig } from '@/app/moduleConfigs';

const Terminal = dynamic(
  () => import('../../../components/single-cycle/Terminal'),
  { ssr: false }
);

export default function SingleCycleModule() {
  const SCROLL_KEY = 'singleCycleScrollProgress';

  const [scrollProgress, setScrollProgress] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(SCROLL_KEY) ?? 0);
  });

  useEffect(() => {
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

        {/* ── Concept: What is a single-cycle processor? ── */}
        <Card variant="concept" title="What is a single-cycle processor?">
          <p className="text-sm text-gray-700 leading-relaxed">
            A <strong>single-cycle processor</strong> completes every instruction in exactly one
            clock cycle. The PC is sent to instruction memory, registers are read, the ALU
            computes a result or address, data memory is optionally accessed, and the result is
            written back — all before the next clock edge.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-3">
            Because every step must finish within one cycle, the clock period is fixed by the{' '}
            <strong>slowest possible instruction</strong>. Faster instructions simply wait — there
            is no way to give them a shorter cycle.
          </p>
        </Card>

        {/* ── Concept: The key hardware blocks ── */}
        <Card variant="concept" title="The key hardware blocks">
          <p className="text-sm text-gray-700 leading-relaxed">
            The datapath is built from a small set of functional units that are wired together and
            steered by control signals. Each unit does exactly one thing per cycle.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              {
                name: 'PC',
                body: 'Holds the address of the current instruction. Updated to PC + 4 every cycle, or to a branch target when a branch is taken.',
              },
              {
                name: 'Instruction memory',
                body: 'Read-only during execution. Receives the PC and outputs the 32-bit instruction word for that address.',
              },
              {
                name: 'Register file',
                body: 'Holds 32 general-purpose registers. Reads two source registers (rs1, rs2) and can write to one destination register (rd) in the same cycle.',
              },
              {
                name: 'ALU',
                body: 'Performs arithmetic and logic operations (add, sub, AND, OR). Also computes memory addresses for loads/stores and evaluates branch conditions.',
              },
              {
                name: 'Data memory',
                body: 'Separate from instruction memory. Loads read from it; stores write to it. R-type and branch instructions leave it idle.',
              },
              {
                name: 'Immediate generator (Imm Gen)',
                body: 'Extracts and sign-extends the immediate field from the instruction word, producing a 32-bit value for the ALU or branch adder.',
              },
            ].map(({ name, body }) => (
              <div key={name} className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">{name}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <InfoNote>
            Instruction memory and data memory must be <strong>separate</strong> — each datapath
            element can only do one thing per cycle, so a single combined memory could not supply
            an instruction and service a load/store simultaneously.
          </InfoNote>
        </Card>

        {/* ── Concept: Multiplexers and control signals ── */}
        <Card variant="concept" title="Multiplexers and control signals">
          <p className="text-sm text-gray-700 leading-relaxed">
            Different instructions need different data to flow through the same hardware. Because
            wires cannot simply be joined together, <strong>multiplexers (muxes)</strong> are
            placed wherever two sources compete for the same input. The control unit reads the
            opcode and asserts the right control signals to steer data through the correct path, as stated below.
          </p>
          <div className="mt-4 space-y-3">
            {[
              { signal: 'RegWrite',  effect: 'Enables writing the ALU or memory result back to rd in the register file.' },
              { signal: 'ALUSrc',    effect: 'Selects whether the ALU\'s second input comes from rs2 (R-type) or the sign-extended immediate (I/S-type).' },
              { signal: 'MemRead',   effect: 'Enables a read from data memory (lw). Must be 0 for all other instructions.' },
              { signal: 'MemWrite',  effect: 'Enables a write to data memory (sw). Must be 0 for all other instructions.' },
              { signal: 'MemtoReg',  effect: 'Selects whether the value written to rd comes from the ALU result or from data memory.' },
              { signal: 'Branch',    effect: 'Combined with the ALU Zero output to decide whether to update PC to the branch target or to PC + 4 (PCSrc mux).' },
            ].map(({ signal, effect }) => (
              <div key={signal} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span className="w-28 shrink-0 font-mono font-semibold text-gray-800">{signal}</span>
                <span className="text-gray-600 leading-relaxed">{effect}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Concept: How instructions differ in hardware usage ── */}
        <Card variant="concept" title="How instructions use the datapath differently">
          <p className="text-sm text-gray-700 leading-relaxed">
            This module covers a reduced RISC-V subset: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">lw</code>,{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">sw</code>,{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">add</code>,{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">sub</code>,{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">and</code>,{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">or</code>, and{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">beq</code>.
            Even within this small set, each instruction takes a distinct path through the hardware.
          </p>
          <div className="mt-4 space-y-3">
            {[
              {
                type: 'R-type  (add, sub, and, or)',
                path: 'Reads rs1 and rs2 → ALU operates → result written to rd. Data memory is unused.',
              },
              {
                type: 'Load  (lw)',
                path: 'Reads rs1 → ALU adds sign-extended immediate to compute address → data memory read → result written to rd. Longest path in the whole datapath.',
              },
              {
                type: 'Store  (sw)',
                path: 'Reads rs1 (base) and rs2 (data) → ALU computes address → data memory written. No register write-back.',
              },
              {
                type: 'Branch  (beq)',
                path: 'Reads rs1 and rs2 → ALU subtracts and checks Zero output → a separate adder computes PC + sign-extended offset. PCSrc mux chooses the new PC. No memory access, no register write.',
              },
            ].map(({ type, path }) => (
              <div key={type} className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">{type}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{path}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Worked example: critical path and clock period ── */}
        <Card variant="worked" title="The critical path determines the clock period">
          <p className="text-sm text-gray-700 leading-relaxed">
            The clock period must be long enough for every signal to propagate through the longest
            possible chain of hardware — the <strong>critical path</strong>. For the single-cycle
            datapath that path runs through a load instruction:
          </p>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 mt-4 font-mono text-sm space-y-1">
            {[
              ['I-Mem',     '250 ps', 'fetch instruction'],
              ['Reg read',  ' 30 ps', 'read rs1'],
              ['ALU',       '200 ps', 'compute address'],
              ['D-Mem',     '250 ps', 'read data memory'],
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
            Alternatively, an R-type instruction only needs about 550 ps, but it still waits the full 750 ps
            because the clock period cannot vary per instruction. This inefficiency is exactly what
            pipelining is designed to fix.
          </p>
        </Card>
      </div>

      <div className="max-w-5xl mx-auto my-0 py-0 px-0">
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

        <div className="max-w-4xl mx-auto px-6 py-0">
          {/* ── Practice Q1 ── */}
          <PracticeQuestion
            title="Question 1 of 2 — control signals for lw"
            prompt={
              <>
                For <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">lw x6, -4(x9)</code>,
                which combination of control signals is correct?
              </>
            }
            options={[
              { label: 'A', text: 'ALUSrc=0, MemRead=1, MemWrite=0, RegWrite=1, MemtoReg=1' ,
                wrongExplanation: 'ALUSrc=0 would send rs2 to the ALU instead of the sign-extended immediate — lw needs the immediate to compute the address.' },
              { label: 'B', text: 'ALUSrc=1, MemRead=1, MemWrite=0, RegWrite=1, MemtoReg=1' },
              { label: 'C', text: 'ALUSrc=1, MemRead=0, MemWrite=1, RegWrite=0, MemtoReg=0',
                wrongExplanation: 'MemWrite=1 and RegWrite=0 describes a store (sw), not a load.' },
              { label: 'D', text: 'ALUSrc=1, MemRead=1, MemWrite=0, RegWrite=1, MemtoReg=0',
                wrongExplanation: 'MemtoReg=0 would route the ALU result (the address) into rd — lw must write the value read from memory, so MemtoReg must be 1.' },
            ]}
            correctLabel="B"
            correctExplanation="lw uses an immediate offset (ALUSrc=1), reads from memory (MemRead=1), never writes to memory (MemWrite=0), writes the loaded value to a register (RegWrite=1), and that value comes from data memory not the ALU (MemtoReg=1)."
            wrongExplanation="Work through each signal: where does the ALU's second input come from? Does this instruction read or write memory? Where does the write-back value come from?"
          />

          {/* ── Practice Q2 ── */}
          <PracticeQuestion
            title="Question 2 of 2 — the critical path"
            prompt="Why must the clock period of a single-cycle processor be set by the slowest instruction rather than the fastest?"
            options={[
              { label: 'A', text: 'The control unit cannot decode fast instructions quickly enough.',
                wrongExplanation: 'Decoding is not the bottleneck — the control unit reads the opcode in parallel with other operations.' },
              { label: 'B', text: 'The register file can only be written once per cycle, creating a bottleneck for all instructions.',
                wrongExplanation: 'The register file write is a fixed-cost step, not the reason the period is set by the slowest path.' },
              { label: 'C', text: 'Every instruction shares the same clock edge; the period must be long enough for all signals to settle on the worst-case path.' },
              { label: 'D', text: 'Faster instructions need more clock cycles to complete, so the period must be longer.',
                wrongExplanation: 'It\'s the opposite — faster instructions finish sooner but still wait for the next clock edge.' },
            ]}
            correctLabel="C"
            correctExplanation="All instructions are clocked by the same edge. If the period were any shorter than the longest path (the load instruction's ~750 ps), signals on that path would not have settled and the result written to the register file would be incorrect."
            wrongExplanation="Think about what the clock edge does — it captures the output of every combinational path simultaneously. What happens if one path hasn't finished propagating?"
          />
        </div>
    </main>
  );
}