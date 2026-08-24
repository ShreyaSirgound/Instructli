"use client";

import React, { useState, useCallback } from "react";
import type { DataPath } from "../../src/utils/return-types";
import DatapathSVG from "./DatapathSVG";
import { recordActivityOutcome } from "../../src/utils/analytics";

type QuizQuestion = {
  label: string;
  activeSegments: (keyof DataPath)[];
};

const QUESTIONS: QuizQuestion[] = [
  {
    label: "add x28, x6, x7",
    activeSegments: [
      "mux_pc", "pc_increment", "pc_default",
      "im_reg1", "im_reg2", "im_reg_write",
      "reg1_mux", "reg2_mux", "mux_alu",
      "alu_res_mux", "reg_write",
    ],
  },
  {
    label: "lw x6, 4(x9)",
    activeSegments: [
      "mux_pc", "pc_increment", "pc_default",
      "im_reg1", "im_reg_write", "im_imm_gen",
      "reg1_mux", "imm_gen_mux", "mux_alu",
      "alu_res_mem", "dm_mux", "reg_write",
    ],
  },
  {
    label: "sw x9, 4(x18)",
    activeSegments: [
      "mux_pc", "pc_increment", "pc_default",
      "im_reg1", "im_reg2", "im_imm_gen",
      "reg1_mux", "reg2_dm", "imm_gen_mux", "mux_alu",
      "alu_res_mem",
    ],
  },
  {
    label: "beq x28, x27, 8",
    activeSegments: [
      "mux_pc", "pc_increment", "pc_default", "pc_add",
      "im_reg1", "im_reg2", "im_imm_gen",
      "reg1_mux", "reg2_mux", "imm_gen_shift", "imm_gen_mux",
      "zero", "branch_taken",
    ],
  },
  {
    label: "addi x7, x6, 5",
    activeSegments: [
      "mux_pc", "pc_increment", "pc_default",
      "im_reg1", "im_reg_write", "im_imm_gen",
      "reg1_mux", "imm_gen_mux", "mux_alu",
      "alu_res_mux", "reg_write",
    ],
  },
];

const SEGMENT_LABELS: Partial<Record<keyof DataPath, string>> = {
  pc_default:    "PC → Instr Mem",
  pc_increment:  "PC → Add 4",
  pc_add:        "PC → Branch Adder",
  mux_pc:        "MUX → PC (next)",
  branch_taken:  "Branch taken path",
  im_reg1:       "Instr Mem → Reg 1",
  im_reg2:       "Instr Mem → Reg 2",
  im_reg_write:  "Instr Mem → Write Reg",
  im_imm_gen:    "Instr Mem → Imm Gen",
  imm_gen_mux:   "Imm Gen → ALU MUX",
  imm_gen_shift: "Imm Gen → Shift Left",
  reg1_mux:      "Reg Data 1 → ALU",
  reg2_mux:      "Reg Data 2 → MUX",
  reg2_dm:       "Reg Data 2 → Data Mem",
  mux_alu:       "ALU MUX → ALU",
  zero:          "ALU Zero → AND gate",
  alu_res_mem:   "ALU Result → Data Mem",
  alu_res_mux:   "ALU Result → WB MUX",
  dm_mux:        "Data Mem → WB MUX",
  reg_write:     "WB MUX → Reg Write",
};

const SELECTABLE_KEYS = Object.keys(SEGMENT_LABELS) as (keyof DataPath)[];

function makeGetColour(
  selected: Set<keyof DataPath>,
  correct: Set<keyof DataPath>,
  submitted: boolean
) {
  return (key: keyof DataPath): string => {
    const isSelected = selected.has(key);
    const isCorrect  = correct.has(key);

    if (!submitted) return isSelected ? "#2563eb" : "#000000";
    if (isCorrect && isSelected)  return "#16a34a";
    if (!isCorrect && isSelected) return "#dc2626";
    if (isCorrect && !isSelected) return "#f59e0b";
    return "#000000";
  };
}

function buildHoverText(label: string | null, question: QuizQuestion): string | null {
  if (!label) return null;

  switch (label) {
    case "PC":
      return `PROGRAM COUNTER (PC)\nHolds the address of the current instruction being executed.`;
    case "INSTRUCTION MEMORY":
      return `INSTRUCTION MEMORY\nStores all program instructions and outputs the instruction at the given address.`;
    case "REGISTER FILE":
      return `REGISTER FILE\nStores CPU registers (x0–x31). Allows simultaneous reading of two registers and writing one register per cycle.`;
    case "IMMEDIATE GENERATOR":
      return `IMMEDIATE GENERATOR\nExtracts the 12-bit immediate field from the instruction and sign-extends it to 32 bits.`;
    case "ALU":
      return `ARITHMETIC LOGIC UNIT (ALU)\nPerforms arithmetic (add, subtract) and logical (and, or) operations on two 32-bit operands.`;
    case "DATA MEMORY":
      return `DATA MEMORY\nStores program data (loaded by lw, stored by sw). Allows reading and writing in a single cycle.`;
    case "ADD (PC + 4)":
      return `ADDER (PC + 4)\nComputes the next sequential program counter value by adding 4 to the current PC.`;
    case "ADD (Branch Target)":
      return `ADDER (Branch Target)\nComputes the branch target address by adding the sign-extended immediate to the PC.`;
    case "MUX (Next PC)":
      return `MULTIPLEXER (Next PC)\nSelects between the sequential PC (PC+4) or branch target address based on the branch condition.`;
    case "MUX (ALU Input)":
      return `MULTIPLEXER (ALU Input)\nSelects the second operand for the ALU: either a register value or the immediate value.`;
    case "MUX (Write Back)":
      return `MULTIPLEXER (Write Back)\nSelects which value to write back to the register file: ALU result or data from memory.`;
    default:
      return label;
  }
}

export default function SingleCycleQuiz() {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<Set<keyof DataPath>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const question = QUESTIONS[questionIndex];
  const correctSet = new Set(question.activeSegments);

  const handleToggle = useCallback((key: keyof DataPath) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, [submitted]);

  const handleSubmit = () => {
    if (selected.size === 0) return;
    const hits = [...selected].filter((k) => correctSet.has(k)).length;
    const wrong = selected.size - hits;
    const missed = question.activeSegments.filter((k) => !selected.has(k)).length;
    const earned = Math.max(0, hits - wrong - missed);
    const outcome = earned >= question.activeSegments.length ? 'correct' : wrong > 0 ? 'incorrect' : 'partial';
    setTotalScore((s) => s + earned);
    setAnswered((a) => a + 1);
    setSubmitted(true);
    recordActivityOutcome('single-cycle', 'simulation', outcome, earned, question.activeSegments.length, question.label);
  };

  const handleNext = () => {
    setQuestionIndex((i) => (i + 1) % QUESTIONS.length);
    setSelected(new Set());
    setSubmitted(false);
  };

  const getColour = makeGetColour(selected, correctSet, submitted);

  const hits    = submitted ? [...selected].filter((k) => correctSet.has(k)).length : 0;
  const wrong   = submitted ? selected.size - hits : 0;
  const missed  = submitted ? question.activeSegments.filter((k) => !selected.has(k)).length : 0;
  const perfect = submitted && wrong === 0 && missed === 0;

  return (
    <div className="space-y-4">

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i < questionIndex ? "bg-indigo-400"
                : i === questionIndex ? "bg-indigo-600"
                : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">{questionIndex + 1} / {QUESTIONS.length}</span>
      </div>

      {/* Prompt */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-3">
        <p className="text-sm font-medium text-gray-800">
          Which datapath segments are active when executing:
        </p>
        <code className="mt-1 block text-base font-mono font-medium text-indigo-700">
          {question.label}
        </code>
      </div>

      {/* Diagram */}
      <DatapathSVG
        getColour={getColour}
        onSegmentClick={submitted ? undefined : handleToggle}
        onBlockHover={setActiveBlock}
        hoverContent={activeBlock ? (() => {
            const text = buildHoverText(activeBlock, question);
            return text ? React.createElement(
            "div",
            {
                xmlns: "http://www.w3.org/1999/xhtml",
                style: { fontSize: 12, whiteSpace: "pre-wrap", wordWrap: "break-word" },
            },
            text
            ) : undefined;
        })() : undefined}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-600" /> Selected
        </span>
        {submitted ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-green-600" /> Correct
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-red-600" /> Incorrectly selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-500" /> Missed
            </span>
          </>
        ) : (
          <span className="text-gray-400 italic">Click path segments on the diagram to select them</span>
        )}
      </div>

      {/* Result panel */}
      {submitted && (
        <div className={`rounded-xl border px-5 py-4 text-sm space-y-2 ${
          perfect
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}>
          <p className="font-semibold">
            {perfect
              ? "✓ Perfect! All segments correct."
              : `${hits} of ${question.activeSegments.length} segments correct`}
          </p>
          {wrong > 0 && (
            <p className="text-xs">
              <span className="font-medium text-red-700">{wrong} incorrect</span> — segments you selected that aren't active for this instruction.
            </p>
          )}
          {missed > 0 && (
            <p className="text-xs">
              <span className="font-medium text-amber-700">{missed} missed</span> — active segments you didn't select (shown in orange on the diagram).
            </p>
          )}
          <div className="pt-1 text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1.5">
              Active segments for <code className="font-mono">{question.label}</code>:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {question.activeSegments.map((k) => (
                <span
                  key={k}
                  className={`px-2 py-0.5 rounded-full border text-xs ${
                    selected.has(k)
                      ? "bg-green-100 border-green-400 text-green-800"
                      : "bg-amber-100 border-amber-400 text-amber-800"
                  }`}
                >
                  {SEGMENT_LABELS[k] ?? k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
        <div className="flex gap-3">
        {!submitted ? (
            <>
            <button
                onClick={handleSubmit}
                disabled={selected.size === 0}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                Check my answer
            </button>
            {selected.size > 0 && (
                <button
                onClick={() => setSelected(new Set())}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:border-gray-500 transition-colors"
                >
                Clear selection
                </button>
            )}
            </>
        ) : (
            <>
            {questionIndex > 0 && (
            <button
                onClick={() => {
                setQuestionIndex((i) => Math.max(0, i - 1));
                setSelected(new Set());
                setSubmitted(false);
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:border-gray-500 transition-colors"
            >
                ← Previous
            </button>
            )}
            <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
                {questionIndex + 1 < QUESTIONS.length ? "Next →" : "Restart quiz"}
            </button>
            </>
        )}
        </div>
    </div>
  );
}