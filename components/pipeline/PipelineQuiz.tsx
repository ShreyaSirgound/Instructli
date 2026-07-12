"use client";

import React, { useCallback, useMemo, useState } from "react";
import type {
  IFPath, IDPath, EXPath, MEMPath, WBPath, PipelineState,
} from "../../src/utils/pipeline-types";
import { instructionTypeMap, CommandType } from "../../src/utils/pipeline-types";
import { simulatePipeline } from "../../src/utils/pipeline-processor";
import PipelineDatapathSVG from "./PipelineDatapathSVG";

type StageId = "IF" | "ID" | "EX" | "MEM" | "WB";
const STAGE_ORDER: StageId[] = ["IF", "ID", "EX", "MEM", "WB"];

type AnyStagePath = IFPath | IDPath | EXPath | MEMPath | WBPath;

type Program = {
  label: string;
  lines: string[];
  colors: Record<string, string>;
  states: PipelineState[];
};

const PALETTE = ["#4f46e5", "#0891b2", "#c2410c"];

function buildProgram(label: string, lines: string[]): Program {
  let states: PipelineState[] = [];
  try {
    states = simulatePipeline(lines);
  } catch (err) {
    console.error(`PipelineQuiz: simulatePipeline failed for "${label}"`, err);
    states = [];
  }
  const colors: Record<string, string> = {};
  lines.forEach((line, i) => { colors[line] = PALETTE[i % PALETTE.length]; });
  return { label, lines, colors, states };
}

const PROGRAMS: Program[] = [
  buildProgram("Arithmetic & immediate (no hazards)", [
    "add x28, x29, x31",
    "li x29, 10",
    "addi x28, x5, 10",
  ]),
  buildProgram("Logic, immediate & store (no hazards)", [
    "sub x10, x11, x12",
    "andi x13, x14, 5",
    "sw x15, 0(x16)",
  ]),
  buildProgram("Load, logic & branch (no hazards)", [
    "lw x1, 0(x2)",
    "or x3, x4, x5",
    "beq x6, x7, 8",
  ]),
];

const EMPTY_STATE: PipelineState = { cycle: 0, stages: {}, hazards: [] };

function buildHoverText(label: string | null, state: PipelineState, checked: boolean): string | null {
  if (!label || !checked) return null;

  switch (label) {
    case "PC":
    case "INSTRUCTION MEMORY":
      return state.stages.IF ? `${label}\n\nFetching: ${state.stages.IF}` : null;
    case "ADD (PC + 4)":
      return state.stages.IF ? `ADD (PC + 4)\n\nIncrements the PC for the instruction after "${state.stages.IF}".` : null;
    case "MUX (Next PC)":
      return state.stages.IF
        ? `MUX (Next PC)\n\n${state.stageDetails?.IF?.branch_taken ? "Branch taken — selects the branch target." : "No branch taken — selects PC+4."}`
        : null;
    case "REGISTER FILE":
      return state.stages.ID ? `REGISTER FILE\n\nDecoding: ${state.stages.ID}` : null;
    case "IMMEDIATE GENERATOR":
      return state.stages.ID
        ? state.stageDetails?.ID?.id_imm_gen
          ? `IMMEDIATE GENERATOR\n\nSign-extends the immediate for "${state.stages.ID}".`
          : `IMMEDIATE GENERATOR\n\n"${state.stages.ID}" does not use an immediate — inactive this cycle.`
        : null;
    case "ALU":
      return state.stages.EX ? `ALU\n\nExecuting: ${state.stages.EX}` : null;
    case "ADD (Branch Target)":
      return state.stages.EX
        ? `ADD (Branch Target)\n\nFor "${state.stages.EX}": ${state.stageDetails?.EX?.ex_add ? "computes the branch target." : "not a branch — inactive."}`
        : null;
    case "MUX (ALU Input)":
      return state.stages.EX
        ? `MUX (ALU Input)\n\nFor "${state.stages.EX}": ${state.stageDetails?.EX?.ex_mux ? "ALUSrc=1 — immediate selected." : "ALUSrc=0 — register data selected."}`
        : null;
    case "DATA MEMORY":
      return state.stages.MEM
        ? `DATA MEMORY\n\nFor "${state.stages.MEM}": ${state.stageDetails?.MEM?.reg2_dm ? "writing to memory (store)." : "reading from memory (load)."}`
        : null;
    case "MUX (Write Back)":
      return state.stages.WB
        ? `MUX (Write Back)\n\nFor "${state.stages.WB}": ${state.stageDetails?.WB?.dm_mux ? "MemToReg=1 — memory data written back." : "MemToReg=0 — ALU result written back."}`
        : null;
    case "IF/ID":
      return `IF/ID\n\nHolds the fetched instruction and PC so decode can run next cycle without waiting on fetch.`;
    case "ID/EX":
      return `ID/EX\n\nCarries decoded register values, control signals, and immediates into execute.`;
    case "EX/MEM":
      return `EX/MEM\n\nStores the ALU result and register data for the memory stage.`;
    case "MEM/WB":
      return `MEM/WB\n\nHolds the memory or ALU result until write-back writes it into the register file.`;
    case "HAZARDS":
      return `HAZARDS\n\nThis program has none — nothing depends on an in-flight instruction and there's no branch.`;
    default:
      return null;
  }
}

const TYPE_NAMES: Record<CommandType, string> = {
  [CommandType.RType]: "R-type",
  [CommandType.IType]: "I-type",
  [CommandType.SType]: "S-type",
  [CommandType.BType]: "B-type",
  [CommandType.UType]: "U-type",
  [CommandType.JType]: "J-type",
};

function mnemonicOf(instr: string): string {
  return instr.trim().split(/[\s,]+/)[0] ?? "";
}

function typeOf(instr: string): string | null {
  const type = instructionTypeMap[mnemonicOf(instr)];
  return type === undefined ? null : TYPE_NAMES[type];
}

function stageHint(stage: StageId, instr: string): string {
  const type = typeOf(instr);
  const typeTag = type ? ` (a ${type} instruction)` : "";
  switch (stage) {
    case "IF":
      return `IF is fetching "${instr}"${typeTag} from instruction memory and computing the next PC.`;
    case "ID":
      return `ID is decoding "${instr}"${typeTag} — think about which register ports it needs to read, and whether its format calls for an immediate to be generated.`;
    case "EX":
      return `EX is executing "${instr}"${typeTag} in the ALU — consider whether its second operand comes from a register or an immediate, and whether a branch target needs computing.`;
    case "MEM":
      return `MEM is handling "${instr}"${typeTag} — consider whether this instruction actually touches data memory, or just passes its result through.`;
    case "WB":
      return `WB is finishing "${instr}"${typeTag} — consider whether it writes a result back to the register file, and if so, where that value comes from.`;
  }
}

function buildCycleExplanation(state: PipelineState, occupiedStages: StageId[]): string {
  if (occupiedStages.length === 0) return "No instruction occupies any stage this cycle.";
  return occupiedStages.map((s) => stageHint(s, state.stages[s]!)).join("\n\n");
}

function toggle(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  next.has(key) ? next.delete(key) : next.add(key);
  return next;
}

function trueKeys(path: AnyStagePath | undefined): string[] {
  if (!path) return [];
  return Object.entries(path).filter(([, v]) => v).map(([k]) => k);
}

export default function PipelineProcessorQuiz() {
  const [programIndex, setProgramIndex] = useState(0);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [sessionStats, setSessionStats] = useState({ hits: 0, wrong: 0, missed: 0 });

  const program = PROGRAMS[programIndex];
  const PROGRAM_LINES = program.lines;
  const INSTR_COLORS = program.colors;
  const PIPELINE_STATES = program.states;

  const state = PIPELINE_STATES[cycleIdx] ?? EMPTY_STATE;

  const occupiedStages = useMemo(
    () => STAGE_ORDER.filter((s) => !!state.stages[s]),
    [state]
  );

  const correctSet = useMemo(() => {
    const set = new Set<string>();
    occupiedStages.forEach((s) => trueKeys(state.stageDetails?.[s]).forEach((k) => set.add(k)));
    return set;
  }, [occupiedStages, state]);

  const canCheck = !checked && (selected.size > 0 || correctSet.size === 0);

  const colourForStage = useCallback((stageId: StageId, key: string): string => {
    if (!occupiedStages.includes(stageId)) return "#000000";
    if (checked) {
      const isSel = selected.has(key);
      const isOk = correctSet.has(key);
      if (isOk && isSel) return "#16a34a";
      if (!isOk && isSel) return "#dc2626";
      if (isOk && !isSel) return "#f59e0b";
      return "#000000";
    }
    return selected.has(key) ? "#2563eb" : "#000000";
  }, [occupiedStages, checked, selected, correctSet]);

  const getIFColour = useCallback((k: keyof IFPath) => colourForStage("IF", k), [colourForStage]);
  const getIDColour = useCallback((k: keyof IDPath) => colourForStage("ID", k), [colourForStage]);
  const getEXColour = useCallback((k: keyof EXPath) => colourForStage("EX", k), [colourForStage]);
  const getMEMColour = useCallback((k: keyof MEMPath) => colourForStage("MEM", k), [colourForStage]);
  const getWBColour = useCallback((k: keyof WBPath) => colourForStage("WB", k), [colourForStage]);

  const handleToggle = useCallback((stageId: StageId, key: string) => {
    if (checked || !occupiedStages.includes(stageId)) return;
    setSelected((prev) => toggle(prev, key));
  }, [checked, occupiedStages]);

  const onSegmentClickIF = occupiedStages.includes("IF") && !checked ? (k: keyof IFPath) => handleToggle("IF", k) : undefined;
  const onSegmentClickID = occupiedStages.includes("ID") && !checked ? (k: keyof IDPath) => handleToggle("ID", k) : undefined;
  const onSegmentClickEX = occupiedStages.includes("EX") && !checked ? (k: keyof EXPath) => handleToggle("EX", k) : undefined;
  const onSegmentClickMEM = occupiedStages.includes("MEM") && !checked ? (k: keyof MEMPath) => handleToggle("MEM", k) : undefined;
  const onSegmentClickWB = occupiedStages.includes("WB") && !checked ? (k: keyof WBPath) => handleToggle("WB", k) : undefined;

  const handleCheckCycle = () => {
    if (!canCheck) return;
    setChecked(true);
    const hits = [...selected].filter((k) => correctSet.has(k)).length;
    const wrong = selected.size - hits;
    const missed = [...correctSet].filter((k) => !selected.has(k)).length;
    setSessionStats((prev) => ({ hits: prev.hits + hits, wrong: prev.wrong + wrong, missed: prev.missed + missed }));
  };

  const handleNextCycle = () => {
    if (cycleIdx >= PIPELINE_STATES.length - 1) { setFinished(true); return; }
    setCycleIdx((c) => c + 1);
    setSelected(new Set());
    setChecked(false);
    setActiveBlock(null);
  };

  const resetProgressState = () => {
    setCycleIdx(0);
    setSelected(new Set());
    setChecked(false);
    setActiveBlock(null);
    setFinished(false);
    setSessionStats({ hits: 0, wrong: 0, missed: 0 });
  };

  const handleRestart = () => resetProgressState();

  const handlePrevQuestion = () => {
    if (programIndex === 0) return;
    setProgramIndex((p) => p - 1);
    resetProgressState();
  };

  const handleNextQuestion = () => {
    if (programIndex >= PROGRAMS.length - 1) return;
    setProgramIndex((p) => p + 1);
    resetProgressState();
  };

  // Register highlight (existing behaviour): turns blue once you've engaged with a stage
  const activeStages = new Set<StageId>();
  STAGE_ORDER.forEach((s) => {
    if (occupiedStages.includes(s) && (checked || selected.size > 0)) activeStages.add(s);
  });

  // Background wash: shows which stages are open for clicking, before any selection is made
  const clickableStages = new Set<StageId>();
  if (!checked && !finished) {
    occupiedStages.forEach((s) => clickableStages.add(s));
  }

  // Per-stage instruction color, matching the terminal banner above.
  // Used to tint the background wash and the stage-label pill text
  const stageColors: { IF?: string; ID?: string; EX?: string; MEM?: string; WB?: string } = {};
  STAGE_ORDER.forEach((s) => {
    const occupant = state.stages[s];
    if (occupant) stageColors[s] = INSTR_COLORS[occupant];
  });

  const hoverText = buildHoverText(activeBlock, state, checked);
  const hoverContent = hoverText
    ? React.createElement("div", {
        xmlns: "http://www.w3.org/1999/xhtml",
        style: { fontSize: 12, whiteSpace: "pre-wrap", wordWrap: "break-word", color: "black", height: "150px", overflow: "auto", padding: "5px", marginRight: "10px" },
      }, hoverText)
    : undefined;

  const hits = checked ? [...selected].filter((k) => correctSet.has(k)).length : 0;
  const wrong = checked ? selected.size - hits : 0;
  const missed = checked ? [...correctSet].filter((k) => !selected.has(k)).length : 0;
  const cyclePerfect = checked && wrong === 0 && missed === 0;
  const cycleExplanation = checked ? buildCycleExplanation(state, occupiedStages) : null;

  if (PIPELINE_STATES.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
        Couldn't build the pipeline simulation for this program. Check the console for details.
      </div>
    );
  }

  const finalStats = sessionStats;
  const finalTotal = finalStats.hits + finalStats.wrong + finalStats.missed;
  const finalPerfect = finalStats.wrong === 0 && finalStats.missed === 0;

  return (
    <div className="space-y-4">

      {/* Exercise explanation */}
      <div className="text-sm text-gray-700 space-y-1.5">
        <p>
            For each instruction set below, click every path segment on the diagram that carries a signal during execution — one cycle at a time.
            The cycle(s) in use are highlighted and annotated with their respective instruction.
        </p>
      </div>

      <div className="rounded-xl  space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">Question {programIndex + 1} of {PROGRAMS.length}</h3>
          <span className="text-gray-300">—</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevQuestion}
              disabled={programIndex === 0}
              aria-label="Previous question"
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:border-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={programIndex >= PROGRAMS.length - 1}
              aria-label="Next question"
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:border-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        <div className="border border-gray-300 rounded bg-gray-50">
          <div
            className="my-2 mx-2 mb-2 text-sm font-mono text-opacity-80 overflow-auto whitespace-pre"
            style={{ lineHeight: "1.5", tabSize: 2 }}
          >
            {PROGRAM_LINES.map((line, index) => {
              const stageForLine = STAGE_ORDER.find((s) => state.stages[s] === line) ?? null;
              const isActive = stageForLine !== null;

              return (
                <span
                  key={index}
                  className={`flex items-center justify-between px-2 rounded transition-colors ${isActive ? "font-semibold" : "text-gray-400"} ${
                    isActive && !checked ? "ring-0 ring-indigo-500" : ""
                  }`}
                  style={{
                    color: isActive ? INSTR_COLORS[line] : undefined,
                    backgroundColor: isActive ? `${INSTR_COLORS[line]}1a` : "transparent",
                  }}
                >
                  <span>{line}</span>
                  {isActive && (
                    <span className="text-xs font-sans font-normal text-gray-500">
                      {stageForLine}{checked ? " ✓" : ""}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cycle progress */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {PIPELINE_STATES.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${
              i < cycleIdx || finished ? "bg-indigo-400" : i === cycleIdx ? "bg-indigo-600" : "bg-gray-200"
            }`} />
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {finished ? `Complete — ${PIPELINE_STATES.length} cycles` : `Cycle ${state.cycle} / ${PIPELINE_STATES.length}`}
        </span>
      </div>

      <PipelineDatapathSVG
        getIFColour={getIFColour}
        getIDColour={getIDColour}
        getEXColour={getEXColour}
        getMEMColour={getMEMColour}
        getWBColour={getWBColour}
        onBlockHover={checked ? setActiveBlock : undefined}
        hoverContent={hoverContent}
        stageLabels={state.stages}
        active={true}
        activeStages={activeStages}
        activeStageColor=""
        clickableStages={clickableStages}
        stageColors={stageColors}
        analysisText={
          finished
            ? "Program complete — see the summary below. The diagram is frozen on the final cycle."
            : checked
              ? "Cycle checked — hover any block for more detail, see the summary below."
              : `Click every segment active this cycle${occupiedStages.length ? ` (across ${occupiedStages.join(", ")})` : ""}, then check.`
        }
        onSegmentClickIF={onSegmentClickIF}
        onSegmentClickID={onSegmentClickID}
        onSegmentClickEX={onSegmentClickEX}
        onSegmentClickMEM={onSegmentClickMEM}
        onSegmentClickWB={onSegmentClickWB}
      />

      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-blue-600" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-green-600" /> Correct</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-red-600" /> Incorrectly selected</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-amber-500" /> Missed</span>
      </div>

      {!finished && !checked && (
        <div className="flex gap-3">
          <button
            onClick={handleCheckCycle}
            disabled={!canCheck}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Check this cycle
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:border-gray-500 transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {!finished && checked && (
        <div className={`rounded-xl border px-5 py-4 text-sm space-y-3 ${
          cyclePerfect ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-900"
        }`}>
          <p className="font-semibold">
            Cycle {state.cycle} summary: {hits} correct
            {wrong > 0 && <span className="ml-2 text-red-700">{wrong} incorrect</span>}
            {missed > 0 && <span className="ml-2 text-amber-700">{missed} missed</span>}
            {correctSet.size === 0 && <span className="ml-2 text-gray-500">(no stages active this cycle)</span>}
          </p>
          {cycleExplanation && (
            <p className="whitespace-pre-line text-xs leading-relaxed text-gray-700 border-t border-black/10 pt-2">
              {cycleExplanation}
            </p>
          )}
          <button
            onClick={handleNextCycle}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {cycleIdx >= PIPELINE_STATES.length - 1 ? "Finish program" : "Next cycle →"}
          </button>
        </div>
      )}

      {finished && (
        <div className={`rounded-xl border px-5 py-4 text-sm space-y-2 ${finalPerfect ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
          <p className="font-semibold">{finalPerfect ? `✓ Perfect run through all ${PIPELINE_STATES.length} cycles!` : `Program complete — ${finalStats.hits} correct selections`}</p>
          <p className="text-xs">
            {finalStats.wrong > 0 && <span className="mr-3 text-red-700">{finalStats.wrong} incorrect</span>}
            {finalStats.missed > 0 && <span className="text-amber-700">{finalStats.missed} missed</span>}
            {finalTotal === 0 && <span>No selections recorded.</span>}
          </p>
          {programIndex < PROGRAMS.length - 1 && (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Next question →
            </button>
          )}
        </div>
      )}

      <div className="text-right">
        <button onClick={handleRestart} className="text-xs text-gray-400 hover:text-gray-600 underline">
          Restart this question
        </button>
      </div>
    </div>
  );
}