import { useState } from "react";
import React from "react";
import type {
  IFPath, IDPath, EXPath, MEMPath, WBPath,
  IFComponents, IDComponents, EXComponents, MEMComponents,
  StagePathMap, StageComponents, PipelineState,
} from "../../src/utils/pipeline-types";
import PipelineDatapathSVG from "./PipelineDatapathSVG";

type PipelineProcessorProps = {
  results: PipelineState[];
  currCycle: number;
  currentPreset: { index: number; note: string } | null;
};

const defaultIFPath: IFPath = {
  branch_taken: false, mux_pc: false, pc_increment: false,
  pc_default: false, pc_id: false, pc_im: false, im_id: false,
};
const defaultIDPath: IDPath = {
  id_reg1: false, id_reg2: false, id_reg_write: false, id_imm_gen: false,
  imm_ex: false, id_ex: false, reg1_ex: false, reg2_ex: false,
};
const defaultEXPath: EXPath = {
  ex_add: false, add_mem: false, reg1_alu: false, reg2_mux: false,
  ex_shift: false, ex_mux: false, mux_alu: false, reg2_mem: false,
  zero_mem: false, alu_mem: false,
};
const defaultMEMPath: MEMPath = {
  zero_mem2: false, alu_dm: false, reg2_dm: false, dm_wb: false, alu_wb: false,
};
const defaultWBPath: WBPath = {
  dm_mux: false, alu_mux: false, reg_write: false,
};

const defaultIFComponents: IFComponents = {
  pc: { value: "", comment: "" },
  instruction_mem: { value: "", comment: "" },
  default_adder: { value: "" },
};
const defaultIDComponents: IDComponents = {
  registers: {
    read_register_1: { value: "", comment: "" },
    read_register_2: { value: "", comment: "" },
    write_register:  { value: "", comment: "" },
  },
};
const defaultEXComponents: EXComponents = { alu: { alu_result: "" } };
const defaultMEMComponents: MEMComponents = {
  data_memory: { read_data: "", write_data: "" },
};

function buildHoverText(
  label: string | null,
  ifPath: IFPath, idPath: IDPath, exPath: EXPath, memPath: MEMPath, wbPath: WBPath,
  ifComp: IFComponents, idComp: IDComponents, exComp: EXComponents, memComp: MEMComponents,
  stageLabels: { IF?: string; ID?: string; EX?: string; MEM?: string; WB?: string },
  hazards: string[],
): string | null {
  if (!label) return null;

  switch (label) {
    case "PC":
      return `PC\n\n${ifComp.pc.comment || "N/A"}\n${ifComp.pc.value || "N/A"}`;

    case "INSTRUCTION MEMORY":
      return stageLabels.IF
        ? `INSTRUCTION MEMORY\n\nFetching: ${stageLabels.IF}\n\n${ifComp.instruction_mem.comment || "N/A"}\n${ifComp.instruction_mem.value || "N/A"}`
        : null;

    case "ADD (PC + 4)":
      return `ADD (PC + 4)\n\n${ifComp.default_adder?.value || "N/A"}`;

    case "REGISTER FILE":
      return stageLabels.ID
        ? `REGISTER FILE\n\nDecoding: ${stageLabels.ID}\n\n` +
          `${idComp.registers.read_register_1.comment || "N/A"}: ${idComp.registers.read_register_1.value || "N/A"}\n` +
          `${idComp.registers.read_register_2.comment || "N/A"}: ${idComp.registers.read_register_2.value || "N/A"}\n` +
          `${idComp.registers.write_register.comment  || "N/A"}: ${idComp.registers.write_register.value  || "N/A"}`
        : null;

    case "IMMEDIATE GENERATOR":
      return stageLabels.ID
        ? idPath.id_imm_gen
          ? `IMMEDIATE GENERATOR\n\nFor ${stageLabels.ID}, sign-extends the immediate field.\n\n${idComp.imm_gen?.value ?? "N/A"}`
          : `IMMEDIATE GENERATOR\n\n${stageLabels.ID} does not use an immediate — this unit is inactive.`
        : null;

    case "ALU":
      return stageLabels.EX
        ? `ALU\n\nExecuting: ${stageLabels.EX}\n\n${exComp.alu.alu_result || "N/A"}`
        : null;

    case "ADD (Branch Target)":
      return stageLabels.EX
        ? `ADD (Branch Target)\n\nFor ${stageLabels.EX}:\n${exComp.branch_adder?.value || "Not a branch instruction — branch adder inactive."}`
        : null;

    case "MUX (ALU Input)":
      return stageLabels.EX
        ? `MUX (ALU Input)\n\nFor ${stageLabels.EX}: ${
            exPath.ex_mux
              ? "ALUSrc=1 — selects the sign-extended immediate as the second ALU operand."
              : "ALUSrc=0 — selects register data 2 as the second ALU operand."
          }`
        : null;

    case "DATA MEMORY":
      return stageLabels.MEM
        ? `DATA MEMORY\n\nFor ${stageLabels.MEM}:\n${memComp.data_memory.read_data || "N/A"}\n\n${memComp.data_memory.write_data || "N/A"}`
        : null;

    case "MUX (Next PC)":
      return stageLabels.IF
        ? `MUX (Next PC)\n\n${
            ifPath.branch_taken
              ? "Branch taken — selecting branch target address as next PC."
              : "No branch taken — selecting PC+4 as next PC."
          }`
        : null;

    case "MUX (Write Back)":
      return stageLabels.WB
        ? `MUX (Write Back)\n\nFor ${stageLabels.WB}: ${
            wbPath.dm_mux
              ? "MemToReg=1 — writing data read from memory back to the register file."
              : "MemToReg=0 — writing ALU result back to the register file."
          }`
        : null;

    case "HAZARDS":
      return `HAZARDS:\n${hazards.length ? hazards.join("\n") : "None"}`;

    default:
      return label;
  }
}

export default function PipelineProcessor({ results, currCycle, currentPreset }: PipelineProcessorProps) {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const arrowColour = "#ff0000";

  const latestResult = results.length > 0 ? results[currCycle] : null;

  const ifPath  = latestResult?.stageDetails?.IF  ?? defaultIFPath;
  const idPath  = latestResult?.stageDetails?.ID  ?? defaultIDPath;
  const exPath  = latestResult?.stageDetails?.EX  ?? defaultEXPath;
  const memPath = latestResult?.stageDetails?.MEM ?? defaultMEMPath;
  const wbPath  = latestResult?.stageDetails?.WB  ?? defaultWBPath;

  const ifComp  = latestResult?.component?.IF  ?? defaultIFComponents;
  const idComp  = latestResult?.component?.ID  ?? defaultIDComponents;
  const exComp  = latestResult?.component?.EX  ?? defaultEXComponents;
  const memComp = latestResult?.component?.MEM ?? defaultMEMComponents;

  const stageLabels = latestResult?.stages ?? {};
  const hazards     = latestResult?.hazards ?? [];

  const getIFColour  = (key: keyof IFPath)  => ifPath[key]  ? arrowColour : "#000000";
  const getIDColour  = (key: keyof IDPath)  => idPath[key]  ? arrowColour : "#000000";
  const getEXColour  = (key: keyof EXPath)  => exPath[key]  ? arrowColour : "#000000";
  const getMEMColour = (key: keyof MEMPath) => memPath[key] ? arrowColour : "#000000";
  const getWBColour  = (key: keyof WBPath)  => wbPath[key]  ? arrowColour : "#000000";

  const tooltipText = buildHoverText(
    activeBlock,
    ifPath, idPath, exPath, memPath, wbPath,
    ifComp, idComp, exComp, memComp,
    stageLabels, hazards,
  );

  const hoverContent = tooltipText
    ? React.createElement(
        "div",
        { xmlns: "http://www.w3.org/1999/xhtml", style: { fontSize: 12, whiteSpace: "pre-wrap", wordWrap: "break-word", color: "black", height: "150px", overflow: "auto", padding: "5px", marginRight: "10px" } },
        tooltipText
      )
    : undefined;

  return (
    <PipelineDatapathSVG
      getIFColour={getIFColour}
      getIDColour={getIDColour}
      getEXColour={getEXColour}
      getMEMColour={getMEMColour}
      getWBColour={getWBColour}
      onBlockHover={setActiveBlock}
      hoverContent={hoverContent}
      stageLabels={stageLabels}
      hazards={hazards}
      active={latestResult != null}
      analysisText={currentPreset ? `Analysis:\n${currentPreset.note}` : undefined}
    />
  );
}