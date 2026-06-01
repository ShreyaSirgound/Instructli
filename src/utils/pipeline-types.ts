type PipelineStage = 'IF' | 'ID' | 'EX' | 'MEM' | 'WB';
//const pipelinestates = ['IF', 'ID', 'EX', 'MEM', 'WB'];


export enum CommandType {
    IType,
    RType,
    BType,
    JType,
    UType,
    SType
}

export const instructionTypeMap: { [key: string]: CommandType } = {
    // R-Type instructions
    add: CommandType.RType,
    sub: CommandType.RType,
    and: CommandType.RType,
    or: CommandType.RType,
    xor: CommandType.RType,
    sll: CommandType.RType,
    srl: CommandType.RType,
    sra: CommandType.RType,
    slt: CommandType.RType,
    sltu: CommandType.RType,
    mul: CommandType.RType,
    mulh: CommandType.RType,
    mulsu: CommandType.RType,
    mulu: CommandType.RType,
    div: CommandType.RType, 
    divu: CommandType.RType,
    rem: CommandType.RType,
    remu: CommandType.RType,

    // I-Type instructions
    addi: CommandType.IType,
    andi: CommandType.IType,
    ori: CommandType.IType,
    xori: CommandType.IType,
    slli: CommandType.IType,
    srli: CommandType.IType,
    srai: CommandType.IType,
    slti: CommandType.IType,
    sltiu: CommandType.IType,
    li: CommandType.IType,
    lb: CommandType.IType,
    lh: CommandType.IType,
    lw: CommandType.IType,
    lbu: CommandType.IType,
    lhu: CommandType.IType,
    jalr: CommandType.IType,

    // S-Type instructions
    sb: CommandType.SType,
    sh: CommandType.SType,
    sw: CommandType.SType,

    // B-Type instructions
    beq: CommandType.BType,
    bne: CommandType.BType,
    blt: CommandType.BType,
    bge: CommandType.BType,
    bltu: CommandType.BType,
    bgeu: CommandType.BType,

    // U-Type instructions
    lui: CommandType.UType,
    auipc: CommandType.UType,

    // J-Type instructions
    jal: CommandType.JType
};

export type IFPath = {
  branch_taken: boolean,
  mux_pc: boolean,
  pc_increment: boolean, 
  pc_default: boolean,
  pc_id: boolean,
  pc_im: boolean, 
  im_id: boolean
}

export type IDPath = {
  id_reg1: boolean,
  id_reg2: boolean,
  id_reg_write: boolean,
  id_imm_gen: boolean,
  imm_ex: boolean,
  id_ex: boolean,
  reg1_ex: boolean,
  reg2_ex: boolean
}

export type EXPath = {
  ex_add: boolean,
  add_mem: boolean,
  reg1_alu: boolean,
  reg2_mux: boolean,
  ex_shift: boolean,
  ex_mux: boolean,
  mux_alu: boolean,
  reg2_mem: boolean,
  zero_mem: boolean,
  alu_mem: boolean
}

export type MEMPath = {
  zero_mem2: boolean,
  alu_dm: boolean,
  reg2_dm: boolean, 
  dm_wb: boolean,
  alu_wb: boolean,
}

export type WBPath = {
  dm_mux: boolean,
  alu_mux: boolean,
  reg_write: boolean
}

export type IFComponents = {
  pc:{
    value: string;
    comment: string;
  }
  instruction_mem:{
    value: string;
    comment: string;
  }
  default_adder: {
    value: string;
  }
}

export type IDComponents = {
  registers:{
    read_register_1: {
        value: string,
        comment: string
    },
    read_register_2: {
        value: string,
        comment: string
    },
    write_register: {
        value: string,
        comment: string 
    }
  },
  imm_gen ?:{
    value: string;
  }
}

export type EXComponents = {
  alu: {
    alu_result: string
  }
  branch_adder?:{
    value: string;
  }
}

export type MEMComponents = {
  data_memory:{
    read_data: string,
    write_data: string
  }

}

export type StagePathMap = {
  IF: IFPath;
  ID: IDPath;
  EX: EXPath;
  MEM: MEMPath;
  WB: WBPath;
};

export type StageComponents = {
  IF: IFComponents;
  ID: IDComponents;
  EX: EXComponents;
  MEM: MEMComponents;
  WB: null;
};

type PipelineState = {
  cycle: number;
  stages: {
    [stage in PipelineStage]?: string;
  };
  stageDetails ?: {
    [stage in PipelineStage]?: StagePathMap[stage];
  };
  component ?: {
    [stage in PipelineStage]?: StageComponents[stage];
  };
  hazards: string[]
};

export type { PipelineState };