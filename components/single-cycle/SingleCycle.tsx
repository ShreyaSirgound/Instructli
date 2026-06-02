import React from 'react';
import { useState } from 'react';
import type { DataPath, Block_Data } from '../../src/utils/return-types';
import { JsonResponse } from "../../src/utils/single-processor";

type SingleProcessorProps = {
  results: JsonResponse | null | undefined;
};

export function SingleProcessor({ results }: SingleProcessorProps) {
    const [hovered, setHovered] = useState<string | null>(null);    
    const arrowColour = "#ff0000";

    const hoverTextbox = React.createElement(
        'div',
        { xmlns: 'http://www.w3.org/1999/xhtml', style: { fontSize: 12, whiteSpace: 'pre-wrap', wordWrap: 'break-word' } },
        `${hovered}`
    );

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
    mem_write: false,
    reg_write_control: false,
    branch: false,
    alu_op_0: false,
    alu_op_1: false,
  };

  const defaultBlockData: Block_Data = {
    pc:{
        value: "", 
        comment: ""
    },
    instruction_mem:{
        value: "",
        comment: ""
    },
    default_adder:{
        value: "",
    },
    registers:{
        read_register_1: {
            value: "",
            comment: ""
        },
        read_register_2: {
            value: "",
            comment: ""
        },
        write_register: {
            value: "",
            comment: "" 
        }
    },
    alu:{
        alu_result: ""
    },
    data_memory:
    {
        read_data: "",
        write_data: ""
    }
  }

  const currDataPath: DataPath =
    results!= null
      ? results.data_path
      : defaultDataPath;


  const hoverBlockData: Block_Data =
    results != null
      ? results.block_data
      : defaultBlockData;

  return (
    <>
        <svg width="100%" height="100%" viewBox="0 0 884 623" fill="transparent" preserveAspectRatio="xMidYMid meet">
        
        {/* INSTRUCTION MEMORY BOX */}
        <g 
            onMouseEnter={() => setHovered(`INSTRUCTION MEMORY:\n${hoverBlockData.instruction_mem.comment}\n\n${hoverBlockData.instruction_mem.value}`)}
            onMouseLeave={() => setHovered(null)}
        >
            <rect x="158.501" y="272.735" width="86" height="154.75" stroke="black"/>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="162.001" y="293.651">Address</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="190.001" y="348.621">Instruction</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="184.001" y="393.121">Instruction</tspan><tspan x="184.001" y="405.121">   memory</tspan></text>
        </g> 
        {/* instruction memory paths*/}
        <path id="im_imm_gen_line" d="M354.004 542.25L349.004 539.363V545.137L354.004 542.25ZM266.503 384H266.003V542H266.503H267.003V384H266.503ZM349.504 542.25V541.75H266.002V542.25V542.75H349.504V542.25Z" 
            fill={currDataPath.im_imm_gen ? arrowColour: "#000000"}
        />
        <path id="im_reg_write_line" d="M263.336 384C263.336 385.473 264.53 386.667 266.003 386.667C267.476 386.667 268.67 385.473 268.67 384C268.67 382.527 267.476 381.333 266.003 381.333C264.53 381.333 263.336 382.527 263.336 384ZM303.003 384L298.003 381.113V386.887L303.003 384ZM266.003 384V384.5H298.503V384V383.5H266.003V384Z" 
            fill={currDataPath.im_reg_write ? arrowColour: "#000000"}
        />
        {/* line connecting instruction mem to write reg or imm gen */}
        <line id="im_write_immgen_line" x1="266.503" y1="348" x2="266.503" y2="384" 
            stroke={currDataPath.im_reg_write || currDataPath.im_imm_gen ? arrowColour: "#000000"}
        />
        <path id="im_reg1_line1" d="M303.003 273L298.003 270.113V275.887L303.003 273ZM266.003 273V273.5H298.503V273V272.5H266.003V273Z" 
            fill={currDataPath.im_reg1 ? arrowColour: "#000000"}
        />
        <line id="im_reg1_line2" x1="266.503" y1="273" x2="266.503" y2="318" 
            stroke={currDataPath.im_reg1 ? arrowColour: "#000000"}
        />
        <path id="im_reg2_line" d="M263.336 318C263.336 319.473 264.53 320.667 266.003 320.667C267.476 320.667 268.67 319.473 268.67 318C268.67 316.527 267.476 315.333 266.003 315.333C264.53 315.333 263.336 316.527 263.336 318ZM303.003 318L298.003 315.113V320.887L303.003 318ZM266.003 318V318.5H298.503V318V317.5H266.003V318Z" 
            fill={currDataPath.im_reg2 ? arrowColour: "#000000"}
        />
        {/* line connecting instruction mem to reg 1 and reg 2 */}
        <line id="im_reg1_reg2_line" x1="266.503" y1="318" x2="266.503" y2="348" 
            stroke={currDataPath.im_reg1 || currDataPath.im_reg2 ? arrowColour: "#000000"}
        />
        <path id="im_line" d="M263.339 347.75C263.339 349.223 264.533 350.417 266.006 350.417C267.479 350.417 268.673 349.223 268.673 347.75C268.673 346.277 267.479 345.083 266.006 345.083C264.533 345.083 263.339 346.277 263.339 347.75ZM245 347.75V348.25H266.006V347.75V347.25H245V347.75Z" 
            fill={currDataPath.im_reg1 || currDataPath.im_reg2 || currDataPath.im_reg_write || currDataPath.im_imm_gen ? arrowColour : "#000000"}
        />

        {/* PC BOX */}
        <g 
            onMouseEnter={() => setHovered(`PC:\n${hoverBlockData.pc.comment}\n\n${hoverBlockData.pc.value}`)}
            onMouseLeave={() => setHovered(null)}
        >
            <rect x="104.501" y="249.176" width="25" height="89.3088" stroke="black"/>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="110.001" y="296.268">PC</tspan></text>
        </g>
        {/* PC paths */}
        <path id="pc_default_line" d="M154 293L149 290.113V295.887L154 293ZM139 293V293.5H149.5V293V292.5H139V293Z" 
            fill={currDataPath.pc_default ? arrowColour: "#000000"}
        />
        <path id="pc_line" d="M130 293H139" 
            stroke={currDataPath.pc_default || currDataPath.pc_increment || currDataPath.pc_add ? arrowColour : "#000000"}
        />
        <path id="pc_increment_add_line" d="M139 214.333C137.527 214.333 136.333 215.527 136.333 217C136.333 218.473 137.527 219.667 139 219.667C140.473 219.667 141.667 218.473 141.667 217C141.667 215.527 140.473 214.333 139 214.333ZM139 290.333C137.527 290.333 136.333 291.527 136.333 293C136.333 294.473 137.527 295.667 139 295.667C140.473 295.667 141.667 294.473 141.667 293C141.667 291.527 140.473 290.333 139 290.333ZM139 217H138.5V293H139H139.5V217H139Z" 
            fill={currDataPath.pc_increment || currDataPath.pc_add ? arrowColour: "#000000"}
        />
        <path id="pc_increment_line" d="M115 150L110 147.113V152.887L115 150ZM139 217V216.5H92V217V217.5H139V217ZM92.5 150L92 150L92 217L92.5 217L93 217L93 150L92.5 150ZM92 150V150.5H110.5V150V149.5H92V150Z" 
            fill={currDataPath.pc_increment ? arrowColour: "#000000"}
        />
        <path id="pc_add_line" d="M501 106.012L496 103.125V108.899L501 106.012ZM139 217L139 217.5L234 217.521L234 217.021L234 216.521L139 216.5L139 217ZM233.5 217.001H234V105.999H233.5H233V217.001H233.5ZM496.5 106.012V105.512H233V106.012V106.512H496.5V106.012Z" 
            fill={ currDataPath.pc_add ? arrowColour: "#000000"}
        />
       
        {/* DATA MEMORY BOX */}
        <g 
            onMouseEnter={() => setHovered(`DATA MEMORY:\n${hoverBlockData.data_memory.read_data}\n\n${hoverBlockData.data_memory.write_data}`)}
            onMouseLeave={() => setHovered(null)}
        >
            <rect x="672.501" y="271.426" width="99" height="200.559" stroke="black"/>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="679.001" y="332.916">Address</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="710.339" y="378.724">Data</tspan><tspan x="701.882" y="390.724">memory</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="743.802" y="346.004">Read</tspan><tspan x="746.634" y="358.004">data</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="679.001" y="445.474">Write</tspan><tspan x="679.001" y="457.474">data</tspan></text>
        </g>
        {/* data memory path */}
        <path id="dm_mux_line" d="M825 353L820 350.113V355.887L825 353ZM772 353V353.5H820.5V353V352.5H772V353Z" 
            fill={ currDataPath.dm_mux ? arrowColour: "#000000"}
        />        
        
        {/* REGISTER FILE BOX */}
        <g 
            onMouseEnter={() => setHovered(`REGISTER FILES:\n${hoverBlockData.registers.read_register_1.comment}:  ${hoverBlockData.registers.read_register_1.value}\n${hoverBlockData.registers.read_register_2.comment}:  ${hoverBlockData.registers.read_register_2.value}\n${hoverBlockData.registers.write_register.comment}:  ${hoverBlockData.registers.write_register.value}\n\n`)}
            onMouseLeave={() => setHovered(null)}
        >
            <rect x="306.501" y="254.412" width="115" height="200.559" stroke="black"/>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="312.001" y="270.092">Read</tspan><tspan x="312.001" y="282.092">register 1</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="312.001" y="314.592">Read</tspan><tspan x="312.001" y="326.592">register 2</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="312.001" y="374.798">Write</tspan><tspan x="312.001" y="386.798">register</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="312.001" y="424.533">Write</tspan><tspan x="312.001" y="436.533">data</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="389.802" y="271.401">Read</tspan><tspan x="385.261" y="283.401">data 1</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="389.802" y="380.033">Read</tspan><tspan x="383.855" y="392.033">data 2</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="342.001" y="355.166">Registers</tspan></text>
        </g>
        {/* register file paths */}
        <path id="reg2_dm_line" d="M454 455L453.5 455L453.5 455.5H454V455ZM668 455L663 452.113V457.887L668 455ZM451.333 349C451.333 350.473 452.527 351.667 454 351.667C455.473 351.667 456.667 350.473 456.667 349C456.667 347.527 455.473 346.333 454 346.333C452.527 346.333 451.333 347.527 451.333 349ZM454 455V455.5H663.5V455V454.5H454V455ZM454 455L454.5 455L454.5 349L454 349L453.5 349L453.5 455L454 455Z" 
            fill={ currDataPath.reg2_dm ? arrowColour: "#000000"}
        />
        <line id="reg2_mux_dm_line" x1="422" y1="349.5" x2="454" y2="349.5" 
            stroke={ currDataPath.reg2_dm || currDataPath.reg2_mux ? arrowColour: "#000000"}
        />
        <path id="reg2_mux_line" d="M479.005 349.5L474.005 346.613V352.387L479.005 349.5ZM454 349.5V350H474.505V349.5V349H454V349.5Z" 
            fill={ currDataPath.reg2_mux ? arrowColour: "#000000"}
        />
        <path id="reg1_alu_line" d="M529 275L524 272.113V277.887L529 275ZM422 275V275.5H524.5V275V274.5H422V275Z" 
            fill={ currDataPath.reg1_mux ? arrowColour: "#000000"}
        />
 
        {/* SHIFT LEFT 1 BOX */}
        <rect x="446.501" y="148.397" width="36" height="78" rx="50" stroke="black"/>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="452.824" y="177.166">Shift</tspan><tspan x="452.429" y="189.166">left 1</tspan><tspan x="452.429" y="201.166">bit</tspan></text>
        {/* shift left 1 path */}
        <path id="imm_gen_shift_line" d="M501 184L496 181.113V186.887L501 184ZM482 184V184.5H496.5V184V183.5H482V184Z" 
            fill={ currDataPath.imm_gen_shift ? arrowColour: "#000000"}
        />        
        
        {/* IMM GEN BOX */}
        <g 
            onMouseEnter={() => setHovered(`IMMEDIATE GENERATOR:\n ${hoverBlockData.immediate_generator?.value || "No immediate field for this instruction type."}`)}
            onMouseLeave={() => setHovered(null)}
        > 
        <rect x="357.501" y="479.529" width="48" height="118" rx="70" stroke="black"/>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="371.816" y="531.857">Imm</tspan><tspan x="372.333" y="543.857">Gen</tspan></text>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="321.712" y="518.768">32</tspan></text>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="409.551" y="518.768">32</tspan></text>
        </g>
        {/* imm gen paths */}
        <path id="imm_gen_mux_line" d="M461.333 419C461.333 420.473 462.527 421.667 464 421.667C465.473 421.667 466.667 420.473 466.667 419C466.667 417.527 465.473 416.333 464 416.333C462.527 416.333 461.333 417.527 461.333 419ZM479 419L474 416.113V421.887L479 419ZM464 419V419.5H474.5V419V418.5H464V419Z" 
            fill={ currDataPath.imm_gen_mux ? arrowColour: "#000000"}
        />
        <path id="imm_gen_mux_shift_line" d="M405 541H465M464.5 418.998V541.002" 
            stroke={ currDataPath.imm_gen_mux || currDataPath.imm_gen_shift ? arrowColour: "#000000"}
        />
        <path id="imm_gen_shift_line" d="M464.5 226V420" 
            stroke={ currDataPath.imm_gen_shift ? arrowColour: "#000000"}
        />

        {/* MUX 3 BOX */}
        <g
            onMouseEnter={() => setHovered(`MUX(Write Data):\n${currDataPath.reg_write ? '': 'Write disabled'}${currDataPath.reg_write ? (currDataPath.dm_mux ? 'The Mux gets the value of 1 indicating that it writes from Data Memory': 'The Mux gets the value of 0 indicating that it writes from the ALU'): ''}.`)}
            onMouseLeave={() => setHovered(null)}
        >
            <rect x="827.501" y="334.25" width="34" height="112.868" rx="17" stroke="black"/>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="844.514" y="380.033">M</tspan><tspan x="846.028" y="392.033">u</tspan><tspan x="846.247" y="404.033">x</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="835.774" y="431.077">0</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="836.638" y="353.857">1</tspan></text>
        </g>
        {/* mux 3 paths */}
        <path id="reg_write_line" d="M303 428L298 425.113V430.887L303 428ZM276 428V428.5H298.5V428V427.5H276V428ZM276.5 428H276V623H276.5H277V428H276.5ZM276 622.969V623.469H883V622.969V622.469H276V622.969ZM882.5 388L882 388L882 623.469L882.5 623.469L883 623.469L883 388L882.5 388ZM882 388.5V388H862V388.5V389H882V388.5Z" 
            fill={ currDataPath.reg_write ? arrowColour: "#000000"}
        />

        {/* MUX 2 BOX */}
        <g
            onMouseEnter={() => setHovered(`MUX(ALU Input):\n${currDataPath.mux_alu ? '': 'Input disabled'}${currDataPath.mux_alu ? (currDataPath.imm_gen_mux ? 'The Mux gets the value of 1 indicating that it takes value from the Immediate Generator': 'The Mux gets the value of 0 indicating that it takes value from the register file'): ''}.`)}
            onMouseLeave={() => setHovered(null)}
        >
            <rect x="483.501" y="334.25" width="34" height="112.868" rx="17" stroke="black"/>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="500.514" y="373.489">M</tspan><tspan x="502.028" y="385.489">u</tspan><tspan x="502.247" y="397.489">x</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="492.638" y="420.607">1</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="491.774" y="352.548">0</tspan></text>
        </g>
        {/* mux 2 path */}
        <path id="mux_alu_line" d="M529 383L524 380.113V385.887L529 383ZM518 383V383.5H524.5V383V382.5H518V383Z" 
            fill={ currDataPath.mux_alu ? arrowColour: "#000000"}
        />
        
        {/* MUX 1 BOX */}
        <g
            onMouseEnter={() => setHovered(`MUX(Next Program Counter):\n${currDataPath.branch_taken ? 'The Mux gets the value of 1 indicating that it takes value from the immediate. PC + imm' : 'The Mux uses signal from the controller to determine the next PC. In this case, the Mux takes value 0 making the PC + 4'}.`)}
            onMouseLeave={() => setHovered(null)}
        >
            <rect x="55.5012" y="242.632" width="30" height="106.323" rx="15" stroke="black"/>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="71.5139" y="280.563">M</tspan><tspan x="73.0276" y="292.563">u</tspan><tspan x="73.2473" y="304.563">x</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="63.6379" y="327.68">1</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="62.7737" y="259.621">0</tspan></text>
        </g>
        {/* mux 1 path */}
        <path id="mux_pc_line" d="M101 293L96 290.113V295.887L101 293ZM86 293V293.5H96.5V293V292.5H86V293Z" 
            fill={ currDataPath.mux_pc ? arrowColour: "#000000"}
        />
        
        {/* ALU BOX */}
        <g 
            onMouseEnter={() => setHovered(`ALU:\n${hoverBlockData.alu.alu_result}\n`)}
            onMouseLeave={() => setHovered(null)}
        >
            <rect x={533.5} y={238} width={66} height={167.5} stroke="transparent"/>
            <path d="M533.501 238.206V307.573M533.501 336.367V405.735M533.388 307.159L542.388 321.556M542.401 321.054L533.401 336.76M533.737 405.179L599.737 351.517M533.737 238.762L599.737 292.423M599.501 291.867V352.073" stroke="black"/>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="544.491" y="321.136">ALU</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="571.539" y="296.269">Zero</tspan></text>
            <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="575.982" y="326.371">ALU </tspan><tspan x="566.236" y="338.371">Result</tspan></text>
        </g>
        {/* alu paths */}
        <path id="zero_line" d="M657 296.996L652 294.109V299.882L657 296.996ZM599 296.996V297.496H652.5V296.996V296.496H599V296.996Z" 
            fill={ currDataPath.zero ? arrowColour: "#000000"}
        />
        <path id="alu_res_mem_line" d="M668 332L663 329.113V334.887L668 332ZM622 332V332.5H663.5V332V331.5H622V332Z" 
            fill={ currDataPath.alu_res_mem ? arrowColour: "#000000"}
        />
        <path id="alu_res_mem_mux_line" d="M599 332H622" 
            stroke={ currDataPath.alu_res_mem || currDataPath.alu_res_mux ? arrowColour: "#000000"}
        />
        <path id="alu_res_mux" d="M619.583 332C619.583 333.472 620.777 334.666 622.25 334.666C623.723 334.666 624.917 333.472 624.917 332C624.917 330.527 623.723 329.333 622.25 329.333C620.777 329.333 619.583 330.527 619.583 332ZM809 509V509.5H809.5V509H809ZM825 431L820 428.113V433.887L825 431ZM622.25 332H621.75V509H622.25H622.75V332H622.25ZM622.25 509H621.75V509H622.25H622.75V509H622.25ZM809 509V508.5H622.25V509V509.5H809V509ZM622.25 509V508.5H622V509V509.5H622.25V509ZM809 509H809.5V431H809H808.5V509H809ZM809 431H809.5V430H809H808.5V431H809ZM809 431V431.5H820.5V431V430.5H809V431Z" 
            fill={ currDataPath.alu_res_mux ? arrowColour: "#000000"}
        />

        {/* ADD SUM BOX */}
        <g
            onMouseEnter={() => setHovered(`ADD(Branch Target Calculation):\n${hoverBlockData.branch_adder?.value || 'N/A'}`)}
            onMouseLeave={() => setHovered(null)}
        >
        <rect x="505.501" y="65.4412" width="66" height="167.5" stroke="transparent"/>
        <path d="M505.114 65.4412V134.809M505.114 163.603V232.97M505.001 134.394L514.001 148.791M514.014 148.29L505.014 163.996M505.35 232.415L571.35 178.753M505.35 65.997L571.35 119.659M571.114 119.103V179.309" stroke="black"/>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="515.783" y="152.298">ADD</tspan></text>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="546.891" y="145.754">Sum</tspan></text>
        {/* add sum paths */}
        <path id="branch_taken_line" d="M51.0012 305.25L46.0012 302.363V308.137L51.0012 305.25ZM7.62939e-06 0.499994L7.62942e-06 0.999994L713.001 0.999994L713.001 0.499994L713.001 -5.72205e-06L7.62937e-06 -5.69224e-06L7.62939e-06 0.499994ZM712.5 146.002H713V0.998285H712.5H712V146.002H712.5ZM713 146.502L713 146.002L571 146L571 146.5L571 147L713 147.002L713 146.502ZM0.503487 0L0.00348663 -5.70329e-06L7.62943e-06 305L0.500008 305L1.00001 305L1.00349 5.70329e-06L0.503487 0ZM46.5012 305.25V304.75H-0.0012207V305.25V305.75H46.5012V305.25Z" 
            fill={ currDataPath.branch_taken ? arrowColour: "#000000"}
        />
        </g>

        {/* ADD 4 BOX */}
        <g
            onMouseEnter={() => setHovered(`ADD(PC + 4) :\n${hoverBlockData.default_adder?.value || 'N/A'}`)}
            onMouseLeave={() => setHovered(null)}
            >
        <rect x="119.501" y="23.5588" width="66" height="167.5" stroke="transparent"/>
        <path d="M119.114 23.5588V92.9264M119.114 121.721V191.088M119.001 92.512L128.001 106.909M128.014 106.407L119.014 122.113M119.351 190.532L185.351 136.871M119.351 24.1147L185.351 77.7764M185.114 77.2206V137.426" stroke="black"/>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="154.785" y="107.798">Add</tspan></text>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="93.2299" y="63.2981">4</tspan></text>
        </g>
        {/* add 4 paths */}
        <path id="pc_default_lines" d="M115 63L110 60.1132V65.8868L115 63ZM101 63V63.5H110.5V63V62.5H101V63Z" 
            fill={ currDataPath.pc_default ? arrowColour: "#000000"}
        />
        <path id="pc_default_lines" d="M51 255L46 252.113V257.887L51 255ZM185 106V106.5H207V106V105.5H185V106ZM206.5 9.99933H206V106.001H206.5H207V9.99933H206.5ZM207 10V9.5H36V10V10.5H207V10ZM36 255V255.5H46.5V255V254.5H36V255ZM36.5 255H37V10H36.5H36V255H36.5Z" 
            fill={ currDataPath.pc_default ? arrowColour: "#000000"}
        />
        
        {/* HOVERING DISPLAY */}
        {hovered && (
            <>
                <rect x="1" y="455" width="240" height="165" stroke={results ? "black" : "white"}/>
                <foreignObject x={10} y={460} width={230} height={200} color={results ? "black" : "white"}>
                    {hoverTextbox}
                </foreignObject>
            </>
        )}

        </svg>
    </>
  );
}