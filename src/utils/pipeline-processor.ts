import { instructionTypeMap, CommandType, PipelineState, IFPath,
     IDPath, EXPath, MEMPath, WBPath, IFComponents, IDComponents, EXComponents, MEMComponents} from "./pipeline-types";  


type PipelineStage = 'IF' | 'ID' | 'EX' | 'MEM' | 'WB';
const pipelinestates = ['IF', 'ID', 'EX', 'MEM', 'WB'];



export function handlePipeLinePreset(index: number): PipelineState[] | never{
  const pipelineStates: PipelineState[] = [];

  if (index === 0) {
    // Preset 0: Data Hazard Example
    // Instructions: add x28, x29, x31; sub x5, x28, x6

    // Cycle 1: add x28, x29, x31 in IF
    pipelineStates.push({
      cycle: 1,
      stages: { IF: 'add x28, x29, x31', ID: undefined, EX: undefined, MEM: undefined, WB: undefined },
      hazards: [],
      stageDetails: {
        IF: {
          branch_taken: false,
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: false,
          pc_im: true,
          im_id: true
        }
      },
      component: {
        IF: {
          pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
          instruction_mem: { value: 'add x28, x29, x31', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched R-type instruction (at current PC address) for decoding and execution' },
          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}
        },
        ID: undefined,
        EX: undefined,
        MEM: undefined,
        WB: null
      }
    });
    // Cycle 2: add x28, x29, x31 in ID, sub x5, x28, x6 in IF
    pipelineStates.push({
      cycle: 2,
      stages: { IF: 'sub x5, x28, x6', ID: 'add x28, x29, x31', EX: undefined, MEM: undefined, WB: undefined },
      hazards: [],
      stageDetails: {
        IF: {
          branch_taken: false,
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: false,
          pc_im: true,
          im_id: true
        },
        ID: {
          id_reg1: true,
          id_reg2: true,
          id_reg_write: true,
          id_imm_gen: false,
          imm_ex: false,
          id_ex: false,
          reg1_ex: true,
          reg2_ex: true
        }
      },
      component: {
        IF: {
          pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
          instruction_mem: { value: 'sub x5, x28, x6', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched R-type instruction (at current PC address) for decoding and execution' },
          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}
        },
        ID: {
          registers: {
            read_register_1: { value: 'Val(x29)', comment: 'Read Register 1: Reads value from source register x29' },
            read_register_2: { value: 'Val(x31)', comment: 'Read Register 2: Reads value from source register x31' },
            write_register: { value: 'x28', comment: 'Write Register: Destination register x28 for ALU result' }
          }
        },
        EX: undefined,
        MEM: undefined,
        WB: null
      }
    });
    // Cycle 3: add x28, x29, x31 in EX, sub x5, x28, x6 in ID
    pipelineStates.push({
      cycle: 3,
      stages: { IF: undefined, ID: 'sub x5, x28, x6', EX: 'add x28, x29, x31', MEM: undefined, WB: undefined },
      hazards: ['Data hazard: Instruction 2 needs x28 from instruction 1 but Val(x28) is not ready after EX. Stalling the processor by adding bubble to resolve.'],
      stageDetails: {
        IF: undefined,
        ID: {
          id_reg1: true,
          id_reg2: true,
          id_reg_write: true,
          id_imm_gen: false,
          imm_ex: false,
          id_ex: false,
          reg1_ex: true,
          reg2_ex: true
        },
        EX: {
          ex_add: false,
          add_mem: false,
          reg1_alu: true,
          reg2_mux: true,
          ex_shift: false,
          ex_mux: false,
          mux_alu: true,
          reg2_mem: false,
          zero_mem: false,
          alu_mem: true
        }
      },
      component: {
        IF: undefined,
        ID: {
          registers: {
            read_register_1: { value: 'Val(x28)', comment: 'Read Register 1: Reads value from source register x28' },
            read_register_2: { value: 'Val(x6)', comment: 'Read Register 2: Reads value from source register x6' },
            write_register: { value: 'x5', comment: 'Write Register: Destination register x5 for ALU result' }
          }
        },
        EX: {
          alu: { alu_result: 'ALU: Performs ADD operation → Val(x29) + Val(x31).' }
        },
        MEM: undefined,
        WB: null
      }
    });
    // Cycle 4: add x28, x29, x31 in MEM, bubble in EX, sub x5, x28, x6 in ID, nothing in IF
    pipelineStates.push({
      cycle: 4,
      stages: { IF: undefined, ID: 'sub x5, x28, x6', EX: '        bubble', MEM: 'add x28, x29, x31', WB: undefined },
      hazards: [],
      stageDetails: {
        IF: undefined,
        ID: {
          id_reg1: true,
          id_reg2: true,
          id_reg_write: true,
          id_imm_gen: false,
          imm_ex: false,
          id_ex: false,
          reg1_ex: true,
          reg2_ex: true
        },
        EX: undefined,
        MEM: {
          zero_mem2: false,
          alu_dm: false,
          reg2_dm: false,
          dm_wb: false,
          alu_wb: true
        }
      },
      component: {
        IF: undefined,
        ID: {
          registers: {
            read_register_1: { value: 'Val(x28)', comment: 'Read Register 1: Reads value from source register x28' },
            read_register_2: { value: 'Val(x6)', comment: 'Read Register 2: Reads value from source register x6' },
            write_register: { value: 'x5', comment: 'Write Register: Destination register x5 for ALU result' }
          }
        },
        EX: undefined,
        MEM: {
          data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
        },
        WB: null
      }
    });
    // Cycle 5: add x28, x29, x31 in WB, bubble in MEM, bubble in EX, sub x5, x28, x6 in ID, nothing in IF
    pipelineStates.push({
      cycle: 5,
      stages: { IF: undefined, ID: 'sub x5, x28, x6', EX: '        bubble', MEM: '        bubble', WB: 'add x28, x29, x31' },
      hazards: [],
      stageDetails: {
        ID: {
          id_reg1: true,
          id_reg2: true,
          id_reg_write: true,
          id_imm_gen: false,
          imm_ex: false,
          id_ex: false,
          reg1_ex: true,
          reg2_ex: true
        },
        EX: undefined,
        MEM: undefined,
        WB: {
          dm_mux: false,
          alu_mux: true,
          reg_write: true
        }
      },
      component: {
        IF: undefined,
        ID: {
          registers: {
            read_register_1: { value: 'Val(x28)', comment: 'Read Register 1: Reads value from source register x28' },
            read_register_2: { value: 'Val(x6)', comment: 'Read Register 2: Reads value from source register x6' },
            write_register: { value: 'x5', comment: 'Write Register: Destination register x5 for ALU result.\nNote that x28 is now written back.\n\n' }
          }
        },
        EX: undefined,
        MEM: {
          data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
        },
        WB: null
      }
    });

    // Cycle 6: bubble in WB, bubble in MEM, sub x5, x28, x6 in EX, nothing in ID, nothing in IF
    pipelineStates.push({
      cycle: 6,
      stages: { IF: undefined, ID: undefined, EX: 'sub x5, x28, x6', MEM: '        bubble', WB: '        bubble' },
      hazards: [],
      stageDetails: {
        ID: undefined,
        EX: {
          ex_add: false,
          add_mem: false,
          reg1_alu: true,
          reg2_mux: true,
          ex_shift: false,
          ex_mux: false,
          mux_alu: true,
          reg2_mem: false,
          zero_mem: false,
          alu_mem: true
        },
        MEM: undefined
      },
      component: {
        IF: undefined,
        ID: undefined,
        EX: {
          alu: { alu_result: 'ALU: Performs ADD operation → Val(x28) - Val(x6).' }
        },
        MEM: undefined,
        WB: null
      }
    });
    // Cycle 7: bubble in WB, sub x5, x28, x6 in MEM, nothing in EX, nothing in ID, nothing in IF
    pipelineStates.push({
      cycle: 7,
      stages: { IF: undefined, ID: undefined, EX: undefined, MEM: 'sub x5, x28, x6', WB: '        bubble' },
      hazards: [],
      stageDetails: {
        IF: undefined,
        EX: undefined,
        MEM: {
          zero_mem2: false,
          alu_dm: false,
          reg2_dm: false,
          dm_wb: false,
          alu_wb: true
        },
        WB: undefined
      },
      component: {
        IF: undefined,
        ID: undefined,
        EX: undefined,
        MEM: {
          data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
        },
        WB: null
      }
    });
    // Cycle 8: sub x5, x28, x6 in WB
    pipelineStates.push({
      cycle: 8,
      stages: { IF: undefined, ID: undefined, EX: undefined, MEM: undefined, WB: 'sub x5, x28, x6' },
      hazards: [],
      stageDetails: {
        ID: undefined,
        MEM: undefined,
        WB: {
          dm_mux: false,
          alu_mux: true,
          reg_write: true
        }
      },
      component: {
        IF: undefined,
        ID: {
          registers: {
            read_register_1: {value: "", comment: ""},
            read_register_2: {value: "", comment: ""},
            write_register: { value: '', comment: 'Write Register: N/A\nNote that x28 is now written back.\n\n\n\n' }
          }
        },
        EX: undefined,
        MEM: undefined,
        WB: null
      }
      
    });
    return pipelineStates
  }
  else if (index === 1) {
    // Preset 1: Control Hazard Example
    // Instructions: add x30, x31, x5; beq x1, x0, 40; addi x28, x0, 10

    // Cycle 1: add x30, x31, x5 in IF
    pipelineStates.push({
      cycle: 1,
      stages: { IF: 'add x30, x31, x5', ID: undefined, EX: undefined, MEM: undefined, WB: undefined },
      hazards: [],
      stageDetails: {
        IF: {
          branch_taken: false,
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: false,
          pc_im: true,
          im_id: true
        }
      },
      component: {
        IF: {
          pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
          instruction_mem: { value: 'add x30, x31, x5', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched R-type instruction (at current PC address) for decoding and execution' },
          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}
        },
        ID: undefined,
        EX: undefined,
        MEM: undefined,
        WB: null
      }
    });

    // Cycle 2: beq x1, x0, 40 in IF, add x30, x31, x5 in ID (speculative)
    pipelineStates.push({
      cycle: 2,
      stages: { IF: 'beq x1, x0, 40', ID: 'add x30, x31, x5', EX: undefined, MEM: undefined, WB: undefined },
      hazards: [],
      stageDetails: {
        IF:{
          branch_taken: false,
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: true,
          pc_im: true,
          im_id: true
        },
        ID: {
          id_reg1: true,
          id_reg2: true,
          id_reg_write: true,
          id_imm_gen: false,
          imm_ex: false,
          id_ex: false,
          reg1_ex: true,
          reg2_ex: true
        }
      },
      component: {
        IF: {
          pc: { value: 'PC = PC + 4 (Fetch next instruction in sequence branch result unknown)', comment: 'Program Counter (PC): Current value of PC is used to fetch instruction from memory than value of PC is incremented.' },
          instruction_mem: { value: 'beq x1, x0, 40', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched B-type instruction (at current PC address) for decoding and execution' }
          , default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}

        },
        ID: {
          registers: {
            read_register_1: { value: 'Val(x31)', comment: 'Read Register 1: Reading value from register x31' },
            read_register_2: { value: 'Val(x5)', comment: 'Read Register 2: Reading value from register x5' },
            write_register: { value: 'x30', comment: 'Write Register: Destination register to write results' }
          }
        },
        EX: undefined,
        MEM: undefined,
        WB: null
      }
    });

    // Cycle 3: addi x28, x0, 10 in IF, beq x1, x0, 40 in ID, add x30, x31, x5 in EX
    pipelineStates.push({
      cycle: 3,
      stages: { IF: 'addi x28, x0, 10', ID: 'beq x1, x0, 40', EX: 'add x30, x31, x5', MEM: undefined, WB: undefined },
      hazards: [],
      stageDetails: {
        IF: {
          branch_taken: false, 
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: false, 
          pc_im: true,
          im_id: true
        },
        ID: {
          id_reg1: true,
          id_reg2: true,
          id_reg_write: false,
          id_imm_gen: true,
          imm_ex: true,
          id_ex: true,
          reg1_ex: true,
          reg2_ex: true
        },
        EX: {
          ex_add: false,
          add_mem: false,
          reg1_alu: true,
          reg2_mux: true,
          ex_shift: false,
          ex_mux: false,
          mux_alu: true,
          reg2_mem: false,
          zero_mem: false,
          alu_mem: true
        }
      },
     component: {
        IF: {
          pc: { value: 'PC = PC + 4 (Fetch next instruction in sequence branch result unknown)', comment: 'Program Counter (PC): Current value of PC is used to fetch instruction from memory than value of PC is incremented.' },
          instruction_mem: { value: 'addi x28, x0, 10', comment: `Instruction Memory: Speculatively fetching instruction.\n` },
          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}
        },
        ID: {
          registers: {
            read_register_1: { value: 'Val(x1)', comment: 'Read Register 1: Reads value from register x1 for branch comparison' },
            read_register_2: { value: 'Val(x0)', comment: 'Read Register 2: Reads value from register x0 for branch comparison' },
            write_register: { value: 'N/A', comment: 'Write Register: No write register' },
          },
          imm_gen: { value: `Extracts and sign-extends the immediate value from the instruction for use in branch target calculation.\nInput: The instruction: beq x1, x0, 40\nOutput: The immediate value: 40.`},
        },
        EX: {
          alu: { alu_result: 'ALU: Performs ADD operation → Val(x31) + Val(x5)' }
        },
        MEM: undefined,
        WB: null
      }
    });

    // Cycle 4: addi x28, x0, 10 in ID, beq x1, x0, 40 in EX, add x30, x31, x5 in MEM
    pipelineStates.push({
      cycle: 4,
      stages: { IF: undefined, ID: 'addi x28, x0, 10', EX: 'beq x1, x0, 40', MEM: 'add x30, x31, x5', WB: undefined },
      hazards: [],
      stageDetails: {
        IF: undefined,
        ID: {
          id_reg1: true,
          id_reg2: false,
          id_reg_write: true,
          id_imm_gen: true,
          imm_ex: true,
          id_ex: false,
          reg1_ex: true,
          reg2_ex: false
        },
        EX: {
          ex_add: true, // Branch address calculation
          add_mem: true,
          reg1_alu: true,
          reg2_mux: true,
          ex_shift: true,
          ex_mux: false,
          mux_alu: true,
          reg2_mem: false,
          zero_mem: true, // Branch condition result
          alu_mem: false
        },
        MEM: {
          zero_mem2: false,
          alu_dm: false,
          reg2_dm: false,
          dm_wb: false,
          alu_wb: true
        }
      },
      component: {
        IF: undefined,
        ID: {
          registers: {
            read_register_1: { value: 'Val(x0)', comment: 'Read Register 1: Reading value from register x0 for immediate add' },
            read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in immediate instruction' },
            write_register: { value: 'x28', comment: 'Write Register: Destination register x28 for immediate add result' }
          },
          imm_gen: { value: `Extracts and sign-extends the immediate value from the instruction for use in addi operation.\nInput: The instruction: addi x28, x29, 10\nOutput: The immediate value: 10`},
        },
        EX: {
          alu: { alu_result: 'ALU: Branch comparison → x1 == x0. Assume that it is true, branch taken to PC + 80. Zero line highlighted representing that Branch condition holds' },
          branch_adder: {value: 'Calculates the branch target address by adding the sign-extended immediate to the incremented PC value.\nInput: Current PC and immediate value is 40 but shifted left by 1 bit which is 80\nOutput: Target PC = PC + 80'}
        },
        MEM: {
          data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
        },
        WB: null
      }
    });

    // Cycle 5: bubble in ID, bubble in EX, beq x1, x0, 40 in MEM, add x30, x31, x5 in WB
    pipelineStates.push({
      cycle: 5,
      stages: { IF: undefined, ID: 'buble(flush)', EX: 'bubble(flush)', MEM: 'beq x1, x0, 40', WB: 'add x30, x31, x5'},
      hazards: [],
      stageDetails: {
        IF: {
          branch_taken: true,
          mux_pc: true,
          pc_increment: false,
          pc_default: false,
          pc_id: false,
          pc_im: true,
          im_id: true
        },
        MEM: {
          zero_mem2: true,
          alu_dm: false,
          reg2_dm: false,
          dm_wb: false,
          alu_wb: false,
        },
        WB: {
          dm_mux: false,
          alu_mux: true,
          reg_write: true
        }
      },
      component: {
        IF: {
          pc: { value: 'PC = PC + 80', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 80 to point to the jump address.' },
          instruction_mem: { value: '', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched instruction (at current PC address after branching) for decoding and execution' },
          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}
        },
        ID: {
          registers: {
            read_register_1: {value: "", comment: ""},
            read_register_2: {value: "", comment: ""},
            write_register: { value: '', comment: 'Write Register: N/A\nNote that x30 is now written back.\n\n\n\n' }
          }
        },
        EX: undefined,
        MEM: {
          data_memory: { read_data: 'No data read from memory', write_data: 'No data written to memory' }
        },
        WB: null
      }
    });

    // Cycle 6: bubble in EX, bubble in MEM beq x1, x0, 40 in WB
    pipelineStates.push({
      cycle: 6,
      stages: { IF: undefined, ID: undefined, EX: "        bubble", MEM: "        bubble", WB: 'beq x1, x0, 40' },
      hazards: [],
      stageDetails: {
        ID: undefined
      },
      component: {
        IF: undefined,
        ID: undefined,
        EX: undefined,
        MEM: undefined,
        WB: null
      }
    });

    // Cycle 7: bubble in MEM bubble in WB
    pipelineStates.push({
      cycle: 7,
      stages: { IF: undefined, ID: undefined, EX: undefined, MEM: "        bubble", WB: "        bubble" },
      hazards: [],
      stageDetails: {
        EX: undefined
      },
      component: {
        IF: undefined,
        ID: undefined,
        EX: {
          alu: { alu_result: 'ALU: Performs ADDI operation → Val(x29) + 10' }
        },
        MEM: undefined,
        WB: null
      }
    });

    // Cycle 8: bubble in WB
    pipelineStates.push({
      cycle: 8,
      stages: { IF: undefined, ID: undefined, EX: undefined, MEM: undefined, WB: "        bubble" },
      hazards: [],
      stageDetails: {
        MEM: undefined
      },
      component: {
        IF: undefined,
        ID: undefined,
        EX: undefined,
        MEM: undefined,
        WB: null
      }
    });

    return pipelineStates;    
  }
  else if (index === 2){
       // Cycle 1: lw x1, 0(x2) in IF
    pipelineStates.push({
      cycle: 1,
      stages: { IF: 'lw x1, 0(x2)', ID: undefined, EX: undefined, MEM: undefined, WB: undefined },
      hazards: [],
      stageDetails: {
        IF: {
          branch_taken: false,
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: false,
          pc_im: true,
          im_id: true
        }
      },
      component: {
        IF: {
          pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
          instruction_mem: { value: 'lw x1, 0(x2)', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched I-type load instruction (at current PC address) for decoding and execution' },
          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}
        },
        ID: undefined,
        EX: undefined,
        MEM: undefined,
        WB: null
      }
    });
      // Cycle 2: lw x1, 0(x2) in ID, beq x1, x3, LABEL in IF
    pipelineStates.push({
      cycle: 2,
      stages: { IF: 'beq x1, x3, LABEL', ID: 'lw x1, 0(x2)', EX: undefined, MEM: undefined, WB: undefined },
      hazards: [],
      stageDetails: {
        IF: {
          branch_taken: false,
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: true,
          pc_im: true,
          im_id: true
        },
        ID: {
          id_reg1: true,
          id_reg2: false,
          id_reg_write: true,
          id_imm_gen: true,
          imm_ex: true,
          id_ex: false,
          reg1_ex: true,
          reg2_ex: false
        }
      },
      component: {
        IF: {
          pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
          instruction_mem: { value: 'beq x1, x3, LABEL', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched B-type branch instruction (at current PC address) for decoding and execution' },
          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}
        },
        ID: {
          registers: {
            read_register_1: { value: 'Val(x2)', comment: 'Read Register 1: Reads base address from register x2 for memory access.' },
            read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in load instruction.' },
            write_register: { value: 'x1', comment: 'Write Register: Destination register x1 for loaded data.' }
          },
          imm_gen: { value: `Extracts and sign-extends the immediate value from the instruction for use in address calculation.\nInput: The instruction: lw x1, 0(x2)\nOutput: The immediate value: 0`},
        },
        EX: undefined,
        MEM: undefined,
        WB: null
      }
    });
      pipelineStates.push({
      cycle: 3,
      stages: { IF: 'add x4, x1, x5', ID: 'beq x1, x3, LABEL', EX: 'lw x1, 0(x2)', MEM: undefined, WB: undefined },
      hazards: ['Data Hazard: beq instruction needs x1 which is being loaded by lw instruction.', 'Control Hazard: Branch result unknown, fetching next sequential instruction speculatively'],
      stageDetails: {
        IF: {
          branch_taken: false,
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: false,
          pc_im: true,
          im_id: true
        },
        ID: {
          id_reg1: true,
          id_reg2: true,
          id_reg_write: false,
          id_imm_gen: true,
          imm_ex: true,
          id_ex: true, 
          reg1_ex: true, 
          reg2_ex: true
        },
        EX: {
          ex_add: false,
          add_mem: false,
          reg1_alu: true,
          reg2_mux: false,
          ex_shift: false,
          ex_mux: true,
          mux_alu: true,
          reg2_mem: false,
          zero_mem: false,
          alu_mem: true
        }
      },
      component: {
        IF: {
          pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
          instruction_mem: { value: 'add x4, x1, x5', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched R-type instruction (at current PC address) for decoding and execution' },
          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}
        },
        ID: {
          registers: {
            read_register_1: { value: 'Val(x1)', comment: 'Read Register 1: Read value from register x1 for branch comparison' },
            read_register_2: { value: 'Val(x3)', comment: 'Read Register 2: Reads value from register x3 for branch comparison' },
            write_register: { value: 'N/A', comment: 'Write Register: No write register for branch instruction.' }
          },
          imm_gen: { value: `Extracts and sign-extends the immediate value from the instruction for use in branch target calculation.\nInput: The instruction: beq x1, x3, LABEL\nOutput: The immediate value: LABEL = 8 offset from current PC`},
        },
        EX: {
          alu: { alu_result: 'ALU: Address calculation → Val(x2) + 0 = memory address.' }
        },
        MEM: undefined,
        WB: null
      }
    });
    // Cycle 4: lw x1, 0(x2) in MEM, beq x1, x3, LABEL in EX (stalled), add x4, x1, x5 in ID
    pipelineStates.push({
      cycle: 4,
      stages: { IF: 'sub x6, x4, x7', ID: 'add x4, x1, x5', EX: 'beq x1, x3, LABEL', MEM: 'lw x1, 0(x2)', WB: undefined },
      hazards: ['Data Hazard: add instruction in ID stage needs register x1 which is not yet loaded by lw command','Control Hazard: Branch decision still unknown sequentially fetch the next instruction'],
      stageDetails: {
        IF: {
          branch_taken: false,
          mux_pc: true,
          pc_increment: true,
          pc_default: true,
          pc_id: false,
          pc_im: true,
          im_id: true
        },
        ID: {
          id_reg1: true,
          id_reg2: true,
          id_reg_write: true,
          id_imm_gen: false,
          imm_ex: false,
          id_ex: false,
          reg1_ex: true, // x1 not available
          reg2_ex: true
        },
        EX: {
          ex_add: true, // Branch address calculation
          add_mem: true,
          reg1_alu: true,
          reg2_mux: true,
          ex_shift: true,
          ex_mux: false,
          mux_alu: false, // Cannot proceed with comparison
          reg2_mem: false,
          zero_mem: false, // Branch result not ready
          alu_mem: false
        },
        MEM: {
          zero_mem2: false,
          alu_dm: true, // Memory access for load
          reg2_dm: false,
          dm_wb: true, // Data will go to WB
          alu_wb: false
        }
      },
      component: {
        IF:
        {
          pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
          instruction_mem: { value: 'sub x6, x4, x7', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched R-type instruction (at current PC address) for decoding and execution' }
          ,          default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}

        },
        ID: {
          registers: {
            read_register_1: { value: 'Val(x1)', comment: 'Read Register 1: Read value from register x1' },
            read_register_2: { value: 'Val(x5)', comment: 'Read Register 2: Reads value from register x5' },
            write_register: { value: 'x4', comment: 'Write Register: Destination register x4' }
          }
        },
        EX: {
          alu: { alu_result: 'Branch not taken. Zero line output from ALU is not highlighted representing branch not taken' },
          branch_adder: {value: 'Calculates the branch target address by adding the sign-extended immediate to the incremented PC value.\nInput: Current PC and immediate value LABEL = 8 offset from current PC\nOutput: Target PC = PC + 8'}
        },
        MEM: {
          data_memory: { read_data: 'Read Data: Read word starting from calculated memory address', write_data: 'Write Data: No data written to memory' }
        },
        WB: null
      }
    });
    // Cycle 5: lw x1, 0(x2) in WB, beq x1, x3, LABEL in MEM, add x4, x1, x5 in EX, sub x6, x4, x7 in ID
  pipelineStates.push({
    cycle: 5,
    stages: { IF: undefined, ID: 'sub x6, x4, x7', EX: 'add x4, x1, x5', MEM: 'beq x1, x3, LABEL', WB: 'lw x1, 0(x2)' },
    hazards: ['Data Hazard: sub instruction in ID stage needs register x4 which will be changed by add instruction in EX stage.'],
    stageDetails: {
      ID: {
        id_reg1: true,
        id_reg2: true,
        id_reg_write: true,
        id_imm_gen: false,
        imm_ex: false,
        id_ex: false,
        reg1_ex: true,
        reg2_ex: true
      },
      EX: {
        ex_add: false,
        add_mem: false,
        reg1_alu: true,
        reg2_mux: true,
        ex_shift: false,
        ex_mux: false,
        mux_alu: true,
        reg2_mem: false,
        zero_mem: false,
        alu_mem: true
      },
      MEM: {
        zero_mem2: false,
        alu_dm: false,
        reg2_dm: false,
        dm_wb: false,
        alu_wb: false
      },
      WB: {
        dm_mux: true,
        alu_mux: false,
        reg_write: true
      }
    },
    component: {
      IF: undefined,
      ID: {
        registers: {
          read_register_1: { value: 'Val(x4)', comment: 'Read Register 1: Reads value from register x4' },
          read_register_2: { value: 'Val(x7)', comment: 'Read Register 2: Reads value from register x7' },
          write_register: { value: `x6\nWrite Data: Word loaded from memory by lw instruction is stored in register x1`, comment: 'Write Register: Destination register for ALU result' }
        }
      },
      EX: {
        alu: { alu_result: 'ALU: Performs ADD operation → Val(x1) + Val(x5).' }
      },
      MEM: {
        data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
      },
      WB: null
    }
  });

  // Cycle 6: beq x1, x3, LABEL in WB, add x4, x1, x5 in MEM, sub x6, x4, x7 in EX
  pipelineStates.push({
    cycle: 6,
    stages: { IF: undefined, ID: undefined, EX: 'sub x6, x4, x7', MEM: 'add x4, x1, x5', WB: 'beq x1, x3, LABEL' },
    hazards: [],
    stageDetails: {
      EX: {
        ex_add: false,
        add_mem: false,
        reg1_alu: true,
        reg2_mux: true,
        ex_shift: false,
        ex_mux: false,
        mux_alu: true,
        reg2_mem: false,
        zero_mem: false,
        alu_mem: true
      },
      MEM: {
        zero_mem2: false,
        alu_dm: false,
        reg2_dm: false,
        dm_wb: false,
        alu_wb: true
      },
      WB: {
        dm_mux: false,
        alu_mux: false,
        reg_write: false
      }
    },
    component: {
      IF: undefined,
      ID: undefined,
      EX: {
        alu: { alu_result: 'ALU: Performs SUB operation → Val(x4) - Val(x7).' }
      },
      MEM: {
        data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
      },
      WB: null
    }
  });

  // Cycle 7: add x31, x1, x5 in WB, sub x6, x31, x7 in MEM
  pipelineStates.push({
    cycle: 7,
    stages: { IF: undefined, ID: '', EX: undefined, MEM: 'sub x6, x31, x7', WB: 'add x31, x1, x5' },
    hazards: [],
    stageDetails: {
      MEM: {
        zero_mem2: false,
        alu_dm: false,
        reg2_dm: false,
        dm_wb: false,
        alu_wb: true
      },
      WB: {
        dm_mux: false,
        alu_mux: true,
        reg_write: true
      }
    },
    component: {
      IF: undefined,
      ID: {
        registers: {
          read_register_1: { value: 'N/A', comment: 'Read Register 1: Not used in this stage' },
          read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in this stage' },
          write_register: { value: 'x31=ALU Result', comment: 'Write Data: Write result to register x31' }
        }
      },
      EX: undefined,
      MEM: {
        data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
      },
      WB: null
    }
  });

  // Cycle 8: sub x6, x31, x7 in WB
  pipelineStates.push({
    cycle: 8,
    stages: { IF: undefined, ID: '', EX: undefined, MEM: undefined, WB: 'sub x6, x31, x7' },
    hazards: [],
    stageDetails: {
      WB: {
        dm_mux: false,
        alu_mux: true,
        reg_write: true
      }
    },
    component: {
      IF: undefined,
      ID: {
        registers:{
          read_register_1: { value: 'N/A', comment: 'Read Register 1: Not used in this stage' },
          read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in this stage' },
          write_register: { value: 'x6=ALU Result', comment: 'Write Data: Write result to register x6' }
        }
      },
      EX: undefined,
      MEM: undefined,
      WB: null
    }
  });
    return pipelineStates
  }
  else if (index === 3) {
  // Preset 3: No Hazards Example
  // Instructions: add x28, x29, x31; li x29, 10; addi x28, x5, 10
  // Total cycles: 3 instructions + 4 = 7 cycles

  // Cycle 1: add x28, x29, x31 in IF
  pipelineStates.push({
    cycle: 1,
    stages: { IF: 'add x28, x29, x31', ID: undefined, EX: undefined, MEM: undefined, WB: undefined },
    hazards: [],
    stageDetails: {
      IF: {
        branch_taken: false,
        mux_pc: true,
        pc_increment: true,
        pc_default: true,
        pc_id: false,
        pc_im: true,
        im_id: true
      }
    },
    component: {
      IF: {
        pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
        instruction_mem: { value: 'add x28, x29, x31', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched R-type instruction (at current PC address) for decoding and execution' },
        default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}

      },
      ID: undefined,
      EX: undefined,
      MEM: undefined,
      WB: null
    }
  });

  // Cycle 2: add x28, x29, x31 in ID, li x29, 10 in IF
  pipelineStates.push({
    cycle: 2,
    stages: { IF: 'addi x29, x0, 10', ID: 'add x28, x29, x31', EX: undefined, MEM: undefined, WB: undefined },
    hazards: [],
    stageDetails: {
      IF: {
        branch_taken: false,
        mux_pc: true,
        pc_increment: true,
        pc_default: true,
        pc_id: false,
        pc_im: true,
        im_id: true
      },
      ID: {
        id_reg1: true,
        id_reg2: true,
        id_reg_write: true,
        id_imm_gen: false,
        imm_ex: false,
        id_ex: false,
        reg1_ex: true,
        reg2_ex: true
      }
    },
    component: {
      IF: {
        pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
        instruction_mem: { value: 'addi x29, x0, 10', comment: `Instruction Memory: Stores program instructions. Outputs the fetched I-type instruction (at current PC address) for decoding and execution.\n Note: li is a pseudo instruction it is treated as addi` },
        default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}

      },
      ID: {
        registers: {
          read_register_1: { value: 'Val(x29)', comment: 'Read Register 1: Reads value from source register x29' },
          read_register_2: { value: 'Val(x31)', comment: 'Read Register 2: Reads value from source register x31' },
          write_register: { value: 'x28', comment: 'Write Register: Destination register x28 for ALU result' }
        }
      },
      EX: undefined,
      MEM: undefined,
      WB: null
    }
  });

  // Cycle 3: add x28, x29, x31 in EX, li x29, 10 in ID, addi x28, x5, 10 in IF
  pipelineStates.push({
    cycle: 3,
    stages: { IF: 'addi x28, x5, 10', ID: 'addi x29, x0, 10', EX: 'add x28, x29, x31', MEM: undefined, WB: undefined },
    hazards: [],
    stageDetails: {
      IF: {
        branch_taken: false,
        mux_pc: true,
        pc_increment: true,
        pc_default: true,
        pc_id: false,
        pc_im: true,
        im_id: true
      },
      ID: {
        id_reg1: true,
        id_reg2: false,
        id_reg_write: true,
        id_imm_gen: true,
        imm_ex: true,
        id_ex: false,
        reg1_ex: true,
        reg2_ex: false
      },
      EX: {
        ex_add: false,
        add_mem: false,
        reg1_alu: true,
        reg2_mux: true,
        ex_shift: false,
        ex_mux: false,
        mux_alu: true,
        reg2_mem: false,
        zero_mem: false,
        alu_mem: true
      }
    },
    component: {
      IF: {
        pc: { value: 'PC = PC + 4', comment: 'Program Counter (PC): Holds the address of the current instruction. The instruction is fetched using the current PC value, then PC is updated to PC + 4 to point to the next sequential instruction address.' },
        instruction_mem: { value: 'addi x28, x5, 10', comment: 'Instruction Memory: Stores program instructions. Outputs the fetched I-type instruction (at current PC address) for decoding and execution' },
        default_adder: {value: 'Adds 4 to the current PC value to get the address of the next instruction.'}

      },
      ID: {
        registers: {
          read_register_1: { value: 'Val(x0)', comment: 'Read Register 1: Reads zero register x0 for li (addi) instruction' },
          read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in li instruction' },
          write_register: { value: 'x29', comment: 'Write Register: Destination register x29 for immediate value' }
        },
        imm_gen: { value: `Extracts and sign-extends the immediate value from the instruction for use in addi operation.\nInput: The instruction: addi x29, x0, 10\nOutput: The immediate value: 10`},
      },
      EX: {
        alu: { alu_result: 'ALU: Performs ADD operation → Val(x29) + Val(x31).' }
      },
      MEM: undefined,
      WB: null
    }
  });

  // Cycle 4: add x28, x29, x31 in MEM, li x29, 10 in EX, addi x28, x5, 10 in ID
  pipelineStates.push({
    cycle: 4,
    stages: { IF: undefined, ID: 'addi x28, x5, 10', EX: 'addi x29, x0, 10', MEM: 'add x28, x29, x31', WB: undefined },
    hazards: [],
    stageDetails: {
      ID: {
        id_reg1: true,
        id_reg2: false,
        id_reg_write: true,
        id_imm_gen: true,
        imm_ex: true,
        id_ex: false,
        reg1_ex: true,
        reg2_ex: false
      },
      EX: {
        ex_add: false,
        add_mem: false,
        reg1_alu: true,
        reg2_mux: false,
        ex_shift: false,
        ex_mux: true,
        mux_alu: true,
        reg2_mem: false,
        zero_mem: false,
        alu_mem: true
      },
      MEM: {
        zero_mem2: false,
        alu_dm: false,
        reg2_dm: false,
        dm_wb: false,
        alu_wb: true
      }
    },
    component: {
      IF: undefined,
      ID: {
        registers: {
          read_register_1: { value: 'Val(x5)', comment: 'Read Register 1: Reads value from source register x5' },
          read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in addi instruction' },
          write_register: { value: 'x28', comment: 'Write Register: Destination register x28 for ALU result' }
        },
        imm_gen: { value: `Extracts and sign-extends the immediate value from the instruction for use in addi operation.\nInput: The instruction: addi x28, x5, 10\nOutput: The immediate value: 10`},
      },
      EX: {
        alu: { alu_result: 'ALU: Performs ADDI operation → Val(x0) + 10.' }
      },
      MEM: {
        data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
      },
      WB: null
    }
  });

  // Cycle 5: add x28, x29, x31 in WB, li x29, 10 in MEM, addi x28, x5, 10 in EX
  pipelineStates.push({
    cycle: 5,
    stages: { IF: undefined, ID: '', EX: 'addi x28, x5, 10', MEM: 'addi x29, x0, 10', WB: 'add x28, x29, x31' },
    hazards: [],
    stageDetails: {
      EX: {
        ex_add: false,
        add_mem: false,
        reg1_alu: true,
        reg2_mux: false,
        ex_shift: false,
        ex_mux: true,
        mux_alu: true,
        reg2_mem: false,
        zero_mem: false,
        alu_mem: true
      },
      MEM: {
        zero_mem2: false,
        alu_dm: false,
        reg2_dm: false,
        dm_wb: false,
        alu_wb: true
      },
      WB: {
        dm_mux: false,
        alu_mux: true,
        reg_write: true
      }
    },
    component: {
      IF: undefined,
      EX: {
        alu: { alu_result: 'ALU: Performs ADDI operation → Val(x5) + 10.' }
      },
      MEM: {
        data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
      },
      ID: {registers: {
          read_register_1: { value: 'N/A', comment: 'Read Register 1: Not used in this stage' },
          read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in this stage' },
          write_register: { value: 'x28=ALU Result', comment: 'Write Data: Write result to register x28' }
        }
      },
      WB: null
    }
  });

  // Cycle 6: li x29, 10 in WB, addi x28, x5, 10 in MEM
  pipelineStates.push({
    cycle: 6,
    stages: { IF: undefined, ID: '', EX: undefined, MEM: 'addi x28, x5, 10', WB: 'addi x29, x0, 10' },
    hazards: [],
    stageDetails: {
      MEM: {
        zero_mem2: false,
        alu_dm: false,
        reg2_dm: false,
        dm_wb: false,
        alu_wb: true
      },
      WB: {
        dm_mux: false,
        alu_mux: true,
        reg_write: true
      }
    },
    component: {
      IF: undefined,
      EX: undefined,
      MEM: {
        data_memory: { read_data: 'Read Data: No data read from memory.', write_data: 'Write Data: No data written to memory.' }
      },
      ID: {
        registers: {
          read_register_1: { value: 'N/A', comment: 'Read Register 1: Not used in this stage' },
          read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in this stage' },
          write_register: { value: 'x29=ALU RESULT(Immediate Value)', comment: 'Write Data: Write immediate value 10 to register x29' }
        }
      },
      WB: null
    }
  });

  // Cycle 7: addi x28, x5, 10 in WB
  pipelineStates.push({
    cycle: 7,
    stages: { IF: undefined, ID: '', EX: undefined, MEM: undefined, WB: 'addi x28, x5, 10' },
    hazards: [],
    stageDetails: {
      WB: {
        dm_mux: false,
        alu_mux: true,
        reg_write: true
      }
    },
    component: {
      IF: undefined,
      ID: {
        registers: {
          read_register_1: { value: 'N/A', comment: 'Read Register 1: Not used in this stage' },
          read_register_2: { value: 'N/A', comment: 'Read Register 2: Not used in this stage' },
          write_register: { value: 'x28=ALU Result', comment: 'Write Data: Write result to register x28' }
        }
      },
      EX: undefined,
      MEM: undefined,
      WB: null
    }
  });

  return pipelineStates;
}
  else{
    throw new Error
  }
}


export function simulatePipeline(instructions: string[]): PipelineState[] | never{
  try {
    if (!Array.isArray(instructions) || instructions.length === 0) {
      throw new Error('Provide a non-empty instruction array');
    }

    const pipelineStates: PipelineState[] = [];
    const totalInstructions = instructions.length;
    const totalCycles = totalInstructions + 4;

    for (let cycle = 1; cycle <= totalCycles; cycle++) {
      const stageMap: Record<PipelineStage, string | undefined> = {
        IF: undefined,
        ID: undefined,
        EX: undefined,
        MEM: undefined,
        WB: undefined
      };

      for (let i = 0; i < totalInstructions; i++) {
        const instruction = instructions[i];
        const instrStartCycle = i + 1;
        const currStage = cycle - instrStartCycle;
        if (currStage >= 0 && currStage < 5) {
          const stage: PipelineStage = pipelinestates[currStage] as PipelineStage;
          stageMap[stage] = instruction;
        }
      }

      // if (cycle === 3) {
      //   console.log("Stage Map at cycle 3:", stageMap);
      // }

      const ifInstruction: string | undefined = stageMap['IF']?.replace(/\s*,\s*/g, ' ').trim().replace(/\s+/g, ' ');
      const idInstruction: string | undefined = stageMap['ID']?.replace(/\s*,\s*/g, ' ').trim().replace(/\s+/g, ' ');
      const exInstruction: string | undefined = stageMap['EX']?.replace(/\s*,\s*/g, ' ').trim().replace(/\s+/g, ' ');
      const memInstruction: string | undefined = stageMap['MEM']?.replace(/\s*,\s*/g, ' ').trim().replace(/\s+/g, ' ');
      const wbInstruction: string | undefined = stageMap['WB']?.replace(/\s*,\s*/g, ' ').trim().replace(/\s+/g, ' ');

      // console.log(idInstruction);

      let idCommand: string | undefined;
      let exCommand: string | undefined;
      let ifCommand: string | undefined;
      let memCommand: string | undefined;
      let wbCommand: string | undefined;

      let idCommandType: CommandType | undefined;
      let exCommandType: CommandType | undefined;
      let ifCommandType: CommandType | undefined;
      let memCommandType: CommandType | undefined;
      let wbCommandType: CommandType | undefined;

      if (idInstruction) {
        idCommand = idInstruction.split(' ')[0].toLowerCase();
        if (!(idCommand in instructionTypeMap)) {
          throw new Error(`Invalid ID Instruction ${idCommand}`);
        }
        idCommandType = instructionTypeMap[idCommand];
      }

      if (exInstruction) {
        exCommand = exInstruction.split(' ')[0].toLowerCase();
        if (!(exCommand in instructionTypeMap)) {
          throw new Error(`Invalid Instruction ${exCommand}`);
        }
        exCommandType = instructionTypeMap[exCommand];
      }

      if (ifInstruction) {
        ifCommand = ifInstruction.split(' ')[0].toLowerCase();
        // console.log(ifCommand in instructionTypeMap);
        if (!(ifCommand in instructionTypeMap)) {
          throw new Error(`Invalid Instruction ${ifCommand}`);
        }
        ifCommandType = instructionTypeMap[ifCommand];
      }

      if (memInstruction) {
        memCommand = memInstruction.split(' ')[0].toLowerCase();
        if (!(memCommand in instructionTypeMap)) {
          throw new Error(`Invalid Instruction ${memCommand}`);
        }
        memCommandType = instructionTypeMap[memCommand];
      }

      if (wbInstruction) {
        wbCommand = wbInstruction.split(' ')[0].toLowerCase();
        if (!(wbCommand in instructionTypeMap)) {
          throw new Error(`Invalid Instruction ${wbCommand}`);
        }
        wbCommandType = instructionTypeMap[wbCommand];
      }

      let ifpath: IFPath | undefined = undefined;
      let idpath: IDPath | undefined = undefined;
      let expath: EXPath | undefined = undefined;
      let mempath: MEMPath | undefined = undefined;
      const hazards: string[] = [];
      let wbpath: WBPath | undefined = undefined;
      let ifcomponents: IFComponents | undefined = undefined;
      let idcomponents: IDComponents | undefined = undefined;
      let excomponents: EXComponents | undefined = undefined;
      let memcomponents: MEMComponents | undefined = undefined;

      if (ifInstruction) {
        ifpath = {
          branch_taken: false,
          mux_pc: true,
          pc_increment: true, 
          pc_default: true,
          pc_id: true,
          pc_im: true, 
          im_id: true
        };
      }

      if (ifCommandType === CommandType.IType && ifInstruction && ifCommand && !ifCommand.startsWith('l')) {
        const [, writeRegister = '', readRegister1 = '', immediate = ''] = ifInstruction.split(' ');
        if (!writeRegister || !readRegister1 || !immediate) {
          throw new Error(`Follow the required format ${ifCommand} <writeRegister>, <readRegister1>, <immediate>`);
        }
        ifcomponents = { 
          pc: {
            value: 'pc + 4',
            comment: 'We move to the next instruction by incrementing PC by 4'
          },
          instruction_mem: {
            value: `command: ${ifInstruction}, instruction: ${ifCommand}, writeRegister: ${writeRegister}, readRegister1: ${readRegister1}, immediate: ${immediate}`,
            comment: 'Fetch the instruction from the instruction memory using the current PC'
          },
          default_adder: {
            value: "",
          }
        };
      } else if (ifCommandType === CommandType.IType && ifInstruction && ifCommand) {
        const [, writeRegister = '', offsetAndBase = ''] = ifInstruction.split(' ');
        if (ifCommand === 'li') {
          if (!writeRegister || !offsetAndBase) {
            throw new Error('Missing operands for I-type instruction');
          }
          ifcomponents = { 
            pc: {
              value: 'pc + 4',
              comment: 'We move to the next instruction by incrementing PC by 4'
            },
            instruction_mem: {
              value: `command: addi ${writeRegister}, x0, ${offsetAndBase}, instruction: addi, writeRegister: ${writeRegister}, readRegister1: x0, immediate: ${offsetAndBase}`,
              comment: 'Fetch the instruction from the instruction memory using the current PC'
            },
            default_adder: {
              value: "",
            }
          };
        } else {
          const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
          if (!match) {
            throw new Error(`Invalid memory operand format. Expected offset(base), got '${offsetAndBase}'`);
          }
          const offset = match[1];
          const baseRegister = match[2];
          ifcomponents = { 
            pc: {
              value: 'pc + 4',
              comment: 'Move to the next instruction',
            },
            instruction_mem: {
              value: `command: ${ifInstruction}, instruction: ${ifCommand}, writeRegister: ${writeRegister}, baseRegister: ${baseRegister}, offset: ${offset}`,
              comment: 'Fetch the instruction from instruction memory',
            },
            default_adder: {
              value: "",
            }
          };
        }
      }

      if (ifCommandType === CommandType.RType && ifInstruction && ifCommand) {
        const [, writeRegister = '', readRegister1 = '', readRegister2 = ''] = ifInstruction.split(' ');
        if (!writeRegister || !readRegister1 || !readRegister2) {
          throw new Error(`Follow the required format: ${ifCommand} <writeRegister>, <readRegister1>, <readRegister2>`);
        }
        ifcomponents = {
          pc: {
            value: 'pc + 4',
            comment: 'We move to the next instruction by incrementing PC by 4'
          },
          instruction_mem: {
            value: `command: ${ifInstruction}, instruction: ${ifCommand}, writeRegister: ${writeRegister}, readRegister1: ${readRegister1}, readRegister2: ${readRegister2}`,
            comment: 'Fetch the instruction from the instruction memory using the current PC'
          },
          default_adder: {
            value: "",
          }
        };
      }

      if (ifCommandType === CommandType.BType && ifInstruction && ifCommand) {
        const [, readRegister1 = '', readRegister2 = '', immediate = ''] = ifInstruction.split(' ');
        if (!readRegister1 || !readRegister2 || !immediate) {
          throw new Error(`Follow the required format: ${ifCommand} <readRegister1>, <readRegister2>, <immediate>`);
        }
        ifcomponents = {
          pc: {
            value: 'pc + 4',
            comment: 'We move to the next instruction by incrementing PC by 4 (branch not taken)'
          },
          instruction_mem: {
            value: `command: ${ifInstruction}, instruction: ${ifCommand}, readRegister1: ${readRegister1}, readRegister2: ${readRegister2}, immediate: ${immediate}`,
            comment: 'Fetch the instruction from the instruction memory using the current PC'
          },
          default_adder: {
            value: "",
          }
        };
      }

      if (ifCommandType === CommandType.SType && ifInstruction && ifCommand) {
        const [, writeRegister = '', offsetAndBase = ''] = ifInstruction.split(' ');
        const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
        if (!writeRegister || !offsetAndBase || !match) {
          throw new Error(`Follow the required format: ${ifCommand} <writeRegister>, <offset>(<baseRegister>)`);
        }
        const offset = match[1];
        const baseRegister = match[2];
        ifcomponents = {
          pc: {
            value: 'pc + 4',
            comment: 'We move to the next instruction by incrementing PC by 4'
          },
          instruction_mem: {
            value: `command: ${ifInstruction}, instruction: ${ifCommand}, writeRegister: ${writeRegister}, baseRegister: ${baseRegister}, offset: ${offset}`,
            comment: 'Fetch the instruction from the instruction memory using the current PC'
          },
          default_adder: {
            value: "",
          }
        };
      }

      if (idCommandType === CommandType.RType && idCommand && idInstruction) {
        const [, writeRegister = '', readRegister1 = '', readRegister2 = ''] = idInstruction.split(' ');
        if (!writeRegister || !readRegister1 || !readRegister2) {
          throw new Error(`Follow the required format: ${ifCommand} <writeRegister>, <readRegister1>, <readRegister2>`);
        }
        idpath = {
          id_reg1: true,
          id_ex: true,
          id_reg2: true,
          id_reg_write: true,
          id_imm_gen: false,
          imm_ex: false,
          reg1_ex: true,
          reg2_ex: true
        };
        idcomponents = {
          registers: {
            read_register_1: {
              value: `${readRegister1}`,
              comment: 'read value of first register'
            },
            read_register_2: {
              value: `${readRegister2}`,
              comment: 'read value of second register'
            },
            write_register: {
              value: `${writeRegister}`,
              comment: 'write the result to the destination register'
            }
          }
        };
      }

      if (idCommandType === CommandType.BType && idCommand && idInstruction) {
        if (ifCommand && ifInstruction) {
          hazards.push(`CONTROL HAZARD: Branch instruction ${idCommand} is in ID stage, but not executed yet.`);
        }
        const [, readRegister1 = '', readRegister2 = '', immediate = ''] = idInstruction.split(' ');
        if (!readRegister1 || !readRegister2 || !immediate) {
          throw new Error(`Follow the required format: ${idCommand} <readRegister1>, <readRegister2>, <immediate>`);
        }
        idpath = {
          id_reg1: true,
          id_ex: true,
          id_reg2: true,
          id_reg_write: false,
          id_imm_gen: true,
          imm_ex: true,
          reg1_ex: true,
          reg2_ex: true
        };
        idcomponents = {
          registers: {
            read_register_1: {
              value: `${readRegister1}`,
              comment: 'read value of first register for branch comparison'
            },
            read_register_2: {
              value: `${readRegister2}`,
              comment: 'read value of second register for branch comparison'
            },
            write_register: {
              value: 'N/A',
              comment: 'No register write for branch instructions'
            }
          }
        };
      }

      if (idCommandType === CommandType.SType && idCommand && idInstruction) {
        const [, writeRegister = '', offsetAndBase = ''] = idInstruction.split(' ');
        const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
        if (!writeRegister || !offsetAndBase || !match) {
          throw new Error(`Follow the required format: ${idCommand} <writeRegister>, <offset>(<baseRegister>)`);
        }
        const baseRegister = match[2];
        idpath = {
          id_reg1: true,
          id_reg2: true, 
          id_imm_gen: true,
          reg1_ex: true,
          reg2_ex: true,
          imm_ex: true,
          id_reg_write: false,
          id_ex: false,
        };
        idcomponents = {
          registers: {
            read_register_1: {
              value: `${baseRegister}`,
              comment: 'read value of base register for memory address calculation'
            },
            read_register_2: {
              value: `${writeRegister}`,
              comment: 'read value of register to be stored in memory'
            },
            write_register: {
              value: 'N/A',
              comment: 'No register write for store instructions'
            }
          }
        };
      }

      if (idCommandType === CommandType.IType && idCommand && idInstruction && !idCommand.startsWith('l')) {
        const [, writeRegister = '', readRegister1 = '', immediate = ''] = idInstruction.split(' ');
        if (!writeRegister || !readRegister1 || !immediate) {
          throw new Error(`Follow the required format: ${idCommand} <writeRegister>, <readRegister1>, <immediate>`);
        }
        idpath = {
          id_reg1: true,
          id_reg2: false,
          id_reg_write: true,
          id_imm_gen: true,
          imm_ex: true,
          id_ex: true,
          reg1_ex: true,
          reg2_ex: false
        };
        idcomponents = {
          registers: {
            read_register_1: {
              value: `${readRegister1}`,
              comment: 'read value of first register'
            },
            read_register_2: {
              value: 'N/A',
              comment: 'No second register read for I-type instructions'
            },
            write_register: {
              value: `${writeRegister}`,
              comment: 'write the result to the destination register'
            }
          }
        };
      }

      if (idCommandType === CommandType.IType && idCommand && idInstruction && idCommand.startsWith('l')) {
        const [, writeRegister = '', offsetAndBase = ''] = idInstruction.split(' ');
        if (idCommand === 'li') {
          if (!writeRegister || !offsetAndBase) {
            throw new Error('Missing operands for I-type instruction');
          }
          idpath = {
            id_reg1: true,
            id_reg2: false,
            id_reg_write: true,
            id_imm_gen: true,
            imm_ex: true,
            id_ex: false,
            reg1_ex: true,
            reg2_ex: false
          };
          idcomponents = {
            registers: {
              read_register_1: {
                value: 'x0',
                comment: 'Register x0 is always 0, used for li instruction'
              },
              read_register_2: {
                value: 'N/A',
                comment: 'No second register read for li instruction'
              },
              write_register: {
                value: `${writeRegister}`,
                comment: 'write the immediate value to the destination register'
              }
            }
          };
        } else {
          const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
          if (!writeRegister || !offsetAndBase || !match) {
            throw new Error(`Follow the required format: ${idCommand} <writeRegister>, <offset>(<baseRegister>)`);
          }
          const baseRegister = match[2];
          idpath = {
            id_reg1: true,
            id_reg2: false,
            id_reg_write: true,
            id_imm_gen: true,
            imm_ex: true,
            reg1_ex: true,
            id_ex: false,
            reg2_ex: false
          };
          idcomponents = {
            registers: {
              read_register_1: {
                value: `${baseRegister}`,
                comment: 'read value of base register for memory address calculation'
              },
              read_register_2: {
                value: 'N/A',
                comment: 'No second register read for load instructions'
              },
              write_register: {
                value: `${writeRegister}`,
                comment: 'write the loaded value to the destination register'
              }
            }
          };
        }
      }

      if (exCommandType === CommandType.RType && exCommand && exInstruction) {
        const [, writeRegister = '', readRegister1 = '', readRegister2 = ''] = exInstruction.split(' ');
        if (!writeRegister || !readRegister1 || !readRegister2) {
          throw new Error(`Follow the required format: ${exCommand} <writeRegister>, <readRegister1>, <readRegister2>`);
        }
        expath = {
          ex_add: false,
          add_mem: false,
          reg1_alu: true,
          reg2_mux: true,
          ex_shift: false,
          ex_mux: false,
          mux_alu: true,
          reg2_mem: false,
          zero_mem: false,
          alu_mem: true
        };
        excomponents = {
          alu: {
            alu_result: `For R-type instructions, the ALU performs the operation specified by the instruction, in this case it will perform ${exCommand} instruction`
          }
        };
      }

      if (exCommandType === CommandType.IType && exCommand && exInstruction && !exCommand.startsWith('l')) {
        const [, writeRegister = '', readRegister1 = '', immediate = ''] = exInstruction.split(' ');
        if (!writeRegister || !readRegister1 || !immediate) {
          throw new Error(`Follow the required format: ${exCommand} <writeRegister>, <readRegister1>, <immediate>`);
        }
        expath = {
          ex_add: false,
          add_mem: false,
          reg1_alu: true,
          reg2_mux: false,
          ex_shift: false,
          ex_mux: true,
          mux_alu: true,
          reg2_mem: false,
          zero_mem: false,
          alu_mem: true
        };
        excomponents = {
          alu: {
            alu_result: `For I-type instructions, the ALU performs the operation specified by the instruction, in this case it will perform ${exCommand} instruction`
          }
        };
      }

      if (exCommandType === CommandType.IType && exCommand && exInstruction && exCommand.startsWith('l')) {
        const [, writeRegister = '', offsetAndBase = ''] = exInstruction.split(' ');
        if (exCommand === 'li') {
          if (!writeRegister || !offsetAndBase) {
            throw new Error('Missing operands for I-type instruction');
          }
          expath = {
            ex_add: false,
            add_mem: false,
            reg1_alu: true,
            reg2_mux: false,
            ex_shift: false,
            ex_mux: true,
            mux_alu: true,
            reg2_mem: false,
            zero_mem: false,
            alu_mem: true
          };
          excomponents = {
            alu: {
              alu_result: `For li instruction, the ALU will simply perform x0=0 + ${offsetAndBase} to load the immediate value into the register`
            }
          };
        } else {
          const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
          if (!writeRegister || !offsetAndBase || !match) {
            throw new Error(`Follow the required format: ${exCommand} <writeRegister>, <offset>(<baseRegister>)`);
          }
          const offset = match[1];
          const baseRegister = match[2];
          expath = {
            ex_add: false,
            add_mem: false,
            reg1_alu: true,
            reg2_mux: false,
            ex_shift: false,
            ex_mux: true,
            mux_alu: true,
            reg2_mem: false,
            zero_mem: false,
            alu_mem: true
          };
          excomponents = {
            alu: {
              alu_result: `base (${baseRegister}) + offset (${offset})`
            }
          };
        }
      }

      if (exCommandType === CommandType.BType && exCommand && exInstruction) {
        const [, readRegister1 = '', readRegister2 = '', immediate = ''] = exInstruction.split(' ');
        if (!readRegister1 || !readRegister2 || !immediate) {
          throw new Error(`Follow the required format: ${exCommand} <readRegister1>, <readRegister2>, <immediate>`);
        }
        expath = {
          ex_add: true,
          add_mem: true,
          reg1_alu: true,
          reg2_mux: true,
          ex_shift: true,
          zero_mem: false,
          alu_mem: false,
          reg2_mem: false,
          ex_mux: false,
          mux_alu: true
        };
        excomponents = {
          alu: {
            alu_result: `For branch instructions, the ALU performs the comparison between ${readRegister1} and ${readRegister2} to determine if the branch should be taken. In this case, it will perform ${exCommand} instruction`
          }
        };
      }

      if (exCommandType === CommandType.SType && exCommand && exInstruction) {
        const [, writeRegister = '', offsetAndBase = ''] = exInstruction.split(' ');
        const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
        if (!writeRegister || !offsetAndBase || !match) {
          throw new Error(`Follow the required format: ${exCommand} <writeRegister>, <offset>(<baseRegister>)`);
        }
        const offset = match[1];
        const baseRegister = match[2];
        expath = {
          ex_add: false,
          add_mem: false,
          reg1_alu: true,
          reg2_mux: false,
          ex_shift: false,
          ex_mux: true,
          mux_alu: true,
          reg2_mem: true,
          zero_mem: false,
          alu_mem: true
        };
        excomponents = {
          alu: {
            alu_result: `base (${baseRegister}) + offset (${offset})`
          }
        };
      }

      if ((memCommand && memInstruction) && ((memCommandType === CommandType.RType && memInstruction) || (memCommandType === CommandType.IType && !memCommand.startsWith('l')) || (memCommandType === CommandType.IType && memCommand === 'li'))) {
        mempath = {
          zero_mem2: false,
          alu_dm: false,
          alu_wb: true,
          reg2_dm: false,
          dm_wb: false,
        };
        memcomponents = {
          data_memory: {
            read_data: 'N/A',
            write_data: 'N/A'
          }
        };
      }

      if (memCommandType === CommandType.IType && memCommand && memInstruction && memCommand.startsWith('l') && memCommand !== 'li') {
        const [, writeRegister = '', offsetAndBase = ''] = memInstruction.split(' ');
        const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
        if (!writeRegister || !offsetAndBase || !match) {
          throw new Error(`Follow the required format: ${memCommand} <writeRegister>, <offset>(<baseRegister>)`);
        }
        const offset = match[1];
        const baseRegister = match[2];
        mempath = {
          zero_mem2: false,
          alu_dm: true,
          reg2_dm: false,
          dm_wb: true,
          alu_wb: false
        };
        memcomponents = {
          data_memory: {
            read_data: `Data loaded from memory address calculated as base (${baseRegister}) + offset (${offset})`,
            write_data: 'N/A'
          }
        };
      }

      if (memCommandType === CommandType.SType && memCommand && memInstruction) {
        const [, writeRegister = '', offsetAndBase = ''] = memInstruction.split(' ');
        const match = offsetAndBase.match(/(-?\d+)\((x\d+)\)/);
        if (!writeRegister || !offsetAndBase || !match) {
          throw new Error(`Follow the required format: ${memCommand} <writeRegister>, <offset>(<baseRegister>)`);
        }
        const offset = match[1];
        const baseRegister = match[2];
        mempath = {
          zero_mem2: false,
          alu_dm: false,
          reg2_dm: true,
          dm_wb: false,
          alu_wb: false
        };
        memcomponents = {
          data_memory: {
            read_data: 'N/A',
            write_data: `Data to be written to memory address calculated as base (${baseRegister}) + offset (${offset})`
          }
        };
      }

      if (memCommandType === CommandType.BType && memCommand && memInstruction) {
        mempath = {
          zero_mem2: false,
          alu_dm: false,
          reg2_dm: false,
          dm_wb: false,
          alu_wb: false
        };
        if (ifpath) {
          ifpath.branch_taken = true;
        }
        memcomponents = {
          data_memory: {
            read_data: 'N/A',
            write_data: 'N/A'
          }
        };
      }

      if ((wbCommand && wbInstruction) && ((wbCommandType === CommandType.RType && wbInstruction) || (wbCommandType === CommandType.IType && !wbCommand.startsWith('l')) || (wbCommandType === CommandType.IType && wbCommand === 'li'))) {
        wbpath = {
          dm_mux: false,
          alu_mux: true,
          reg_write: true
        };
      }

      if (wbCommandType === CommandType.IType && wbCommand && wbInstruction && wbCommand.startsWith('l') && wbCommand !== 'li') {
        wbpath = {
          dm_mux: true,
          alu_mux: false,
          reg_write: true
        };
      }

      if (wbCommandType === CommandType.SType || wbCommandType === CommandType.BType) {
        wbpath = {
          dm_mux: false,
          alu_mux: false,
          reg_write: false
        };
      }

      const readRegisters: string[] = [];
      const writeRegisters: string[] = [];

      if (idCommandType === CommandType.IType && !idCommand?.startsWith('l')) {
        const readRegister: string = idInstruction?.split(' ')[2] ?? '';
        readRegisters.push(readRegister);
      }

      if (idCommandType === CommandType.BType) {
        const [, readRegister1 = '', readRegister2 = ''] = (idInstruction?.split(' ') ?? []);
        readRegisters.push(readRegister1, readRegister2);
      }

      if (idCommandType === CommandType.RType) {
        const [, , readRegister1 = '', readRegister2 = ''] = (idInstruction?.split(' ') ?? []);
        readRegisters.push(readRegister1, readRegister2);
      }

      if (exCommandType === CommandType.IType || exCommandType === CommandType.RType) {
        writeRegisters.push(exInstruction?.split(' ')[1] ?? '');
      }

      if (memCommandType === CommandType.IType || memCommandType === CommandType.RType) {
        writeRegisters.push(memInstruction?.split(' ')[1] ?? '');
      }

      // console.log("writeRegisters", writeRegisters);
      // console.log("readRegisters", readRegisters);

      hazards.push(...readRegisters
        .filter(reg => writeRegisters.includes(reg) && reg !== '')
        .map(reg => `Data hazard: Register ${reg} is read before it is written in this cycle.`));

      pipelineStates.push({
        cycle,
        stages: stageMap,
        hazards,
        stageDetails: {
          IF: ifpath,
          ID: idpath,
          EX: expath,
          MEM: mempath,
          WB: wbpath
        },
        component: {
          IF: ifcomponents,
          ID: idcomponents,
          EX: excomponents,
          MEM: memcomponents,
          WB: null
        }
      });
    }

    return pipelineStates;
  } catch (error) {
    console.log("pipeline error");
    throw error
  }
}