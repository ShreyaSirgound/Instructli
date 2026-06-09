"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PathId =
  | "mux_pc"
  | "pc_default"
  | "pc_increment"
  | "pc_add"
  | "im_reg1"
  | "im_reg2"
  | "im_reg_write"
  | "im_imm_gen"
  | "imm_gen_mux"
  | "imm_gen_shift"
  | "reg1_mux"
  | "reg2_mux"
  | "mux_alu"
  | "zero"
  | "alu_res_mem"
  | "alu_res_mux"
  | "reg2_dm"
  | "dm_mux"
  | "reg_write"
  | "branch_taken";

interface QuizStep {
  description: string;
  hint: string;
  paths: PathId[];
}

interface QuizInstruction {
  label: string;
  type: string;
  steps: QuizStep[];
  correctPaths: PathId[];
}

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------

const QUIZ_INSTRUCTIONS: QuizInstruction[] = [
  {
    label: "add x28, x6, x7",
    type: "R-Type",
    correctPaths: [
      "mux_pc", "pc_default", "pc_increment",
      "im_reg1", "im_reg2", "im_reg_write",
      "reg1_mux", "reg2_mux", "mux_alu",
      "alu_res_mux", "reg_write",
    ],
    steps: [
      {
        description: "Select the next PC value via the PC MUX",
        hint: "The PC MUX always feeds a value into the PC register every cycle.",
        paths: ["mux_pc"],
      },
      {
        description: "Compute PC+4 via the default adder and feed it back",
        hint: "The PC goes to the Add-4 adder; the result travels back to the MUX as the default next PC.",
        paths: ["pc_default", "pc_increment"],
      },
      {
        description: "Route instruction fields from instruction memory to the register file",
        hint: "R-type uses rs1, rs2, and rd — three fields leave instruction memory for the register file.",
        paths: ["im_reg1", "im_reg2", "im_reg_write"],
      },
      {
        description: "Send both register read values to the ALU",
        hint: "Read Data 1 goes straight to the ALU; Read Data 2 goes through the ALU-source MUX (port 0), then the MUX output feeds the ALU.",
        paths: ["reg1_mux", "reg2_mux", "mux_alu"],
      },
      {
        description: "Write the ALU result back to the register file",
        hint: "The ALU result bypasses data memory and travels through the write-data MUX to the register file write port.",
        paths: ["alu_res_mux", "reg_write"],
      },
    ],
  },
  {
    label: "lw x6, 4(x9)",
    type: "I-Type",
    correctPaths: [
      "mux_pc", "pc_default", "pc_increment",
      "im_reg1", "im_reg_write", "im_imm_gen",
      "reg1_mux", "imm_gen_mux", "mux_alu",
      "alu_res_mem", "dm_mux", "reg_write",
    ],
    steps: [
      {
        description: "Select the next PC value via the PC MUX",
        hint: "The PC MUX always feeds a value into the PC register every cycle.",
        paths: ["mux_pc"],
      },
      {
        description: "Compute PC+4 and feed it back to the MUX",
        hint: "Sequential execution: PC goes to the Add-4 adder and the result returns to the MUX.",
        paths: ["pc_default", "pc_increment"],
      },
      {
        description: "Route instruction fields from instruction memory",
        hint: "lw uses rs1 (base register) and rd (destination). It does not use rs2. The full instruction word also goes to Imm Gen to extract the offset.",
        paths: ["im_reg1", "im_reg_write", "im_imm_gen"],
      },
      {
        description: "Send base register and sign-extended immediate to the ALU",
        hint: "Read Data 1 (rs1) feeds the ALU directly. The immediate goes through the ALU-source MUX (port 1, ALUSrc=1), then the MUX output feeds the ALU.",
        paths: ["reg1_mux", "imm_gen_mux", "mux_alu"],
      },
      {
        description: "Send the computed address to data memory",
        hint: "The ALU result (base + offset) is the memory address. It goes to the Address input of data memory.",
        paths: ["alu_res_mem"],
      },
      {
        description: "Write the loaded value back to the register file",
        hint: "Data memory outputs the loaded word. It travels through the write-data MUX (port 1, MemtoReg=1) and then to the register file write port.",
        paths: ["dm_mux", "reg_write"],
      },
    ],
  },
  {
    label: "beq x28, x27, 8",
    type: "B-Type",
    correctPaths: [
      "mux_pc", "pc_default", "pc_increment", "pc_add",
      "im_reg1", "im_reg2", "im_imm_gen",
      "reg1_mux", "reg2_mux", "mux_alu",
      "zero", "imm_gen_shift", "branch_taken",
    ],
    steps: [
      {
        description: "Select the next PC value via the PC MUX",
        hint: "The PC MUX always feeds a value into the PC register every cycle — whether or not a branch is taken.",
        paths: ["mux_pc"],
      },
      {
        description: "Compute PC+4 (the fall-through path)",
        hint: "Even for branches, PC+4 is computed by the default adder and fed back to the MUX as the not-taken option.",
        paths: ["pc_default", "pc_increment"],
      },
      {
        description: "Send the current PC to the branch adder",
        hint: "A separate path carries the current PC to the branch-target adder, which will compute PC + imm.",
        paths: ["pc_add"],
      },
      {
        description: "Route instruction fields from instruction memory",
        hint: "beq reads rs1 and rs2 for comparison, and sends the full instruction word to Imm Gen for the branch offset. rd is not used.",
        paths: ["im_reg1", "im_reg2", "im_imm_gen"],
      },
      {
        description: "Send both register values to the ALU for comparison",
        hint: "Read Data 1 and Read Data 2 both reach the ALU. For beq the ALU subtracts them — if the result is zero the branch is taken.",
        paths: ["reg1_mux", "reg2_mux", "mux_alu"],
      },
      {
        description: "Check the ALU Zero signal (branch condition)",
        hint: "The ALU's Zero output is ANDed with the Branch control signal. If both are 1, the PC MUX selects the branch target.",
        paths: ["zero"],
      },
      {
        description: "Compute the branch target and route it to the PC MUX",
        hint: "The immediate is left-shifted by 1 (×2) and added to PC in the branch adder. The result travels back to the PC MUX as the taken-branch option.",
        paths: ["imm_gen_shift", "branch_taken"],
      },
    ],
  },
  {
    label: "sw x9, 4(x18)",
    type: "S-Type",
    correctPaths: [
      "mux_pc", "pc_default", "pc_increment",
      "im_reg1", "im_reg2", "im_imm_gen",
      "reg1_mux", "imm_gen_mux", "mux_alu",
      "alu_res_mem", "reg2_dm",
    ],
    steps: [
      {
        description: "Select the next PC value via the PC MUX",
        hint: "The PC MUX always feeds a value into the PC register every cycle.",
        paths: ["mux_pc"],
      },
      {
        description: "Compute PC+4 and feed it back to the MUX",
        hint: "Sequential execution: the Add-4 adder produces PC+4 which returns to the MUX.",
        paths: ["pc_default", "pc_increment"],
      },
      {
        description: "Route instruction fields from instruction memory",
        hint: "sw uses rs1 (base address), rs2 (data to store), and the S-type immediate — three paths leave instruction memory. rd is not used.",
        paths: ["im_reg1", "im_reg2", "im_imm_gen"],
      },
      {
        description: "Compute the store address in the ALU",
        hint: "Read Data 1 (rs1 base) feeds the ALU. The S-type immediate goes through the ALU-source MUX (ALUSrc=1). The MUX output feeds the ALU to produce base + offset.",
        paths: ["reg1_mux", "imm_gen_mux", "mux_alu"],
      },
      {
        description: "Send the address and store data to data memory",
        hint: "The ALU result (address) goes to data memory's Address port. Read Data 2 (rs2) goes to data memory's Write Data port. No register write-back occurs.",
        paths: ["alu_res_mem", "reg2_dm"],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Path metadata (label + explanation shown on hover)
// ---------------------------------------------------------------------------

const PATH_META: Record<PathId, { label: string; desc: string }> = {
  mux_pc: {
    label: "MUX → PC",
    desc: "The PC-select MUX outputs the chosen next PC (either PC+4 or a branch target) and drives the PC register input.",
  },
  pc_default: {
    label: "PC → Add-4 adder",
    desc: "The current PC value is wired to the Add-4 adder so that PC+4 can be computed for sequential execution.",
  },
  pc_increment: {
    label: "Add-4 adder → PC MUX",
    desc: "The Add-4 adder outputs PC+4 and feeds it back to port 0 of the PC-select MUX as the default (not-taken) next PC.",
  },
  pc_add: {
    label: "PC → Branch adder",
    desc: "A second path from the current PC reaches the branch-target adder, where it will be summed with the sign-extended, shifted immediate.",
  },
  im_reg1: {
    label: "Instr Mem → Read register 1",
    desc: "Instruction bits [19:15] (the rs1 field) are routed from instruction memory to the register file's first read port.",
  },
  im_reg2: {
    label: "Instr Mem → Read register 2",
    desc: "Instruction bits [24:20] (the rs2 field) are routed from instruction memory to the register file's second read port.",
  },
  im_reg_write: {
    label: "Instr Mem → Write register",
    desc: "Instruction bits [11:7] (the rd field) are routed from instruction memory to the register file's write-register address input.",
  },
  im_imm_gen: {
    label: "Instr Mem → Imm Gen",
    desc: "The full 32-bit instruction word is forwarded to the immediate generator, which extracts and sign-extends the instruction's immediate field.",
  },
  imm_gen_mux: {
    label: "Imm Gen → ALU-source MUX",
    desc: "The sign-extended immediate value reaches port 1 of the ALU-source MUX. When ALUSrc=1, the MUX selects this value as the ALU's second operand.",
  },
  imm_gen_shift: {
    label: "Imm Gen → Shift-left-1 → Branch adder",
    desc: "The immediate is left-shifted by 1 bit (×2, since RISC-V branch offsets are in units of 2 bytes) and fed into the branch-target adder.",
  },
  reg1_mux: {
    label: "Read Data 1 → ALU",
    desc: "The value read from register rs1 travels directly to the ALU as its first operand.",
  },
  reg2_mux: {
    label: "Read Data 2 → ALU-source MUX",
    desc: "The value read from register rs2 reaches port 0 of the ALU-source MUX. When ALUSrc=0, the MUX selects this value as the ALU's second operand.",
  },
  mux_alu: {
    label: "ALU-source MUX → ALU",
    desc: "The ALU-source MUX outputs its chosen value (either rs2 or the immediate) and drives the ALU's second operand input.",
  },
  zero: {
    label: "ALU Zero → AND gate",
    desc: "The ALU's Zero flag (set when the result equals zero) is AND-ed with the Branch control signal. A high output causes the PC MUX to select the branch target.",
  },
  alu_res_mem: {
    label: "ALU Result → Data Memory address",
    desc: "The ALU's computed result (a memory address for loads and stores) is sent to the Address input of data memory.",
  },
  alu_res_mux: {
    label: "ALU Result → Write-data MUX",
    desc: "The ALU result travels to port 0 of the write-data MUX. When MemtoReg=0 (R-type, I-type arithmetic), this value is written back to the register file.",
  },
  reg2_dm: {
    label: "Read Data 2 → Data Memory write",
    desc: "The value from rs2 is forwarded to the Write Data input of data memory. This is the data that will be stored at the computed address.",
  },
  dm_mux: {
    label: "Data Memory → Write-data MUX",
    desc: "The word read from data memory reaches port 1 of the write-data MUX. When MemtoReg=1 (load instructions), this value is selected for register write-back.",
  },
  reg_write: {
    label: "Write-data MUX → Register file",
    desc: "The write-data MUX's selected output (ALU result or memory read data) is written into the destination register rd.",
  },
  branch_taken: {
    label: "Branch adder → PC MUX",
    desc: "The branch-target address (PC + sign-extended immediate × 2) travels from the branch adder back to port 1 of the PC-select MUX.",
  },
};

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLOR = {
  default: "#000000",
  dim: "#c8c8c8",
  hover: "#93c5fd",
  selected: "#2563eb",
  correct: "#1D9E75",
  wrong: "#E24B4A",
} as const;

// ---------------------------------------------------------------------------
// QuizState
// ---------------------------------------------------------------------------

interface QuizState {
  instrIdx: number;
  stepIdx: number;
  selected: Set<PathId>;
  feedback: { correct: boolean; hint: string } | null;
  /** Paths that have already been revealed (colored permanently). */
  revealed: Set<PathId>;
  stepResults: boolean[];
  allResults: { instrLabel: string; results: boolean[] }[];
  done: boolean;
  score: number;
  total: number;
}

function initState(): QuizState {
  return {
    instrIdx: 0,
    stepIdx: 0,
    selected: new Set(),
    feedback: null,
    revealed: new Set(),
    stepResults: [],
    allResults: [],
    done: false,
    score: 0,
    total: 0,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SingleCycleQuiz() {
  const [state, setState] = useState<QuizState>(initState);
  const [hoveredPath, setHoveredPath] = useState<PathId | null>(null);

  const currentInstr = QUIZ_INSTRUCTIONS[state.instrIdx];
  const currentStep = currentInstr?.steps[state.stepIdx];
  const inStepSet = new Set<PathId>(currentStep?.paths ?? []);

  // ── Derived path colour ──────────────────────────────────────────────────
  const pathColor = useCallback(
    (id: PathId): string => {
      if (state.revealed.has(id)) {
        return currentInstr.correctPaths.includes(id)
          ? COLOR.correct
          : COLOR.wrong;
      }
      if (state.selected.has(id)) return COLOR.selected;
      if (hoveredPath === id && inStepSet.has(id) && !state.feedback)
        return COLOR.hover;
      if (inStepSet.has(id)) return COLOR.dim;
      return COLOR.default;
    },
    [state, hoveredPath, inStepSet, currentInstr]
  );

  const pathOpacity = (id: PathId): number =>
    !inStepSet.has(id) && !state.revealed.has(id) && !state.selected.has(id)
      ? 0.28
      : 1;

  const pathCursor = (id: PathId): string =>
    inStepSet.has(id) && !state.feedback ? "pointer" : "default";

  // ── Interaction handlers ─────────────────────────────────────────────────
  function handlePathClick(id: PathId) {
    if (state.done || state.feedback) return;
    if (!inStepSet.has(id)) return;
    setState((prev) => {
      const next = new Set(prev.selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, selected: next };
    });
  }

  function handleCheck() {
    if (!currentStep) return;
    const required = new Set<PathId>(currentStep.paths);
    const sel = state.selected;
    let correct =
      sel.size === required.size &&
      [...required].every((p) => sel.has(p));

    setState((prev) => {
      const newRevealed = new Set(prev.revealed);
      currentStep.paths.forEach((p) => newRevealed.add(p));
      return {
        ...prev,
        feedback: { correct, hint: currentStep.hint },
        revealed: newRevealed,
        stepResults: [...prev.stepResults, correct],
        score: prev.score + (correct ? 1 : 0),
        total: prev.total + 1,
      };
    });
  }

  function handleNext() {
    const steps = currentInstr.steps;
    setState((prev) => {
      const isLastStep = prev.stepIdx >= steps.length - 1;
      const isLastInstr = prev.instrIdx >= QUIZ_INSTRUCTIONS.length - 1;

      if (!isLastStep) {
        return {
          ...prev,
          stepIdx: prev.stepIdx + 1,
          selected: new Set(),
          feedback: null,
        };
      }

      const completedResults = {
        instrLabel: currentInstr.label,
        results: [...prev.stepResults],
      };

      if (isLastInstr) {
        return {
          ...prev,
          allResults: [...prev.allResults, completedResults],
          stepResults: [],
          selected: new Set(),
          feedback: null,
          done: true,
        };
      }

      return {
        ...prev,
        instrIdx: prev.instrIdx + 1,
        stepIdx: 0,
        selected: new Set(),
        feedback: null,
        revealed: new Set(),
        stepResults: [],
        allResults: [...prev.allResults, completedResults],
      };
    });
  }

  function handleClear() {
    setState((prev) => ({ ...prev, selected: new Set() }));
  }

  function handleRestart() {
    setState(initState());
    setHoveredPath(null);
  }

  // ── Progress dots ────────────────────────────────────────────────────────
  const totalSteps = QUIZ_INSTRUCTIONS.reduce(
    (acc, ins) => acc + ins.steps.length,
    0
  );
  const doneResults: boolean[] = [
    ...state.allResults.flatMap((r) => r.results),
    ...state.stepResults,
  ];

  // ── Helper: coloured path group ──────────────────────────────────────────
  function P({
    id,
    children,
  }: {
    id: PathId;
    children: React.ReactNode;
  }) {
    return (
      <g
        style={{
          cursor: pathCursor(id),
          opacity: pathOpacity(id),
          transition: "opacity 0.15s",
        }}
        onMouseEnter={() => setHoveredPath(id)}
        onMouseLeave={() => setHoveredPath(null)}
        onClick={() => handlePathClick(id)}
        data-path={id}
      >
        {children}
      </g>
    );
  }

  // ── Finish screen ────────────────────────────────────────────────────────
  if (state.done) {
    const pct =
      state.total > 0 ? Math.round((state.score / state.total) * 100) : 0;
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
        <p className="text-4xl font-medium text-gray-900 mb-1">
          {state.score}/{state.total}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {pct}% of path steps correct
        </p>
        <div className="space-y-2 mb-6 text-left max-w-xs mx-auto">
          {state.allResults.map((r) => (
            <div key={r.instrLabel} className="flex items-center justify-between text-sm">
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-800">
                {r.instrLabel}
              </code>
              <span className="text-gray-500">
                {r.results.filter(Boolean).length}/{r.results.length} steps
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={handleRestart}
          className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Hover tooltip content ────────────────────────────────────────────────
  const tooltipMeta = hoveredPath ? PATH_META[hoveredPath] : null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-3">
      {/* ── Header row ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Instruction {state.instrIdx + 1}/{QUIZ_INSTRUCTIONS.length}
          </span>
          <code className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono font-semibold text-gray-800">
            {currentInstr.label}
          </code>
          <span className="text-xs text-gray-400">({currentInstr.type})</span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => {
            let cls =
              "inline-block w-2 h-2 rounded-full transition-colors duration-200 ";
            if (i < doneResults.length)
              cls += doneResults[i] ? "bg-teal-500" : "bg-red-400";
            else if (i === doneResults.length) cls += "bg-blue-500";
            else cls += "bg-gray-200";
            return <span key={i} className={cls} />;
          })}
        </div>
      </div>

      {/* ── Step description ── */}
      {currentStep && (
        <p className="text-xs font-medium text-gray-500">
          Step {state.stepIdx + 1} of {currentInstr.steps.length}:{" "}
          <span className="text-gray-700 font-normal italic">
            {currentStep.description}
          </span>
        </p>
      )}

      {/* ── SVG diagram ── */}
      <div className="p-4 relative rounded-xl border border-gray-200 overflow-hidden bg-white">
        <svg
          width="100%"
          viewBox="0 0 884 623"
          fill="transparent"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Static boxes ── */}

          {/* Instruction Memory */}
          <rect x="158.501" y="272.735" width="86" height="154.75" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="162.001" y="293.651">Address</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="190.001" y="348.621">Instruction</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="184.001" y="393.121">Instruction</tspan><tspan x="184.001" y="405.121">{"   memory"}</tspan></text>

          {/* PC box */}
          <rect x="104.501" y="249.176" width="25" height="89.3088" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="110.001" y="296.268">PC</tspan></text>

          {/* Register file */}
          <rect x="306.501" y="254.412" width="115" height="200.559" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="312.001" y="270.092">Read</tspan><tspan x="312.001" y="282.092">register 1</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="312.001" y="314.592">Read</tspan><tspan x="312.001" y="326.592">register 2</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="312.001" y="374.798">Write</tspan><tspan x="312.001" y="386.798">register</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="312.001" y="424.533">Write</tspan><tspan x="312.001" y="436.533">data</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="389.802" y="271.401">Read</tspan><tspan x="385.261" y="283.401">data 1</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="389.802" y="380.033">Read</tspan><tspan x="383.855" y="392.033">data 2</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="342.001" y="355.166">Registers</tspan></text>

          {/* ALU */}
          <rect x={533.5} y={238} width={66} height={167.5} stroke="transparent" />
          <path d="M533.501 238.206V307.573M533.501 336.367V405.735M533.388 307.159L542.388 321.556M542.401 321.054L533.401 336.76M533.737 405.179L599.737 351.517M533.737 238.762L599.737 292.423M599.501 291.867V352.073" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="544.491" y="321.136">ALU</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="571.539" y="296.269">Zero</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="575.982" y="326.371">ALU </tspan><tspan x="566.236" y="338.371">Result</tspan></text>

          {/* Data Memory */}
          <rect x="672.501" y="271.426" width="99" height="200.559" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="679.001" y="332.916">Address</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="710.339" y="378.724">Data</tspan><tspan x="701.882" y="390.724">memory</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="743.802" y="346.004">Read</tspan><tspan x="746.634" y="358.004">data</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="679.001" y="445.474">Write</tspan><tspan x="679.001" y="457.474">data</tspan></text>

          {/* MUX 1 — PC select */}
          <rect x="55.5012" y="242.632" width="30" height="106.323" rx="15" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="71.5139" y="280.563">M</tspan><tspan x="73.0276" y="292.563">u</tspan><tspan x="73.2473" y="304.563">x</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="63.6379" y="327.68">1</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="62.7737" y="259.621">0</tspan></text>

          {/* MUX 2 — ALU source */}
          <rect x="483.501" y="334.25" width="34" height="112.868" rx="17" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="500.514" y="373.489">M</tspan><tspan x="502.028" y="385.489">u</tspan><tspan x="502.247" y="397.489">x</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="492.638" y="420.607">1</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="491.774" y="352.548">0</tspan></text>

          {/* MUX 3 — Write-data */}
          <rect x="827.501" y="334.25" width="34" height="112.868" rx="17" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="844.514" y="380.033">M</tspan><tspan x="846.028" y="392.033">u</tspan><tspan x="846.247" y="404.033">x</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="835.774" y="431.077">0</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="836.638" y="353.857">1</tspan></text>

          {/* Add-4 box */}
          <rect x="119.501" y="23.5588" width="66" height="167.5" stroke="transparent" />
          <path d="M119.114 23.5588V92.9264M119.114 121.721V191.088M119.001 92.512L128.001 106.909M128.014 106.407L119.014 122.113M119.351 190.532L185.351 136.871M119.351 24.1147L185.351 77.7764M185.114 77.2206V137.426" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="154.785" y="107.798">Add</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="93.2299" y="63.2981">4</tspan></text>

          {/* ADD SUM (branch adder) box */}
          <rect x="505.501" y="65.4412" width="66" height="167.5" stroke="transparent" />
          <path d="M505.114 65.4412V134.809M505.114 163.603V232.97M505.001 134.394L514.001 148.791M514.014 148.29L505.014 163.996M505.35 232.415L571.35 178.753M505.35 65.997L571.35 119.659M571.114 119.103V179.309" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="515.783" y="152.298">ADD</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="546.891" y="145.754">Sum</tspan></text>

          {/* Shift Left 1 box */}
          <rect x="446.501" y="148.397" width="36" height="78" rx="50" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="452.824" y="177.166">Shift</tspan><tspan x="452.429" y="189.166">left 1</tspan><tspan x="452.429" y="201.166">bit</tspan></text>

          {/* Imm Gen box */}
          <rect x="357.501" y="479.529" width="48" height="118" rx="70" stroke="black" />
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="371.816" y="531.857">Imm</tspan><tspan x="372.333" y="543.857">Gen</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="321.712" y="518.768">32</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="409.551" y="518.768">32</tspan></text>

          {/* ── Shared static lines (always black, not clickable) ── */}
          {/* connector from instruction mem output to the fork point */}
          <path d="M263.339 347.75C263.339 349.223 264.533 350.417 266.006 350.417C267.479 350.417 268.673 349.223 268.673 347.75C268.673 346.277 267.479 345.083 266.006 345.083C264.533 345.083 263.339 346.277 263.339 347.75ZM245 347.75V348.25H266.006V347.75V347.25H245V347.75Z" fill="black" opacity={0.28} />
          {/* vertical connector reg1/reg2 fork */}
          <line x1="266.503" y1="318" x2="266.503" y2="348" stroke="black" opacity={0.28} />
          {/* connector imm_gen vertical and horizontal shared trunk */}
          <path d="M405 541H465M464.5 418.998V541.002" stroke="black" opacity={0.28} />

          {/* ── Clickable path groups ── */}

          {/* mux_pc */}
          <P id="mux_pc">
            <path d="M101 293L96 290.113V295.887L101 293ZM86 293V293.5H96.5V293V292.5H86V293Z" fill={pathColor("mux_pc")} />
          </P>

          {/* pc_default — PC → Instr Mem arrow + the big loop from add-4 back to MUX */}
          <P id="pc_default">
            {/* PC output → Instruction Memory */}
            <path d="M154 293L149 290.113V295.887L154 293ZM139 293V293.5H149.5V293V292.5H139V293Z" fill={pathColor("pc_default")} />
            <path d="M130 293H139" stroke={pathColor("pc_default")} fill="none" />
            {/* Add-4 output → MUX input (top port) */}
            <path d="M51 255L46 252.113V257.887L51 255ZM185 106V106.5H207V106V105.5H185V106ZM206.5 9.99933H206V106.001H206.5H207V9.99933H206.5ZM207 10V9.5H36V10V10.5H207V10ZM36 255V255.5H46.5V255V254.5H36V255ZM36.5 255H37V10H36.5H36V255H36.5Z" fill={pathColor("pc_default")} />
          </P>

          {/* pc_increment — PC → Add-4 adder input */}
          <P id="pc_increment">
            <path d="M115 150L110 147.113V152.887L115 150ZM139 217V216.5H92V217V217.5H139V217ZM92.5 150L92 150L92 217L92.5 217L93 217L93 150L92.5 150ZM92 150V150.5H110.5V150V149.5H92V150Z" fill={pathColor("pc_increment")} />
            {/* junction dot and vertical segment connecting pc to add-4 tap */}
            <path d="M139 214.333C137.527 214.333 136.333 215.527 136.333 217C136.333 218.473 137.527 219.667 139 219.667C140.473 219.667 141.667 218.473 141.667 217C141.667 215.527 140.473 214.333 139 214.333ZM139 290.333C137.527 290.333 136.333 291.527 136.333 293C136.333 294.473 137.527 295.667 139 295.667C140.473 295.667 141.667 294.473 141.667 293C141.667 291.527 140.473 290.333 139 290.333ZM139 217H138.5V293H139H139.5V217H139Z" fill={pathColor("pc_increment")} />
          </P>

          {/* pc_add — PC → Branch adder */}
          <P id="pc_add">
            <path d="M501 106.012L496 103.125V108.899L501 106.012ZM139 217L139 217.5L234 217.521L234 217.021L234 216.521L139 216.5L139 217ZM233.5 217.001H234V105.999H233.5H233V217.001H233.5ZM496.5 106.012V105.512H233V106.012V106.512H496.5V106.012Z" fill={pathColor("pc_add")} />
          </P>

          {/* im_imm_gen — Instruction Mem → Imm Gen */}
          <P id="im_imm_gen">
            <path d="M354.004 542.25L349.004 539.363V545.137L354.004 542.25ZM266.503 384H266.003V542H266.503H267.003V384H266.503ZM349.504 542.25V541.75H266.002V542.25V542.75H349.504V542.25Z" fill={pathColor("im_imm_gen")} />
            <line x1="266.503" y1="348" x2="266.503" y2="384" stroke={pathColor("im_imm_gen")} />
          </P>

          {/* im_reg_write — Instr Mem → write register field */}
          <P id="im_reg_write">
            <path d="M263.336 384C263.336 385.473 264.53 386.667 266.003 386.667C267.476 386.667 268.67 385.473 268.67 384C268.67 382.527 267.476 381.333 266.003 381.333C264.53 381.333 263.336 382.527 263.336 384ZM303.003 384L298.003 381.113V386.887L303.003 384ZM266.003 384V384.5H298.503V384V383.5H266.003V384Z" fill={pathColor("im_reg_write")} />
          </P>

          {/* im_reg1 — Instr Mem → read register 1 */}
          <P id="im_reg1">
            <path d="M303.003 273L298.003 270.113V275.887L303.003 273ZM266.003 273V273.5H298.503V273V272.5H266.003V273Z" fill={pathColor("im_reg1")} />
            <line x1="266.503" y1="273" x2="266.503" y2="318" stroke={pathColor("im_reg1")} />
          </P>

          {/* im_reg2 — Instr Mem → read register 2 */}
          <P id="im_reg2">
            <path d="M263.336 318C263.336 319.473 264.53 320.667 266.003 320.667C267.476 320.667 268.67 319.473 268.67 318C268.67 316.527 267.476 315.333 266.003 315.333C264.53 315.333 263.336 316.527 263.336 318ZM303.003 318L298.003 315.113V320.887L303.003 318ZM266.003 318V318.5H298.503V318V317.5H266.003V318Z" fill={pathColor("im_reg2")} />
          </P>

          {/* reg1_mux — Read Data 1 → ALU */}
          <P id="reg1_mux">
            <path d="M529 275L524 272.113V277.887L529 275ZM422 275V275.5H524.5V275V274.5H422V275Z" fill={pathColor("reg1_mux")} />
          </P>

          {/* reg2_mux — Read Data 2 → ALU-source MUX port 0 */}
          <P id="reg2_mux">
            <line x1="422" y1="349.5" x2="454" y2="349.5" stroke={pathColor("reg2_mux")} />
            <path d="M479.005 349.5L474.005 346.613V352.387L479.005 349.5ZM454 349.5V350H474.505V349.5V349H454V349.5Z" fill={pathColor("reg2_mux")} />
          </P>

          {/* reg2_dm — Read Data 2 → Data Memory write data */}
          <P id="reg2_dm">
            <path d="M454 455L453.5 455L453.5 455.5H454V455ZM668 455L663 452.113V457.887L668 455ZM451.333 349C451.333 350.473 452.527 351.667 454 351.667C455.473 351.667 456.667 350.473 456.667 349C456.667 347.527 455.473 346.333 454 346.333C452.527 346.333 451.333 347.527 451.333 349ZM454 455V455.5H663.5V455V454.5H454V455ZM454 455L454.5 455L454.5 349L454 349L453.5 349L453.5 455L454 455Z" fill={pathColor("reg2_dm")} />
            <line x1="422" y1="349.5" x2="454" y2="349.5" stroke={pathColor("reg2_dm")} />
          </P>

          {/* mux_alu — ALU-source MUX → ALU */}
          <P id="mux_alu">
            <path d="M529 383L524 380.113V385.887L529 383ZM518 383V383.5H524.5V383V382.5H518V383Z" fill={pathColor("mux_alu")} />
          </P>

          {/* imm_gen_mux — Imm Gen → ALU-source MUX port 1 */}
          <P id="imm_gen_mux">
            <path d="M461.333 419C461.333 420.473 462.527 421.667 464 421.667C465.473 421.667 466.667 420.473 466.667 419C466.667 417.527 465.473 416.333 464 416.333C462.527 416.333 461.333 417.527 461.333 419ZM479 419L474 416.113V421.887L479 419ZM464 419V419.5H474.5V419V418.5H464V419Z" fill={pathColor("imm_gen_mux")} />
            <path d="M464.5 226V420" stroke={pathColor("imm_gen_mux")} fill="none" />
          </P>

          {/* imm_gen_shift — Imm Gen → Shift Left 1 → Branch adder */}
          <P id="imm_gen_shift">
            <path d="M501 184L496 181.113V186.887L501 184ZM482 184V184.5H496.5V184V183.5H482V184Z" fill={pathColor("imm_gen_shift")} />
            <path d="M464.5 226V420" stroke={pathColor("imm_gen_shift")} fill="none" />
          </P>

          {/* zero — ALU Zero → AND gate */}
          <P id="zero">
            <path d="M657 296.996L652 294.109V299.882L657 296.996ZM599 296.996V297.496H652.5V296.996V296.496H599V296.996Z" fill={pathColor("zero")} />
          </P>

          {/* alu_res_mem — ALU Result → Data Memory address */}
          <P id="alu_res_mem">
            <path d="M599 332H622" stroke={pathColor("alu_res_mem")} fill="none" />
            <path d="M668 332L663 329.113V334.887L668 332ZM622 332V332.5H663.5V332V331.5H622V332Z" fill={pathColor("alu_res_mem")} />
          </P>

          {/* alu_res_mux — ALU Result → Write-data MUX */}
          <P id="alu_res_mux">
            <path d="M619.583 332C619.583 333.472 620.777 334.666 622.25 334.666C623.723 334.666 624.917 333.472 624.917 332C624.917 330.527 623.723 329.333 622.25 329.333C620.777 329.333 619.583 330.527 619.583 332ZM809 509V509.5H809.5V509H809ZM825 431L820 428.113V433.887L825 431ZM622.25 332H621.75V509H622.25H622.75V332H622.25ZM622.25 509H621.75V509H622.25H622.75V509H622.25ZM809 509V508.5H622.25V509V509.5H809V509ZM622.25 509V508.5H622V509V509.5H622.25V509ZM809 509H809.5V431H809H808.5V509H809ZM809 431H809.5V430H809H808.5V431H809ZM809 431V431.5H820.5V431V430.5H809V431Z" fill={pathColor("alu_res_mux")} />
            <path d="M599 332H622" stroke={pathColor("alu_res_mux")} fill="none" />
          </P>

          {/* dm_mux — Data Memory → Write-data MUX */}
          <P id="dm_mux">
            <path d="M825 353L820 350.113V355.887L825 353ZM772 353V353.5H820.5V353V352.5H772V353Z" fill={pathColor("dm_mux")} />
          </P>

          {/* reg_write — Write-data MUX → Register file write port */}
          <P id="reg_write">
            <path d="M303 428L298 425.113V430.887L303 428ZM276 428V428.5H298.5V428V427.5H276V428ZM276.5 428H276V623H276.5H277V428H276.5ZM276 622.969V623.469H883V622.969V622.469H276V622.969ZM882.5 388L882 388L882 623.469L882.5 623.469L883 623.469L883 388L882.5 388ZM882 388.5V388H862V388.5V389H882V388.5Z" fill={pathColor("reg_write")} />
          </P>

          {/* branch_taken — Branch adder → PC MUX */}
          <P id="branch_taken">
            <path d="M51.0012 305.25L46.0012 302.363V308.137L51.0012 305.25ZM7.62939e-06 0.499994L7.62942e-06 0.999994L713.001 0.999994L713.001 0.499994L713.001 -5.72205e-06L7.62937e-06 -5.69224e-06L7.62939e-06 0.499994ZM712.5 146.002H713V0.998285H712.5H712V146.002H712.5ZM713 146.502L713 146.002L571 146L571 146.5L571 147L713 147.002L713 146.502ZM0.503487 0L0.00348663 -5.70329e-06L7.62943e-06 305L0.500008 305L1.00001 305L1.00349 5.70329e-06L0.503487 0ZM46.5012 305.25V304.75H-0.0012207V305.25V305.75H46.5012V305.25Z" fill={pathColor("branch_taken")} />
          </P>

          {/* ── Add-4 output arrow (always visible, part of pc_default) ── */}
          <path
            d="M115 63L110 60.1132V65.8868L115 63ZM101 63V63.5H110.5V63V62.5H101V63Z"
            fill={pathColor("pc_default")}
            style={{ opacity: pathOpacity("pc_default"), pointerEvents: "none" }}
          />
        </svg>

        {/* Hover tooltip */}
        {tooltipMeta && (
          <div className="absolute bottom-2 left-2 max-w-[220px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 leading-relaxed shadow-sm pointer-events-none">
            <p className="font-medium text-gray-700 mb-0.5">{tooltipMeta.label}</p>
            {tooltipMeta.desc}
          </div>
        )}
      </div>

      {/* Selected paths listing */}
      {state.selected.size > 0 && !state.feedback && (
        <p className="text-xs text-gray-400">
          Selected:{" "}
          {[...state.selected]
            .map((id) => PATH_META[id]?.label ?? id)
            .join(", ")}
        </p>
      )}

      {/* Feedback panel */}
      {state.feedback ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
            state.feedback.correct
              ? "border-teal-300 bg-teal-50 text-teal-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          <span className="font-semibold">
            {state.feedback.correct ? "✓ Correct! " : "✗ Not quite. "}
          </span>
          {state.feedback.correct
            ? "All required segments for this step were selected."
            : `Hint: ${state.feedback.hint} — the correct segments are now highlighted.`}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-400">
          Click every path segment that belongs to this step, then press{" "}
          <strong className="font-medium text-gray-600">Check</strong>.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!state.feedback ? (
          <>
            <button
              onClick={handleCheck}
              disabled={state.selected.size === 0}
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Check
            </button>
            <button
              onClick={handleClear}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
          >
            {state.stepIdx < currentInstr.steps.length - 1
              ? "Next step →"
              : state.instrIdx < QUIZ_INSTRUCTIONS.length - 1
              ? "Next instruction →"
              : "See results"}
          </button>
        )}
      </div>
    </div>
  );
}