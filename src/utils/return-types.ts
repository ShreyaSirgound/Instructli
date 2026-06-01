
type DataPath = {
    branch_taken: boolean,
    mux_pc: boolean,
    pc_default: boolean,
    pc_increment: boolean, 
    pc_add: boolean,
    im_reg1: boolean,
    im_reg2: boolean,
    im_reg_write: boolean, 
    im_imm_gen: boolean,
    imm_gen_shift: boolean,
    imm_gen_mux: boolean,
    reg1_mux: boolean,
    reg2_mux: boolean,
    mux_alu: boolean,
    zero: boolean,
    alu_res_mem: boolean,
    alu_res_mux: boolean,
    reg2_dm: boolean, 
    dm_mux: boolean,
    reg_write: boolean,
    // control signals if true then it means signal is 1 other wise 0
    alu_src: boolean, 
    memto_reg: boolean, 
    reg_write_control: boolean,
    mem_read: boolean, 
    mem_write: boolean,
    branch: boolean,
    alu_op_0: boolean,
    alu_op_1: boolean
}

type Block_Data = {
    pc:{
        value: string, 
        comment: string
    }
    instruction_mem:{
        value: string,
        comment: string
    }
    immediate_generator?:{
        value: string
    },
    default_adder: {
        value: string,
    }
    branch_adder?: {
        value: string,}
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
    alu:{
        alu_result: string
    }
    data_memory:
    {
        read_data: string,
        write_data: string
    }
 }


export type { DataPath, Block_Data };