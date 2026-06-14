import { useState } from "react";
import React from "react";
import type { DataPath, Block_Data } from "../../src/utils/return-types";
import { JsonResponse } from "../../src/utils/single-processor";
import DatapathSVG from "./DatapathSVG";

type SingleProcessorProps = {
  results: JsonResponse | null | undefined;
};

const defaultDataPath: DataPath = {
  branch_taken: false, mux_pc: false, pc_increment: false, pc_default: false,
  pc_add: false, im_reg1: false, im_reg2: false, im_reg_write: false,
  im_imm_gen: false, imm_gen_shift: false, imm_gen_mux: false, reg1_mux: false,
  reg2_mux: false, mux_alu: false, zero: false, alu_res_mem: false,
  alu_res_mux: false, reg2_dm: false, dm_mux: false, reg_write: false,
  alu_src: false, memto_reg: false, reg_write_control: false, mem_read: false,
  mem_write: false, branch: false, alu_op_0: false, alu_op_1: false,
};

const defaultBlockData: Block_Data = {
  pc: { value: "", comment: "" },
  instruction_mem: { value: "", comment: "" },
  default_adder: { value: "" },
  registers: {
    read_register_1: { value: "", comment: "" },
    read_register_2: { value: "", comment: "" },
    write_register: { value: "", comment: "" },
  },
  alu: { alu_result: "" },
  data_memory: { read_data: "", write_data: "" },
};

// Block-label → hover text builder (keeps the original tooltip copy intact).
function buildHoverText(label: string | null, dp: DataPath, bd: Block_Data): string | null {
  if (!label) return null;
  switch (label) {
    case "INSTRUCTION MEMORY":
      return `INSTRUCTION MEMORY:\n${bd.instruction_mem.comment}\n\n${bd.instruction_mem.value}`;
    case "PC":
      return `${bd.pc.comment}\n\n${bd.pc.value}`;
    case "DATA MEMORY":
      return `DATA MEMORY:\n${bd.data_memory.read_data}\n\n${bd.data_memory.write_data}`;
    case "REGISTER FILE":
      return (
        `REGISTER FILES:\n` +
        `${bd.registers.read_register_1.comment}:  ${bd.registers.read_register_1.value}\n\n` +
        `${bd.registers.read_register_2.comment}:  ${bd.registers.read_register_2.value}\n\n` +
        `${bd.registers.write_register.comment}:  ${bd.registers.write_register.value}\n\n`
      );
    case "IMMEDIATE GENERATOR":
      return `IMMEDIATE GENERATOR:\n ${bd.immediate_generator?.value ?? ""}`;
    case "ALU":
      return `ALU:\n${bd.alu.alu_result}\n`;
    case "ADD (Branch Target)":
      return `ADD (Branch Target Calculation):\n${bd.branch_adder?.value ?? ""}`;
    case "ADD (PC + 4)":
      return `ADD(PC + 4):\n${bd.default_adder?.value ?? ""}`;
    case "MUX (Next PC)":
      return dp.pc_increment
        ? `MUX (Next PC):\n${dp.pc_increment ? "The Mux uses signal from the controller to determine the next PC. In this case, the Mux takes value 0 making the PC + 4" : ""}.`
        : "";
        case "MUX (ALU Input)":
      return dp.mux_alu
        ? `MUX (ALU Input):\n${dp.imm_gen_mux ? "The Mux gets the value of 1 indicating that it takes value from the Immediate Generator" : "The Mux gets the value of 0 indicating that it takes value from the register file"}.`
        : "";
    case "MUX (Write Back)":
      return dp.reg_write
        ? `MUX (Write Data):\n${dp.dm_mux ? "The Mux gets the value of 1 indicating that it writes from Data Memory" : "The Mux gets the value of 0 indicating that it writes from the ALU"}.`
        : "";
    default:
      return label;
  }
}

export default function SingleProcessor({ results }: SingleProcessorProps) {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const dp = results?.data_path ?? defaultDataPath;
  const bd = results?.block_data ?? defaultBlockData;
  const active = results != null;
  const arrowColour = "#ff0000";

  // getColour: red if the segment is active in results, black otherwise.
  const getColour = (key: keyof DataPath): string =>
    active && dp[key] ? arrowColour : "#000000";

  const tooltipText = buildHoverText(activeBlock, dp, bd);
  const hoverContent = tooltipText
    ? React.createElement(
        "div",
        {
          xmlns: "http://www.w3.org/1999/xhtml",
          style: { fontSize: 12, whiteSpace: "pre-wrap", wordWrap: "break-word" },
        },
        tooltipText
      )
    : undefined;

  return (
    <DatapathSVG
      getColour={getColour}
      onBlockHover={setActiveBlock}
      hoverContent={hoverContent}
    />
  );
}