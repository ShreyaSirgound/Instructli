
import type { DataPath, Block_Data } from '@/utils/return-types';
//import { executeRType, executeBType, handleITypeArithmetic } from '@/utils/execute-commands';

export type JsonResponse = {
  data_path: DataPath;
  block_data: Block_Data;
  command_type: string;
};

export enum CommandType {
  IType,
  RType,
  BType,
  JType,
  UType,
  SType
}

// const instructionTypeMap: Record<string, CommandType> = {
//   // R-Type
//   add: CommandType.RType,
//   sub: CommandType.RType,
//   and: CommandType.RType,
//   or:  CommandType.RType,
//   xor: CommandType.RType,
//   sll: CommandType.RType,
//   srl: CommandType.RType,
//   sra: CommandType.RType,
//   slt: CommandType.RType,
//   sltu: CommandType.RType,
//   mul:  CommandType.RType,
//   mulh: CommandType.RType,
//   mulsu: CommandType.RType,
//   mulu: CommandType.RType,
//   div:  CommandType.RType,
//   divu: CommandType.RType,
//   rem:  CommandType.RType,
//   remu: CommandType.RType,

//   // I-Type
//   addi: CommandType.IType,
//   andi: CommandType.IType,
//   ori:  CommandType.IType,
//   xori: CommandType.IType,
//   slli: CommandType.IType,
//   srli: CommandType.IType,
//   srai: CommandType.IType,
//   slti: CommandType.IType,
//   sltiu: CommandType.IType,
//   li:   CommandType.IType,
//   lb:   CommandType.IType,
//   lh:   CommandType.IType,
//   lw:   CommandType.IType,
//   lbu:  CommandType.IType,
//   lhu:  CommandType.IType,
//   jalr: CommandType.IType,

//   // S-Type
//   sb:   CommandType.SType,
//   sh:   CommandType.SType,
//   sw:   CommandType.SType,

//   // B-Type
//   beq:  CommandType.BType,
//   bne:  CommandType.BType,
//   blt:  CommandType.BType,
//   bge:  CommandType.BType,
//   bltu: CommandType.BType,
//   bgeu: CommandType.BType,

//   // U-Type
//   lui:   CommandType.UType,
//   auipc: CommandType.UType,

//   // J-Type
//   jal: CommandType.JType
// };

const defaultDataPath: DataPath = {
  branch_taken: false,
  mux_pc: false,
  pc_increment: false,
  pc_default: false,
  pc_add: false,
  im_reg1: false,
  im_reg2: false,
  im_reg_write: false,
  im_imm_gen: false,
  imm_gen_shift: false,
  imm_gen_mux: false,
  reg1_mux: false,
  reg2_mux: false,
  mux_alu: false,
  zero: false,
  alu_res_mem: false,
  alu_res_mux: false,
  reg2_dm: false,
  dm_mux: false,
  reg_write: false,
  alu_src: false,
  memto_reg: false,
  mem_read: false,
  mem_write: false, // NOTE (HALF): Unused, what a mess
  reg_write_control: false,
  branch: false,
  alu_op_0: false,
  alu_op_1: false
};

// simple register file
// const namedRegisterMemory: Record<string, number> = {
//   x0: 0, x1: 0, x2: 0, x3: 0, x4: 0, x5: 0,
//   x6: 0, x7: 0, x8: 0, x9: 0, x10: 0
// };

/**
 * Parse and simulate a single RISC‑V instruction, returning datapath signals.
 * @param rawCmd e.g. "add x1 x2 x3"
 */


export function returnPath(command: string, commandType: string): JsonResponse | never {
    const [instruction] = command.split(' ');

    if (commandType === 'R-Type') {
        const dataPath: DataPath = {
            ...defaultDataPath,
            mux_pc: true, pc_increment: true, pc_default: true,
            im_reg1: true, im_reg2: true, im_reg_write: true,
            reg1_mux: true, reg2_mux: true, mux_alu: true,
            alu_res_mux: true, reg_write: true,
            alu_op_1: true, alu_op_0: true, reg_write_control: true
        };

        const blockData: Block_Data = {
            pc: { 
                value: 'PC = PC + 4', 
                comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.'
            },
            default_adder: {
                value: 'Adds 4 to the current PC value to get the address of the next instruction.'
            
            },
            instruction_mem: { 
                value: command, 
                comment: 'Instruction Memory: Stores program instructions. Outputs the fetched R-type instruction (at the current PC address) for decoding and execution.'
            },
            registers: {
                read_register_1: { 
                    value: 'Val(x6)', 
                    comment: 'Read Register 1: Reads value from source register rs1 (first operand)'
                },
                read_register_2: { 
                    value: 'Val(x7)', 
                    comment: 'Read Register 2: Reads value from source register rs2 (second operand)'
                },
                write_register: { 
                    value: 'x28 ← ALU_result', 
                    comment: 'Write Register: Writes ALU result back to destination register rd'
                }
            },
            alu: { 
                alu_result: 'ALU: Performs arithmetic/logic operation on two register values. The ALU executes computations like addition or subtraction.'
            },
            data_memory: { 
                read_data: 'Read Data: No data is read from memory in R type instructions', 
                write_data: 'Write Data: No data is written to memory in R type instructions'
            }
        };

        if (instruction === 'add') {
            blockData.registers.write_register.value = 'x28 ← Val(x6) + Val(x7)';
            blockData.registers.write_register.comment = 'Write Register: Writes sum to destination register rd';
            blockData.alu.alu_result = `The ALU is responsible for performing arithematic operations.\nIn this case it performs ADD operation → Val(x6) + Val(x7). `;
        } 
        else if (instruction === 'sub') {
            blockData.registers.read_register_1.value = 'Val(x6)';
            blockData.registers.read_register_1.comment = 'Read Register 1: Reads value from source register rs1';
            blockData.registers.read_register_2.value = 'Val(x7)';
            blockData.registers.read_register_2.comment = 'Read Register 2: Reads value from source register rs2';
            blockData.registers.write_register.value = 'x28 ← Val(x6) - Val(x7)';
            blockData.registers.write_register.comment = 'Write Register: Writes difference to destination register rd';
            blockData.alu.alu_result = `The ALU is responseible for performing arithematic operations.\nIn this case it performs SUB operation → Val(x6) - Val(x7). `;
        }

        return { data_path: dataPath, block_data: blockData, command_type: 'R' };
    }

    else if (commandType === 'I-Type') {
        if (instruction === 'addi') {
            const dataPath: DataPath = {
                ...defaultDataPath,
                mux_pc: true, pc_increment: true, pc_default: true,
                im_reg1: true, im_reg_write: true, im_imm_gen: true,
                reg1_mux: true, imm_gen_mux: true, mux_alu: true,
                alu_res_mux: true, reg_write: true,
                alu_src: true, reg_write_control: true
            };

            const block_data: Block_Data = {
                pc: { 
                    value: 'PC = PC + 4', 
                    comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.'
                },
                default_adder: {
                value: 'Adds 4 to the current PC value to get the address of the next instruction.'
                },
                immediate_generator: {
                    value: `Extracts and sign-extends the immediate value from the instruction for use in ALU operations.\nInput: The instruction: addi x7, x6, 5\nOutput: The immediate value: 5`
                },
                instruction_mem: { 
                    value: command, 
                    comment: 'Instruction Memory: Stores program instructions. Outputs the fetched I-type instruction (at the current PC address) containing immediate value for decoding and execution.'
                },
                registers: {
                    read_register_1: { 
                        value: 'Val(x6)', 
                        comment: 'Read Register 1: Reads value from source register rs1.'
                    },
                    read_register_2: { 
                        value: 'Not used', 
                        comment: 'Read Register 2: Second read port not used (immediate value used instead).'
                    },
                    write_register: { 
                        value: 'x7 ← Val(x6) + 5', 
                        comment: 'Write Register: Writes sum of register and immediate to destination register rd.'
                    }
                },
                alu: { 
                    alu_result: `The ALU is responseible for performing arithematic operations.\nIn this case it performs ADD operation → Val(x6) + 5 (immediate).`
                },
                data_memory: { 
                    read_data: 'Read Data: No data is read from memory for this instruction', 
                    write_data: 'Write Data: No data is written to the memory for this instruction'
                }
            };
            return { data_path: dataPath, block_data: block_data, command_type: 'I' };
        }
        else if (instruction === 'lw') {
            const dataPath: DataPath = {
            ...defaultDataPath,
            pc_default: true, mux_pc: true, pc_increment: true,
            im_reg1: true, im_imm_gen: true, im_reg_write: true,
            reg1_mux: true, imm_gen_mux: true, mux_alu: true,
            alu_res_mem: true, reg_write: true, dm_mux: true,
            alu_src: true, memto_reg: true, mem_read: true
            }   

            const block_data: Block_Data = {
                pc: { 
                    value: 'PC = PC + 4', 
                    comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.'
                },
                default_adder: {
                value: 'Adds 4 to the current PC value to get the address of the next instruction.'
                },
                immediate_generator: {
                    value: `Extracts and sign-extends the immediate value from the instruction for use in ALU operations.\nInput: The instruction: lw x6, 4(x9)\nOutput: The immediate value: 4`
                },
                instruction_mem: { 
                    value: command, 
                    comment: 'Instruction Memory: Stores program instructions. Outputs the fetched load instruction (at the current PC address) with base register and offset for decoding and execution.'
                },
                registers: {
                    read_register_1: { 
                        value: 'Val(x9)', 
                        comment: 'Read Register 1: Reads base address from source register rs1'
                    },
                    read_register_2: { 
                        value: 'Not used', 
                        comment: 'Read Register 2: Second read port not used (offset is immediate)'
                    },
                    write_register: { 
                        value: 'x6 ← Memory[Val(x9) + 4]', 
                        comment: 'Write Register: Writes loaded data from memory to destination register rd'
                    }
                },
                alu: { 
                    alu_result: 'The ALU is responsible for performing arithematic operation.\n In this case it performs ADD operation to calculate the memory address from which data needs to be loaded.\nALU Result: Val(x9) + 4 (address calculation).'
                },
                data_memory: { 
                    read_data: 'Read Data: Reads word from address [Val(x9) + 4].', 
                    write_data: 'Write Data: No data written to memory for this instruction'
                }
            };
            return { data_path: dataPath, block_data: block_data, command_type: 'I' };
        }
        else{
            throw Error;
        }
    }

    else if (commandType === 'B-Type') {
        const dataPath: DataPath = {
            ...defaultDataPath,
            mux_pc: true, pc_increment: true, pc_default: true,
            im_reg1: true, im_reg2: true, reg1_mux: true,
            reg2_mux: true, im_imm_gen: true, imm_gen_shift: true, mux_alu: true,
            pc_add: true, zero: true,
            branch_taken: true, branch: true, alu_op_0: true
        };

        const block_data: Block_Data = {
            pc: { 
                value: 'PC = PC + 16 (We are assuming that the branch is taken)', 
                comment: 'Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to branch target (PC + offset) if condition met, or PC + 4 otherwise.'
            },
            instruction_mem: { 
                value: command, 
                comment: 'Instruction Memory: Stores program instructions. Outputs the fetched branch instruction (at the current PC address) with comparison registers and offset for decoding and execution.'
            },
            default_adder: {
                value: 'Adds 4 to the current PC value to get the address of the next instruction.'
                },
            immediate_generator: {
                value: `Extracts and sign-extends the immediate value from the instruction for use in branch target calculation.\nInput: The instruction: beq x28, x27, 8\nOutput: The immediate value: 8`
            },
            branch_adder: {
                value: `Calculates the branch target address by adding the sign-extended immediate to the current PC value.\nOutputs: PC + 16`
            },
            registers: {
                read_register_1: { 
                    value: 'Val(x28)', 
                    comment: 'Read Register 1: Reads first value for comparison from source register rs1'
                },
                read_register_2: { 
                    value: 'Val(x27)', 
                    comment: 'Read Register 2: Reads second value for comparison from source register rs2'
                },
                write_register: { 
                    value: 'N/A', 
                    comment: 'Write Register: No register write (branch instructions don\'t modify registers)'
                }
            },
            alu: { 
                alu_result: 'ALU: Comparison operation for branch condition evaluation. The ALU executes computations like addition or subtraction, here used for comparison.'
            },
            data_memory: { 
                read_data: 'Read Data: No data read from memory.', 
                write_data: 'Write Data: No data written to memory.'
            }
        };

        if (instruction === 'bne') {
            dataPath.zero = false;
            dataPath.branch_taken = false;
            block_data.immediate_generator = {value: `Extracts and sign-extends the immediate value from the instruction for use in branch target calculation.\nInput: The instruction: bne x28, x27, 8\nOutput: The immediate value: 8`};
            block_data.branch_adder = {value: `Calculates the branch target address by adding the sign-extended immediate to the current PC value.\nOutputs: PC + 16`}; 
            block_data.pc.value = 'PC=PC + 4 (We are assuming that branch is not taken)';
            block_data.registers.read_register_1.value = 'Val(x28)';
            block_data.registers.read_register_1.comment = 'Read Register 1: Reads first value for inequality comparison from rs1.';
            block_data.registers.read_register_2.value = 'Val(x27)';
            block_data.registers.read_register_2.comment = 'Read Register 2: Reads second value for inequality comparison from rs2.';
            block_data.alu.alu_result = 'The ALU executes computations like addition or subtraction, here used for comparison. ALU: BNE operation → Compare Val(x28) to Val(x27), branch if not equal. \n\nNote: We are assuming that both registers have the same values.';
        } else if (instruction === 'beq') {
            block_data.alu.alu_result = 'The ALU executes computations like addition or subtraction, here used for comparison.\nALU: BEQ operation → Compare Val(x28) to Val(x27), branch if equal.\n\nNote: We are assuming that both register values have the same in this case.';
        }

        return { data_path: dataPath, block_data: block_data, command_type: 'B' };
    }

    else if (commandType === 'S-Type') {
        if (instruction === 'sw') {
             const dataPath: DataPath = {
            ...defaultDataPath,
            pc_default: true, mux_pc: true, pc_increment: true,
            im_reg1: true, im_reg2: true, im_imm_gen: true,
            reg1_mux: true, imm_gen_mux: true, mux_alu: true,
            reg2_dm: true, alu_res_mem: true, alu_src: true, mem_write: true
            };

            const block_data: Block_Data = {
                pc: { 
                    value: 'PC = PC + 4', 
                    comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next instruction.'
                },
                default_adder: {
                value: 'Adds 4 to the current PC value to get the address of the next instruction.'
                },
                immediate_generator: {
                    value: `Extracts and sign-extends the immediate value from the instruction for use in branch target calculation.\nInput: The instruction: sw x9, 4(x18)\nOutput: The immediate value: 4`
                },

                instruction_mem: { 
                    value: command, 
                    comment: 'Instruction Memory: Stores program instructions. Outputs the fetched store instruction (at the current PC address) with base register, source register, and offset for decoding and execution.'
                },
                registers: {
                    read_register_1: { 
                        value: 'Val(x18)', 
                        comment: 'Read Register 1: Reads base address from source register rs1'
                    },
                    read_register_2: { 
                        value: 'Val(x9)', 
                        comment: 'Read Register 2: Reads data value to store from source register rs2'
                    },
                    write_register: { 
                        value: 'Not used', 
                        comment: ' Write Register: No register write (store instructions don\'t write to registers)'
                    }
                },
                alu: { 
                    alu_result: `The ALU executes computations like addition or subtraction.\nADD operation → Val(x18) + 4 (address calculation).`
                },
                data_memory: { 
                    read_data: 'Read Data: No data read from memory for this instruction', 
                    write_data: 'Data Memory: Stores Val(x9) at address [Val(x18) + 4]. Data Memory stores program data for load/store operations.'
                }
            };
            return { data_path: dataPath, block_data: block_data, command_type: 'S' };
        }
        else{
            throw Error
        }
    }

    else {
        throw Error;
    }
}

// export function processCommand(rawCmd: string): JsonResponse | never {
//     const command = rawCmd.replace(/\s*,\s*/g, ' ').trim().replace(/\s+/g, ' ');
//     if (command === '') throw new Error('Command parameter is required');
//     console.log(command);

//     const instruction = command.split(' ')[0].toLowerCase();

//     if (!(instruction in instructionTypeMap)) {
//         throw new Error('Invalid Instruction');
//     }

//     const commandType: CommandType = instructionTypeMap[instruction];

//     // R-TYPE
//     if (commandType === CommandType.RType) {
//         const [, writeRegister = '', readRegister1 = '', readRegister2 = ''] = command.split(' ');
//         if (!writeRegister || !readRegister1 || !readRegister2) {
//             throw new Error(`Missing R-type operands: ${writeRegister}, ${readRegister1}, ${readRegister2}`);
//         }
//         const readValue1 = namedRegisterMemory[readRegister1];
//         const readValue2 = namedRegisterMemory[readRegister2];

//         executeRType(instruction, writeRegister, readRegister1, readRegister2, namedRegisterMemory);

//         const dataPath: DataPath = {
//             ...defaultDataPath,
//             mux_pc: true, pc_increment: true, pc_default: true,
//             im_reg1: true, im_reg2: true, im_reg_write: true,
//             reg1_mux: true, reg2_mux: true, mux_alu: true,
//             alu_res_mux: true, reg_write: true,
//             alu_op_1: true, alu_op_0: true, reg_write_control: true
//         };

//         const block_data: Block_Data = {
//             pc: {
//                 value: 'pc + 4',
//                 comment: 'Increment PC by 4'
//             },
//             instruction_mem: {
//                 value: `command: ${command}`,
//                 comment: 'Fetch instruction from memory'
//             },
//             registers: {
//                 read_register_1: { value: `${readRegister1} = ${readValue1}`, comment: 'Read first operand' },
//                 read_register_2: { value: `${readRegister2} = ${readValue2}`, comment: 'Read second operand' },
//                 write_register: { value: `${writeRegister} = ${namedRegisterMemory[writeRegister]}`, comment: 'Write destination' }
//             },
//             alu: {
//                 alu_result: `Perform ${instruction} operation`
//             },
//             data_memory: {
//                 read_data: 'N/A',
//                 write_data: 'N/A'
//             }
//         };

//         return { data_path: dataPath, block_data, command_type: 'R' };
//     }

//     // B-TYPE
//     if (commandType === CommandType.BType) {
//         const [, readRegister1 = '', readRegister2 = '', immediate] = command.split(' ');
//         if (!readRegister1 || !readRegister2 || !immediate) {
//             throw new Error('Missing operands for B-type instruction');
//         }

//         const branch_taken = executeBType(instruction, namedRegisterMemory[readRegister1], namedRegisterMemory[readRegister2]);
//         const basePath: DataPath = {
//             ...defaultDataPath,
//             mux_pc: true, pc_increment: true, pc_default: true,
//             im_reg1: true, im_reg2: true, reg1_mux: true,
//             reg2_mux: true, im_imm_gen: true, imm_gen_shift: true,
//             imm_gen_mux: branch_taken, pc_add: true, zero: branch_taken,
//             branch_taken: true, branch: true, alu_op_0: true
//         };

//         const block_data: Block_Data = {
//             pc: {
//                 value: branch_taken ? `pc + ${immediate}` : 'pc + 4',
//                 comment: branch_taken ? 'Branch taken' : 'Branch not taken'
//             },
//             instruction_mem: {
//                 value: `command: ${command}`,
//                 comment: 'Fetch branch instruction'
//             },
//             registers: {
//                 read_register_1: { value: `${readRegister1}=${namedRegisterMemory[readRegister1]}`, comment: 'Compare value 1' },
//                 read_register_2: { value: `${readRegister2}=${namedRegisterMemory[readRegister2]}`, comment: 'Compare value 2' },
//                 write_register: { value: 'N/A', comment: 'No write on branch' }
//             },
//             alu: {
//                 alu_result: `Compare ${readRegister1} and ${readRegister2}`
//             },
//             data_memory: {
//                 read_data: 'N/A',
//                 write_data: 'N/A'
//             }
//         };

//         return { data_path: basePath, block_data, command_type: 'B' };
//     }

//     // S-TYPE
//     if (commandType === CommandType.SType) {
//         const [, readRegister2 = '', offsetAndBase = ''] = command.split(' ');
//         const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
//         if (!readRegister2 || !match) {
//             throw new Error(`Invalid S-type format. Expected: sw <reg>, offset(base)`);
//         }

//         const [, offset, baseRegister] = match;
//         const dataPath: DataPath = {
//             ...defaultDataPath,
//             pc_default: true, mux_pc: true, pc_increment: true,
//             im_reg1: true, im_reg2: true, im_imm_gen: true,
//             reg1_mux: true, imm_gen_mux: true, mux_alu: true,
//             reg2_dm: true, alu_res_mem: true, alu_src: true, mem_write: true
//         };

//         const block_data: Block_Data = {
//             pc: { value: 'pc + 4', comment: 'Next instruction' },
//             instruction_mem: { value: `sw ${readRegister2}, ${offset}(${baseRegister})`, comment: 'Store instruction' },
//             registers: {
//                 read_register_1: { value: baseRegister, comment: 'Base address' },
//                 read_register_2: { value: readRegister2, comment: 'Value to store' },
//                 write_register: { value: 'N/A', comment: 'No destination register' }
//             },
//             alu: { alu_result: `base (${baseRegister}) + offset (${offset})` },
//             data_memory: { read_data: 'N/A', write_data: readRegister2 }
//         };

//         return { data_path: dataPath, block_data, command_type: 'S' };
//     }

//     // I-TYPE
//     if (commandType === CommandType.IType) {
//         const parts = command.split(' ');
//         const instruction = parts[0].toLowerCase();

//         // LI special case
//         if (instruction === 'li') {
//             const [, writeRegister = '', immediate = ''] = parts;
//             if (!writeRegister || isNaN(Number(immediate))) {
//                 throw new Error(`Invalid li instruction`);
//             }
//             namedRegisterMemory[writeRegister] = Number(immediate);

//             const dataPath: DataPath = {
//                 ...defaultDataPath,
//                 mux_pc: true, pc_increment: true, pc_default: true,
//                 im_reg1: true, im_reg_write: true, im_imm_gen: true,
//                 reg1_mux: true, imm_gen_mux: true, mux_alu: true,
//                 alu_res_mux: true, reg_write: true,
//                 alu_src: true, reg_write_control: true
//             };

//             const block_data: Block_Data = {
//                 pc: { value: 'pc + 4', comment: 'Next instruction' },
//                 instruction_mem: { value: `li ${writeRegister}, ${immediate}`, comment: 'Load immediate' },
//                 registers: {
//                     read_register_1: { value: 'x0', comment: 'Always 0' },
//                     read_register_2: { value: 'N/A', comment: 'N/A' },
//                     write_register: { value: `${writeRegister}=${immediate}`, comment: 'Write immediate' }
//                 },
//                 alu: { alu_result: `Load ${immediate} into ${writeRegister}` },
//                 data_memory: { read_data: 'N/A', write_data: 'N/A' }
//             };

//             return { data_path: dataPath, block_data, command_type: 'I' };
//         }

//         // I-type arithmetic (e.g., addi x3, x1, 5)
//         if (!instruction.startsWith('l')) {
//             const [, writeRegister = '', readRegister1 = '', immediate = ''] = parts;
//             if (!writeRegister || !readRegister1 || isNaN(Number(immediate))) {
//                 throw new Error(`Invalid operands for ${instruction}`);
//             }
//             const regBefore = namedRegisterMemory[readRegister1]
//             console.log("testing regBefore", regBefore)

//             handleITypeArithmetic(instruction, writeRegister, readRegister1, immediate, namedRegisterMemory);

//             const dataPath: DataPath = {
//                 ...defaultDataPath,
//                 mux_pc: true, pc_increment: true, pc_default: true,
//                 im_reg1: true, im_reg_write: true, im_imm_gen: true,
//                 reg1_mux: true, imm_gen_mux: true, mux_alu: true,
//                 alu_res_mux: true, reg_write: true,
//                 alu_src: true, reg_write_control: true
//             };

//             const block_data: Block_Data = {
//                 pc: { value: 'pc + 4', comment: 'Next instruction' },
//                 instruction_mem: { value: command, comment: 'Arithmetic I-type instruction' },
//                 registers: {
//                     read_register_1: { value: `${readRegister1}=${regBefore}`, comment: 'Read operand' },
//                     read_register_2: { value: 'N/A', comment: 'N/A' },
//                     write_register: { value: `${writeRegister}=${namedRegisterMemory[writeRegister]}`, comment: 'Write result' }
//                 },
//                 alu: { alu_result: `Perform ${instruction} with immediate ${immediate}` },
//                 data_memory: { read_data: 'N/A', write_data: 'N/A' }
//             };

//             return { data_path: dataPath, block_data, command_type: 'I' };
//         }

//         // I-type loads: e.g., lw x2, 0(x1)
//         const [, writeRegister = '', offsetAndBase = ''] = parts;
//         const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
//         if (!match) throw new Error(`Invalid I-type load syntax`);

//         const [, offset, baseRegister] = match;

//         const dataPath: DataPath = {
//             ...defaultDataPath,
//             pc_default: true, mux_pc: true, pc_increment: true,
//             im_reg1: true, im_imm_gen: true, im_reg_write: true,
//             reg1_mux: true, imm_gen_mux: true, mux_alu: true,
//             alu_res_mem: true, reg_write: true, dm_mux: true,
//             alu_src: true, memto_reg: true, mem_read: true
//         };

//         const block_data: Block_Data = {
//             pc: { value: 'pc + 4', comment: 'Next instruction' },
//             instruction_mem: { value: command, comment: 'Load instruction' },
//             registers: {
//                 read_register_1: { value: baseRegister, comment: 'Base address' },
//                 read_register_2: { value: 'N/A', comment: 'N/A' },
//                 write_register: { value: writeRegister, comment: 'Destination for load' }
//             },
//             alu: { alu_result: `base (${baseRegister}) + offset (${offset})` },
//             data_memory: { read_data: `Mem[${baseRegister} + ${offset}]`, write_data: 'N/A' }
//         };

//         return { data_path: dataPath, block_data, command_type: 'I' };
//     }

//     throw new Error('Unsupported command type');
// }

// export function resetRegisters(): void {
//     for (const reg in namedRegisterMemory) {
//         namedRegisterMemory[reg] = 0;
//     }
// }