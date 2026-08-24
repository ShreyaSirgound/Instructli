"use client";

import { useState } from "react";
import { recordActivityOutcome } from "../../src/utils/analytics";

type StageName = "IF" | "ID" | "EX" | "MEM" | "WB";
type CellValue = StageName | "stall" | "";

interface Question {
  id: number;
  instructions: string[];
  baseTimeline: CellValue[][];
  correctStallsBefore: number[]; // stalls inserted before row[i]'s first real stage
  explanation: string;
  numCols: number;
}

const STAGE_COLORS: Record<CellValue, { bg: string; border: string; text: string }> = {
  IF:    { bg: "#E6F1FB", border: "#195FA5", text: "#195FA5" },
  ID:    { bg: "#E9F2DD", border: "#3F681B", text: "#3F681B" },
  EX:    { bg: "#EDECFD", border: "#4F4898", text: "#4F4898" },
  MEM:   { bg: "#FAEEDC", border: "#835212", text: "#835212" },
  WB:    { bg: "#E1F5EE", border: "#0F6E56", text: "#0F6E56" },
  stall: { bg: "#f3f4f6", border: "#D9D9D9", text: "#D9D9D9" },
  "":    { bg: "transparent", border: "transparent", text: "transparent" },
};

const PIPELINE: StageName[] = ["IF", "ID", "EX", "MEM", "WB"];

/** Build a no-stall base timeline for n instructions over `cols` columns.
 *  Instruction i starts at column offset i (0-indexed). */
function buildBase(n: number, cols: number): CellValue[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: cols }, (_, c): CellValue => {
      const stageIdx = c - i;
      return stageIdx >= 0 && stageIdx < PIPELINE.length ? PIPELINE[stageIdx] : "";
    })
  );
}

/** Given a base timeline and an array of "stalls inserted before row i",
 *  return the full timeline with stalls inserted and later instructions shifted.
 *  Offsets are cumulative so a stall on L2 also pushes L3, L4, etc. */
function applyStalls(base: CellValue[][], stallsBefore: number[], cols: number): CellValue[][] {
  // cumulative: offset[i] = total stalls from rows 0..i
  const offsets: number[] = [];
  let cumulative = 0;
  for (let i = 0; i < base.length; i++) {
    cumulative += stallsBefore[i];
    offsets.push(cumulative);
  }

  return base.map((row, ri) => {
    const shift = offsets[ri];
    const stallsThisRow = stallsBefore[ri];
    const result: CellValue[] = Array(cols).fill("");
    const baseStart = row.findIndex((c) => c !== "");
    if (baseStart === -1) return result;
    for (let s = 0; s < stallsThisRow; s++) {
      const pos = baseStart + shift - stallsThisRow + s;
      if (pos >= 0 && pos < cols) result[pos] = "stall";
    }
    row.forEach((cell, ci) => {
      if (cell !== "" && ci + shift < cols) result[ci + shift] = cell;
    });
    return result;
  });
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    instructions: [
      "add $t1, $t2, $t3",
      "sub $t4, $t1, $t5",
      "lw  $t6, 0($t7)",
      "and $t8, $t6, $t9",
    ],
    baseTimeline: buildBase(4, 10),
    correctStallsBefore: [0, 1, 0, 0],
    numCols: 10,
    explanation:
      "L2 reads $t1 in ID but L1 is still in EX — a RAW hazard. One stall bubble lets L1 reach MEM so forwarding can supply the value to L2's EX stage.",
  },
  {
    id: 2,
    instructions: [
      "lw  $t0, 0($s0)",
      "add $t1, $t0, $t2",
      "sub $t3, $t1, $t4",
      "or  $t5, $t3, $t6",
    ],
    baseTimeline: buildBase(4, 10),
    correctStallsBefore: [0, 1, 0, 0],
    numCols: 10,
    explanation:
      "L1 is a load (lw) — its result isn't ready until after MEM. L2 needs $t0 in EX before that, so a 1-cycle stall (load-use hazard) must be inserted. L3's dependency on L2 is resolved by forwarding with no extra stall.",
  },
  {
    id: 3,
    instructions: [
      "lw  $s1, 0($s0)",
      "lw  $s2, 4($s0)",
      "add $t0, $s1, $s2",
      "sw  $t0, 8($s0)",
    ],
    baseTimeline: buildBase(4, 10),
    correctStallsBefore: [0, 0, 1, 0],
    numCols: 10,
    explanation:
      "L3 depends on both $s1 (lw L1) and $s2 (lw L2). Without stalls, L3 would enter EX at CC5 while L2's MEM hasn't completed yet. One stall bubble delays L3 (and L4) so both load values are available via forwarding.",
  },
  {
    id: 4,
    instructions: [
      "add $t0, $t1, $t2",
      "add $t3, $t0, $t4",
      "lw  $t5, 0($t3)",
      "sub $t6, $t5, $t7",
    ],
    baseTimeline: buildBase(4, 10),
    correctStallsBefore: [0, 0, 0, 1],
    numCols: 10,
    explanation:
      "L1→L2 and L2→L3 are RAW hazards resolved by forwarding (no stalls needed). L3 is a load, so L4's dependency on $t5 is a load-use hazard — forwarding can't bridge this gap and a 1-cycle stall must be inserted before L4.",
  },
];

export default function HazardsSimulation() {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [stallsBefore, setStallsBefore] = useState<number[]>([0, 0, 0, 0]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const q = QUESTIONS[questionIdx];
  const cols = q.numCols;
  const ccLabels = Array.from({ length: cols }, (_, i) => `CC${i + 1}`);
  const lineLabels = q.instructions.map((_, i) => `L${i + 1}:`);

  // Current displayed timeline
  const timeline = applyStalls(q.baseTimeline, stallsBefore, cols);

  function handleCellClick(row: number, col: number) {
    if (checked && isCorrect) return;
    const cell = timeline[row][col];
    if (cell === "" ) return; // empty cells are not clickable

    setStallsBefore((prev) => {
      const next = [...prev];
      if (cell === "stall") {
        next[row] = Math.max(0, next[row] - 1);
      } else {
        next[row] = next[row] + 1;
      }
      return next;
    });
    setChecked(false);
  }

  function handleCheck() {
    const correct = q.correctStallsBefore.every((v, i) => v === stallsBefore[i]);
    setIsCorrect(correct);
    setChecked(true);
    recordActivityOutcome('hazards', 'simulation', correct ? 'correct' : 'incorrect', correct ? 1 : 0, 1, q.instructions.join(' | '));
  }

  function handleReset() {
    setStallsBefore([0, 0, 0, 0]);
    setChecked(false);
    setIsCorrect(false);
  }

  function handleQuestion(idx: number) {
    setQuestionIdx(idx);
    setStallsBefore([0, 0, 0, 0]);
    setChecked(false);
    setIsCorrect(false);
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${
              i < questionIdx ? "bg-indigo-400" : i === questionIdx ? "bg-indigo-600" : "bg-gray-200"
            }`} />
          ))}
        </div>
        <span className="text-xs text-gray-400">{questionIdx + 1} / {QUESTIONS.length}</span>
      </div>

      <p className="text-gray-500 text-sm mb-5">
        Click any pipeline stage to insert a stall bubble before that instruction. Click a stall to remove it.
      </p>

      {/* Instruction sequence */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-2 mb-6 font-mono text-sm leading-7 overflow-x-auto">
        {q.instructions.map((instr, i) => (
          <div key={i} className="flex gap-5 items-baseline whitespace-nowrap">
            <span className="text-gray-400 select-none w-4 shrink-0">L{i + 1}</span>
            <span className="text-gray-900">{instr}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-sm mb-1">
        Add stall cycles to correct all hazards in the diagram below.
      </p>
      <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3 mt-4">
        Execution Timeline
      </p>

      {/* Check / Reset */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleCheck}
          disabled={checked && isCorrect}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
        >
          Check
        </button>
        <button
          onClick={handleReset}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1.5 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Pipeline table */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-10" />
              {ccLabels.map((cc) => (
                <th
                  key={cc}
                  className="text-center text-xs font-medium text-gray-400 tracking-wider pb-2 px-0.5 min-w-[74px]"
                >
                  {cc}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeline.map((row, ri) => (
              <tr key={ri}>
                <td className="text-xs font-mono text-gray-400 pr-2 text-right whitespace-nowrap">
                  {lineLabels[ri]}
                </td>
                {row.map((cell, ci) => {
                  const isEmpty = cell === "";
                  const isStall = cell === "stall";
                  const colorClass = STAGE_COLORS[cell];
                  return (
                    <td key={ci} className="px-0.5 py-1">
                        <div
                        onClick={() => handleCellClick(ri, ci)}
                        title={
                          isEmpty
                            ? undefined
                            : isStall
                            ? "Click to remove stall"
                            : "Click to insert stall before this instruction"
                        }
                        style={
                            isEmpty
                            ? {}
                            : {
                                backgroundColor: STAGE_COLORS[cell].bg,
                                borderColor: STAGE_COLORS[cell].border,
                                color: STAGE_COLORS[cell].text,
                                }
                        }
                        className={[
                            "rounded-lg border text-center text-xs font-medium py-1.5 min-w-[48px] select-none transition-all duration-200",
                            isEmpty ? "cursor-default opacity-0" : isStall ? "cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-400" : "cursor-pointer hover:opacity-70",
                        ].join(" ")}
                        >
                        {isEmpty ? "\u00a0" : isStall ? "stall" : cell}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback */}
      {checked && (
        <div
          className={`mt-5 rounded-xl p-4 text-sm leading-relaxed ${
            isCorrect
              ? "bg-green-50 border border-green-200 text-green-900"
              : "bg-red-50 border border-red-200 text-red-900"
          }`}
        >
          <p className="font-medium mb-1">
            {isCorrect ? "Correct!" : "Not quite — try again."}
          </p>
          {isCorrect ? (
            <p>{q.explanation}</p>
          ) : (
            <p>
              Check your stall placement. Try clicking on different pipeline stages to shift
              instructions. Click a stall bubble to remove it.
            </p>
          )}
        </div>
      )}
      {/* Navigation */}
      <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
        {questionIdx > 0 && (
          <button
            onClick={() => handleQuestion(questionIdx - 1)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:border-gray-500 transition-colors"
          >
            ← Previous
          </button>
        )}
        <button
          onClick={() =>
            questionIdx + 1 < QUESTIONS.length
              ? handleQuestion(questionIdx + 1)
              : handleQuestion(0)
          }
          className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          {questionIdx + 1 < QUESTIONS.length ? "Next →" : "Restart quiz"}
        </button>
      </div>
    </div>
  );
}