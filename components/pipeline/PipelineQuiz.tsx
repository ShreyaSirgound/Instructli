"use client";

import React, { useState, useCallback } from "react";
import type { IFPath, IDPath, EXPath, MEMPath, WBPath } from "../../src/utils/pipeline-types";
import PipelineDatapathSVG from "./PipelineDatapathSVG";

type AllPathKeys =
  | keyof IFPath
  | keyof IDPath
  | keyof EXPath
  | keyof MEMPath
  | keyof WBPath;

type PipelineQuizQuestion = {
  label: string;
  activeIF:  (keyof IFPath)[];
  activeID:  (keyof IDPath)[];
  activeEX:  (keyof EXPath)[];
  activeMEM: (keyof MEMPath)[];
  activeWB:  (keyof WBPath)[];
};

const QUESTIONS: PipelineQuizQuestion[] = [
  {
    label: "add x5, x6, x7  (no hazards)",
    activeIF:  ["mux_pc", "pc_increment", "pc_default", "pc_im", "pc_id", "im_id"],
    activeID:  ["id_reg1", "id_reg2", "id_reg_write", "id_ex", "reg1_ex", "reg2_ex"],
    activeEX:  ["reg1_alu", "reg2_mux", "mux_alu", "alu_mem"],
    activeMEM: ["alu_wb"],
    activeWB:  ["alu_mux", "reg_write"],
  },
  {
    label: "lw x5, 4(x6)  (no hazards)",
    activeIF:  ["mux_pc", "pc_increment", "pc_default", "pc_im", "pc_id", "im_id"],
    activeID:  ["id_reg1", "id_reg_write", "id_imm_gen", "id_ex", "reg1_ex", "imm_ex"],
    activeEX:  ["reg1_alu", "ex_mux", "mux_alu", "alu_mem"],
    activeMEM: ["alu_dm", "dm_wb"],
    activeWB:  ["dm_mux", "reg_write"],
  },
  {
    label: "sw x6, 4(x7)  (no hazards)",
    activeIF:  ["mux_pc", "pc_increment", "pc_default", "pc_im", "pc_id", "im_id"],
    activeID:  ["id_reg1", "id_reg2", "id_imm_gen", "id_ex", "reg1_ex", "reg2_ex", "imm_ex"],
    activeEX:  ["reg1_alu", "reg2_mux", "reg2_mem", "ex_mux", "mux_alu", "alu_mem"],
    activeMEM: ["alu_dm", "reg2_dm"],
    activeWB:  [],
  },
  {
    label: "beq x5, x6, 8  (branch taken)",
    activeIF:  ["mux_pc", "pc_increment", "pc_default", "pc_im", "pc_id", "im_id", "branch_taken"],
    activeID:  ["id_reg1", "id_reg2", "id_imm_gen", "id_ex", "reg1_ex", "reg2_ex", "imm_ex"],
    activeEX:  ["reg1_alu", "reg2_mux", "mux_alu", "ex_add", "ex_shift", "zero_mem", "add_mem"],
    activeMEM: ["zero_mem2"],
    activeWB:  [],
  },
  {
    label: "addi x5, x6, 10  (no hazards)",
    activeIF:  ["mux_pc", "pc_increment", "pc_default", "pc_im", "pc_id", "im_id"],
    activeID:  ["id_reg1", "id_reg_write", "id_imm_gen", "id_ex", "reg1_ex", "imm_ex"],
    activeEX:  ["reg1_alu", "ex_mux", "mux_alu", "alu_mem"],
    activeMEM: ["alu_wb"],
    activeWB:  ["alu_mux", "reg_write"],
  },
];

type SegmentEntry = { stage: string; label: string };

const SEGMENT_LABELS: Partial<Record<AllPathKeys, SegmentEntry>> = {
  pc_default:   { stage: "IF",  label: "PC → Instr Mem" },
  pc_increment: { stage: "IF",  label: "PC → Add 4" },
  pc_im:        { stage: "IF",  label: "PC → Instr Mem (read)" },
  pc_id:        { stage: "IF",  label: "PC → IF/ID register" },
  mux_pc:       { stage: "IF",  label: "MUX → PC (next)" },
  im_id:        { stage: "IF",  label: "Instr Mem → IF/ID" },
  branch_taken: { stage: "IF",  label: "Branch taken path" },

  id_reg1:      { stage: "ID",  label: "Instr → Read Reg 1" },
  id_reg2:      { stage: "ID",  label: "Instr → Read Reg 2" },
  id_reg_write: { stage: "ID",  label: "Instr → Write Reg" },
  id_imm_gen:   { stage: "ID",  label: "Instr → Imm Gen" },
  id_ex:        { stage: "ID",  label: "PC → ID/EX register" },
  reg1_ex:      { stage: "ID",  label: "Read Data 1 → ID/EX" },
  reg2_ex:      { stage: "ID",  label: "Read Data 2 → ID/EX" },
  imm_ex:       { stage: "ID",  label: "Imm Gen → ID/EX" },

  reg1_alu:     { stage: "EX",  label: "Read Data 1 → ALU" },
  reg2_mux:     { stage: "EX",  label: "Read Data 2 → ALU MUX" },
  reg2_mem:     { stage: "EX",  label: "Read Data 2 → EX/MEM" },
  ex_mux:       { stage: "EX",  label: "Imm Gen → ALU MUX (ALUSrc=1)" },
  mux_alu:      { stage: "EX",  label: "ALU MUX → ALU" },
  ex_add:       { stage: "EX",  label: "PC → Branch Adder" },
  ex_shift:     { stage: "EX",  label: "Imm → Shift Left 1" },
  add_mem:      { stage: "EX",  label: "Branch Target → EX/MEM" },
  zero_mem:     { stage: "EX",  label: "ALU Zero → EX/MEM" },
  alu_mem:      { stage: "EX",  label: "ALU Result → EX/MEM" },

  alu_dm:       { stage: "MEM", label: "ALU Result → Data Mem" },
  reg2_dm:      { stage: "MEM", label: "Write Data → Data Mem" },
  zero_mem2:    { stage: "MEM", label: "Zero → AND gate" },
  dm_wb:        { stage: "MEM", label: "Read Data → MEM/WB" },
  alu_wb:       { stage: "MEM", label: "ALU Result → MEM/WB" },

  dm_mux:       { stage: "WB",  label: "Data Mem → WB MUX" },
  alu_mux:      { stage: "WB",  label: "ALU Result → WB MUX" },
  reg_write:    { stage: "WB",  label: "WB MUX → Register Write" },
};

const SELECTABLE_IF  = (Object.keys(SEGMENT_LABELS) as AllPathKeys[]).filter(k => SEGMENT_LABELS[k]?.stage === "IF")  as (keyof IFPath)[];
const SELECTABLE_ID  = (Object.keys(SEGMENT_LABELS) as AllPathKeys[]).filter(k => SEGMENT_LABELS[k]?.stage === "ID")  as (keyof IDPath)[];
const SELECTABLE_EX  = (Object.keys(SEGMENT_LABELS) as AllPathKeys[]).filter(k => SEGMENT_LABELS[k]?.stage === "EX")  as (keyof EXPath)[];
const SELECTABLE_MEM = (Object.keys(SEGMENT_LABELS) as AllPathKeys[]).filter(k => SEGMENT_LABELS[k]?.stage === "MEM") as (keyof MEMPath)[];
const SELECTABLE_WB  = (Object.keys(SEGMENT_LABELS) as AllPathKeys[]).filter(k => SEGMENT_LABELS[k]?.stage === "WB")  as (keyof WBPath)[];

function makeStageColour<T extends string>(
  selected: Set<AllPathKeys>,
  correct: Set<AllPathKeys>,
  submitted: boolean,
  selectable: T[],
) {
  return (key: T): string => {
    if (!selectable.includes(key)) return "#000000";
    const k = key as AllPathKeys;
    const isSel = selected.has(k);
    const isOk  = correct.has(k);
    if (!submitted) return isSel ? "#2563eb" : "#000000";
    if (isOk && isSel)   return "#16a34a";
    if (!isOk && isSel)  return "#dc2626";
    if (isOk && !isSel)  return "#f59e0b";
    return "#000000";
  };
}

function toggle(prev: Set<AllPathKeys>, key: AllPathKeys): Set<AllPathKeys> {
  const next = new Set(prev);
  next.has(key) ? next.delete(key) : next.add(key);
  return next;
}

function buildHoverText(label: string | null, question: PipelineQuizQuestion): string | null {
  if (!label) return null;

  const gateMap: Partial<Record<string, boolean>> = {
    "PC": question.activeIF.length > 0,
    "INSTRUCTION MEMORY": question.activeIF.length > 0,
    "ADD (PC + 4)": question.activeIF.includes("pc_increment"),
    "MUX (Next PC)": question.activeIF.includes("mux_pc"),
    "REGISTER FILE": question.activeID.length > 0,
    "IMMEDIATE GENERATOR": question.activeID.includes("id_imm_gen"),
    "ALU": question.activeEX.includes("mux_alu"),
    "ADD (Branch Target)": question.activeEX.includes("ex_add"),
    "MUX (ALU Input)": question.activeEX.includes("mux_alu"),
    "DATA MEMORY": question.activeMEM.includes("alu_dm") || question.activeMEM.includes("reg2_dm"),
    "MUX (Write Back)": question.activeWB.length > 0,
    "HAZARDS": true,
  };

  if (gateMap[label] === false) return null;

  const instr = question.label;

  switch (label) {
    case "PC":
      return `PC\n\nHolds the address of the current instruction. In a pipeline, this stage runs every cycle, fetching the next instruction while earlier instructions move through the pipeline.`;
    case "INSTRUCTION MEMORY":
      return `INSTRUCTION MEMORY\n\nFetches the instruction at the current PC address for "${instr}". The bits are passed into the IF/ID pipeline register.`;
    case "ADD (PC + 4)":
      return `ADD (PC + 4)\n\nIncrements the PC by 4 each cycle so the next sequential instruction is ready for the IF stage.`;
    case "MUX (Next PC)":
      return `MUX (Next PC)\n\nFor "${instr}": ${
        question.activeIF.includes("branch_taken")
          ? "the branch condition was met — selects the branch target address as the next PC."
          : "selects PC+4 as the next PC (no branch taken)."
      }`;
    case "REGISTER FILE":
      return `REGISTER FILE\n\nIn the ID stage for "${instr}", reads the source registers and forwards values into the ID/EX register. ${
        question.activeID.includes("id_reg_write")
          ? "The destination register number is also passed forward for the WB stage to write back."
          : "No write-back register is needed for this instruction type."
      }`;
    case "IMMEDIATE GENERATOR":
      return `IMMEDIATE GENERATOR\n\nFor "${instr}", sign-extends the immediate field from the instruction bits and passes it into the ID/EX register for use in the EX stage.`;
    case "ALU":
      return `ALU\n\nExecutes the operation for "${instr}" in the EX stage. ${
        question.activeEX.includes("ex_mux")
          ? "The second operand comes from the immediate generator (ALUSrc=1)."
          : "Both operands come from the register file (ALUSrc=0)."
      }${
        question.activeEX.includes("zero_mem")
          ? " The Zero output is forwarded to the MEM stage for branch resolution."
          : ""
      }`;
    case "ADD (Branch Target)":
      return `ADD (Branch Target)\n\nFor "${instr}", computes PC + (imm << 1) in the EX stage. ${
        question.activeIF.includes("branch_taken")
          ? "This value is selected as the next PC since the branch is taken."
          : "This value is computed but discarded — the branch is not taken."
      }`;
    case "MUX (ALU Input)":
      return `MUX (ALU Input)\n\nFor "${instr}": ${
        question.activeEX.includes("ex_mux")
          ? "ALUSrc=1 — selects the sign-extended immediate as the second ALU operand."
          : "ALUSrc=0 — selects register read data 2 as the second ALU operand."
      }`;
    case "DATA MEMORY":
      return `DATA MEMORY\n\nFor "${instr}" in the MEM stage: ${
        question.activeMEM.includes("reg2_dm")
          ? "writes register data to the address computed by the ALU (store)."
          : "reads data from the address computed by the ALU (load)."
      }`;
    case "MUX (Write Back)":
      return `MUX (Write Back)\n\nFor "${instr}": ${
        question.activeWB.includes("dm_mux")
          ? "MemToReg=1 — writes data read from memory back to the register file."
          : "MemToReg=0 — writes the ALU result back to the register file."
      }`;
    case "IF/ID":
      return `IF/ID\n\nHolds the fetched instruction and program counter while the decode stage reads the fields.\nThis lets the next cycle begin ID without waiting for IF to finish.`;
    case "ID/EX":
      return `ID/EX\n\nCarries decoded register values, control signals, and immediate values into the execute stage.\nIt separates instruction decode from execution.`;
    case "EX/MEM":
      return `EX/MEM\n\nStores the ALU result, branch decision signals, and register data for the memory stage.\nIt separates execution from memory access.`;
    case "MEM/WB":
      return `MEM/WB\n\nHolds the value from data memory or the ALU result until the write-back stage writes it into the register file.`;
    case "HAZARDS":
      return `HAZARDS\n\nIn a pipelined processor, hazards occur when an instruction depends on the result of a previous instruction that hasn't completed yet (data hazard), or when a branch changes the PC before the pipeline has fetched the correct next instruction (control hazard).`;
    default:
      return label;
  }
}

export default function PipelineProcessorQuiz() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<Set<AllPathKeys>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const question   = QUESTIONS[questionIndex];
  const correctSet = new Set<AllPathKeys>([
    ...question.activeIF, ...question.activeID, ...question.activeEX,
    ...question.activeMEM, ...question.activeWB,
  ]);

  const activeStages = new Set<"IF" | "ID" | "EX" | "MEM" | "WB">([
    ...([...selected].some(k => SELECTABLE_IF.includes(k as keyof IFPath))   ? ["IF"]  as const : []),
    ...([...selected].some(k => SELECTABLE_ID.includes(k as keyof IDPath))   ? ["ID"]  as const : []),
    ...([...selected].some(k => SELECTABLE_EX.includes(k as keyof EXPath))   ? ["EX"]  as const : []),
    ...([...selected].some(k => SELECTABLE_MEM.includes(k as keyof MEMPath)) ? ["MEM"] as const : []),
    ...([...selected].some(k => SELECTABLE_WB.includes(k as keyof WBPath))   ? ["WB"]  as const : []),
  ]);

  const handleClickIF  = useCallback((key: keyof IFPath)  => { if (!submitted) setSelected(prev => toggle(prev, key as AllPathKeys)); }, [submitted]);
  const handleClickID  = useCallback((key: keyof IDPath)  => { if (!submitted) setSelected(prev => toggle(prev, key as AllPathKeys)); }, [submitted]);
  const handleClickEX  = useCallback((key: keyof EXPath)  => { if (!submitted) setSelected(prev => toggle(prev, key as AllPathKeys)); }, [submitted]);
  const handleClickMEM = useCallback((key: keyof MEMPath) => { if (!submitted) setSelected(prev => toggle(prev, key as AllPathKeys)); }, [submitted]);
  const handleClickWB  = useCallback((key: keyof WBPath)  => { if (!submitted) setSelected(prev => toggle(prev, key as AllPathKeys)); }, [submitted]);

  const handleSubmit = () => { if (selected.size > 0) setSubmitted(true); };

  const handleNext = () => {
    setQuestionIndex(i => (i + 1) % QUESTIONS.length);
    setSelected(new Set());
    setSubmitted(false);
    setActiveBlock(null);
  };

  const getIFColour = makeStageColour(selected, correctSet, submitted, SELECTABLE_IF)  as (k: keyof IFPath)  => string;
  const getIDColour = makeStageColour(selected, correctSet, submitted, SELECTABLE_ID)  as (k: keyof IDPath)  => string;
  const getEXColour = makeStageColour(selected, correctSet, submitted, SELECTABLE_EX)  as (k: keyof EXPath)  => string;
  const getMEMColour = makeStageColour(selected, correctSet, submitted, SELECTABLE_MEM) as (k: keyof MEMPath) => string;
  const getWBColour = makeStageColour(selected, correctSet, submitted, SELECTABLE_WB)  as (k: keyof WBPath)  => string;

  const hits   = submitted ? [...selected].filter(k => correctSet.has(k)).length : 0;
  const wrong  = submitted ? selected.size - hits : 0;
  const missed = submitted ? [...correctSet].filter(k => !selected.has(k)).length : 0;
  const perfect = submitted && wrong === 0 && missed === 0;

  // Hover tooltip (after submitting only)
  const tooltipText  = submitted && activeBlock ? buildHoverText(activeBlock, question) : null;
  const hoverContent = tooltipText
    ? React.createElement("div", {
        xmlns: "http://www.w3.org/1999/xhtml",
        style: { fontSize: 12, whiteSpace: "pre-wrap", wordWrap: "break-word", color: "black", height: "150px", overflow: "auto", padding: "5px", marginRight: "10px" },
      }, tooltipText)
    : undefined;

  return (
    <div className="space-y-4">

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${
              i < questionIndex ? "bg-indigo-400" : i === questionIndex ? "bg-indigo-600" : "bg-gray-200"
            }`} />
          ))}
        </div>
        <span className="text-xs text-gray-400">{questionIndex + 1} / {QUESTIONS.length}</span>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-3">
        <p className="text-sm font-medium text-gray-800">
          Which datapath segments are active when executing:
        </p>
        <code className="mt-1 block text-base font-mono font-semibold text-indigo-700">
          {question.label}
        </code>
      </div>

      {/* Diagram */}
      <PipelineDatapathSVG
        getIFColour={getIFColour}
        getIDColour={getIDColour}
        getEXColour={getEXColour}
        getMEMColour={getMEMColour}
        getWBColour={getWBColour}
        onBlockHover={submitted ? setActiveBlock : undefined}
        hoverContent={hoverContent}
        active={true}
        hideStageLabels={true}
        activeStages={activeStages}
        activeStageColor=""
        analysisText={submitted
          ? "Hover over a block to see what it does for this instruction."
          : "Click segments on the diagram to select them."}
        onSegmentClickIF={submitted  ? undefined : handleClickIF}
        onSegmentClickID={submitted  ? undefined : handleClickID}
        onSegmentClickEX={submitted  ? undefined : handleClickEX}
        onSegmentClickMEM={submitted ? undefined : handleClickMEM}
        onSegmentClickWB={submitted  ? undefined : handleClickWB}
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
          perfect ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-900"
        }`}>
          <p className="font-semibold">
            {perfect ? "✓ Perfect! All segments correct." : `${hits} of ${correctSet.size} segments correct`}
          </p>
          {wrong > 0 && (
            <p className="text-xs">
              <span className="font-medium text-red-700">{wrong} incorrect</span> — segments you selected that aren't active for this instruction.
            </p>
          )}
          {missed > 0 && (
            <p className="text-xs">
              <span className="font-medium text-amber-700">{missed} missed</span> — active segments you didn't select (shown in orange).
            </p>
          )}
          <div className="pt-1 text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1.5">
              Active segments for <code className="font-mono">{question.label}</code>:
            </p>
            {(["IF", "ID", "EX", "MEM", "WB"] as const).map(stage => {
              const stageKeys = [...correctSet].filter(k => SEGMENT_LABELS[k]?.stage === stage);
              if (stageKeys.length === 0) return null;
              return (
                <div key={stage} className="mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stage}</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {stageKeys.map(k => (
                      <span key={k} className={`px-2 py-0.5 rounded-full border text-xs ${
                        selected.has(k)
                          ? "bg-green-100 border-green-400 text-green-800"
                          : "bg-amber-100 border-amber-400 text-amber-800"
                      }`}>
                        {SEGMENT_LABELS[k]?.label ?? k}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
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
                  setQuestionIndex(i => Math.max(0, i - 1));
                  setSelected(new Set());
                  setSubmitted(false);
                  setActiveBlock(null);
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