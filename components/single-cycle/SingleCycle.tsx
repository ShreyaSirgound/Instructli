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
      return `INSTRUCTION MEMORY\nStores all program instructions and outputs the instruction at the given address.\n\n${bd.instruction_mem.comment}\n\n${bd.instruction_mem.value}`;
    case "PC":
      return `PROGRAM COUNTER (PC)\nHolds the address of the current instruction being executed.\n\n${bd.pc.comment}\n\n${bd.pc.value}`;
    case "DATA MEMORY":
      return `DATA MEMORY\nStores program data (loaded by lw, stored by sw). Allows reading and writing in a single cycle.\n\n${bd.data_memory.read_data}\n\n${bd.data_memory.write_data}`;
    case "REGISTER FILE":
      return (
        `REGISTER FILE\nStores CPU registers (x0–x31). Allows simultaneous reading of two registers and writing one register per cycle.\n\n` +
        `${bd.registers.read_register_1.comment}:  ${bd.registers.read_register_1.value}\n\n` +
        `${bd.registers.read_register_2.comment}:  ${bd.registers.read_register_2.value}\n\n` +
        `${bd.registers.write_register.comment}:  ${bd.registers.write_register.value}\n\n`
      );
    case "IMMEDIATE GENERATOR":
      return `IMMEDIATE GENERATOR\nExtracts the 12-bit immediate field from the instruction and sign-extends it to 32 bits.\n\n${bd.immediate_generator?.value ?? ""}`;
    case "ALU":
      return `ARITHMETIC LOGIC UNIT (ALU)\nPerforms arithmetic (add, subtract) and logical (and, or) operations on two 32-bit operands.\n\n${bd.alu.alu_result}\n`;
    case "ADD (Branch Target)":
      return `ADDER (Branch Target)\nComputes the branch target address by adding the sign-extended immediate to the PC.\n\n${bd.branch_adder?.value ?? ""}`;
    case "ADD (PC + 4)":
      return `ADDER (PC + 4)\nComputes the next sequential program counter value by adding 4 to the current PC.\n\n${bd.default_adder?.value ?? ""}`;
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