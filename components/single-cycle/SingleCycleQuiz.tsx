"use client";

import React, { useState, useCallback } from "react";
import type { DataPath } from "../../src/utils/return-types";
import DatapathSVG from "./DatapathSVG";

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

  // Map each block label to a segment that must be active for it to appear
  const requiredSegment: Partial<Record<string, keyof DataPath>> = {
    "PC":                   "pc_default",
    "INSTRUCTION MEMORY":   "pc_default",
    "REGISTER FILES":        "im_reg1",
    "IMMEDIATE GENERATOR":  "im_imm_gen",
    "ALU":                  "mux_alu",
    "DATA MEMORY":          "alu_res_mem",
    "ADD (PC + 4)":         "pc_increment",
    "ADD (Branch Target)":  "pc_add",
    "MUX (Next PC)":        "mux_pc",
    "MUX (ALU Input)":      "mux_alu",
    "MUX (Write Back)":     "reg_write",
  };

  const required = requiredSegment[label];
  if (required && !question.activeSegments.includes(required)) return null;

  switch (label) {
    case "PC":
      return `PC\n\nHolds the address of the current instruction. After execution, it updates to PC+4 (or a branch target if a branch is taken).`;
    case "INSTRUCTION MEMORY":
      return `INSTRUCTION MEMORY\n\nFetches the instruction at the current PC address. The instruction bits are then routed to the register file, immediate generator, and control unit.`;
    case "REGISTER FILES":
      return `REGISTER FILES\n\nReads up to two source registers and writes a result to the destination register (when RegWrite=1). For "${question.label}", the active read/write ports reflect the instruction's rs1, rs2, and rd fields.`;
    case "IMMEDIATE GENERATOR":
      return `IMMEDIATE GENERATOR\n\nSign-extends the immediate field from the instruction. Active for I-type, S-type, and B-type instructions.`;
    case "ALU":
      return `ALU\n\nPerforms the arithmetic or logic operation. Also produces a Zero signal used by branch instructions to decide whether to take the branch.`;
    case "DATA MEMORY":
      return `DATA MEMORY\n\nRead on load (lw) and written on store (sw). The ALU result is used as the memory address.`;
    case "ADD (PC + 4)":
      return `ADD (PC + 4)\n\nIncrements the PC by 4 to point to the next sequential instruction.`;
    case "ADD (Branch Target)":
      return `ADD (Branch Target)\n\nComputes the branch target address: PC + (immediate << 1). Used when a branch is taken.`;
    case "MUX (Next PC)":
      return `MUX (Next PC)\n\nSelects between PC+4 (no branch) and the branch target (branch taken). Controlled by the AND of Branch and ALU Zero signals.`;
    case "MUX (ALU Input)":
      return `MUX (ALU Input)\n\nSelects between register data 2 (R-type) and the sign-extended immediate (I/S/B-type) as the second ALU operand. Controlled by ALUSrc.`;
    case "MUX (Write Back)":
      return `MUX (Write Back)\n\nSelects whether to write back the ALU result (R/I-type) or data from memory (lw) to the register file. Controlled by MemToReg.`;
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
    setTotalScore((s) => s + earned);
    setAnswered((a) => a + 1);
    setSubmitted(true);
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
        <code className="mt-1 block text-base font-mono font-semibold text-indigo-700">
          {question.label}
        </code>
      </div>

      {/* Diagram */}
      <DatapathSVG
        getColour={getColour}
        onSegmentClick={submitted ? undefined : handleToggle}
        onBlockHover={submitted ? setActiveBlock : undefined}
        hoverContent={submitted && activeBlock ? (() => {
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