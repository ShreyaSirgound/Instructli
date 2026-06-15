import React from "react";
import type { IFPath, IDPath, EXPath, MEMPath, WBPath } from "../../src/utils/pipeline-types";

type PipelineDatapathSVGProps = {
  getIFColour:  (key: keyof IFPath)  => string;
  getIDColour:  (key: keyof IDPath)  => string;
  getEXColour:  (key: keyof EXPath)  => string;
  getMEMColour: (key: keyof MEMPath) => string;
  getWBColour:  (key: keyof WBPath)  => string;
  onBlockHover?: (label: string | null) => void;
  hoverContent?: React.ReactElement;
  stageLabels?: { IF?: string; ID?: string; EX?: string; MEM?: string; WB?: string };
  hazards?: string[];
  active: boolean;
  analysisText?: string;
  // click handlers for quiz mode
  onSegmentClickIF?:  (key: keyof IFPath)  => void;
  onSegmentClickID?:  (key: keyof IDPath)  => void;
  onSegmentClickEX?:  (key: keyof EXPath)  => void;
  onSegmentClickMEM?: (key: keyof MEMPath) => void;
  onSegmentClickWB?:  (key: keyof WBPath)  => void;
};

export default function PipelineDatapathSVG({
  getIFColour,
  getIDColour,
  getEXColour,
  getMEMColour,
  getWBColour,
  onBlockHover,
  hoverContent,
  stageLabels,
  hazards,
  active,
  analysisText,
  onSegmentClickIF,
  onSegmentClickID,
  onSegmentClickEX,
  onSegmentClickMEM,
  onSegmentClickWB,
}: PipelineDatapathSVGProps) {
  const hover = (label: string) => onBlockHover?.(label);
  const unhover = () => onBlockHover?.(null);

  // seg helpers: wrap a path in a clickable <g> when a handler is provided
  const segIF  = (key: keyof IFPath)  => onSegmentClickIF  ? { onClick: () => onSegmentClickIF(key),  style: { cursor: "pointer" } } : {};
  const segID  = (key: keyof IDPath)  => onSegmentClickID  ? { onClick: () => onSegmentClickID(key),  style: { cursor: "pointer" } } : {};
  const segEX  = (key: keyof EXPath)  => onSegmentClickEX  ? { onClick: () => onSegmentClickEX(key),  style: { cursor: "pointer" } } : {};
  const segMEM = (key: keyof MEMPath) => onSegmentClickMEM ? { onClick: () => onSegmentClickMEM(key), style: { cursor: "pointer" } } : {};
  const segWB  = (key: keyof WBPath)  => onSegmentClickWB  ? { onClick: () => onSegmentClickWB(key),  style: { cursor: "pointer" } } : {};

  const hazardsWidth  = 80;
  const hazardsHeight = 24;
  const fontSize = 14;
  const svgWidth = 910;
  const svgHeight = 570;
  const margin = 220;
  const hazardsX = svgWidth - hazardsWidth - margin - 600;
  const hazardsY = svgHeight - hazardsHeight - margin;

  const analysisTextbox = React.createElement(
    "div",
    {
      xmlns: "http://www.w3.org/1999/xhtml",
      style: { fontSize: 12, whiteSpace: "pre-wrap", wordWrap: "break-word", color: "black", height: "150px", overflow: "auto", padding: "5px", marginRight: "10px" },
    },
    analysisText ?? "Select a preset to see analysis"
  );

  return (
    <>
      <svg width="100%" height="100%" viewBox="0 0 965 570" fill="transparent" preserveAspectRatio="xMidYMid meet">

        {/* INSTRUCTION MEMORY BOX */}
        <g onMouseEnter={() => hover("INSTRUCTION MEMORY")} onMouseLeave={unhover}>
          <rect x="112.526" y="245.576" width="107.824" height="148.929" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="117.361" y="256.154">Address</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="138.699" y="310.936">Instruction</tspan><tspan x="138.699" y="322.936">   memory</tspan></text>
          <text transform="matrix(0 -1 1 0 283.797 312.833)" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="8" fontWeight="500" letterSpacing="0em"><tspan x="35.2655" y="7.90909">Instruction</tspan></text>
        </g>

        {/* Instruction Memory Lines */}
        <g {...segID("id_imm_gen")}>
          <path id="id_imm_gen_line" d="M385 465L379.967 462.171L380.034 467.944L385 465ZM298.501 343H298.001V465.806H298.501H299.001V343H298.501ZM380.5 465.052L380.495 464.552L297.994 465.5L298 466L298.006 466.5L380.506 465.552L380.5 465.052Z"
            fill={getIDColour("id_imm_gen")}
          />
        </g>
        <g {...segID("id_reg_write")}>
          <path id="id_reg_write_line" d="M295.333 342C295.333 343.473 296.527 344.667 298 344.667C299.473 344.667 300.667 343.473 300.667 342C300.667 340.527 299.473 339.333 298 339.333C296.527 339.333 295.333 340.527 295.333 342ZM321 342L316 339.113V344.887L321 342ZM298 342V342.5H316.5V342V341.5H298V342Z"
            fill={getIDColour("id_reg_write")}
          />
        </g>
        <line id="id_reg_write_imm_gen_line" x1="298.5" y1="325" x2="298.5" y2="343"
          stroke={getIDColour("id_imm_gen") !== "#000000" || getIDColour("id_reg_write") !== "#000000" ? getIDColour("id_imm_gen") : "#000000"}
        />
        <g {...segID("id_reg1")}>
          <path id="id_reg1_line" d="M321 264L316 261.113V266.887L321 264ZM298 264V264.5H316.5V264V263.5H298V264ZM298.5 264H298V304H298.5H299V264H298.5Z"
            fill={getIDColour("id_reg1")}
          />
        </g>
        <g {...segID("id_reg2")}>
          <path id="id_reg2_line" d="M295.333 302C295.333 303.473 296.527 304.667 298 304.667C299.473 304.667 300.667 303.473 300.667 302C300.667 300.527 299.473 299.333 298 299.333C296.527 299.333 295.333 300.527 295.333 302ZM321 302L316 299.113V304.887L321 302ZM298 302V302.5H316.5V302V301.5H298V302Z"
            fill={getIDColour("id_reg2")}
          />
        </g>
        <line id="id_reg1_reg2_line" x1="298.5" y1="303" x2="298.5" y2="326"
          stroke={getIDColour("id_reg1") !== "#000000" || getIDColour("id_reg2") !== "#000000" ? getIDColour("id_reg1") : "#000000"}
        />
        <g {...segIF("im_id")}>
          <path id="im_id_line" d="M257 321L252 318.113V323.887L257 321ZM221 321V321.5H252.5V321V320.5H221V321Z"
            fill={getIFColour("im_id")}
          />
        </g>
        <path id="im_id_line2" d="M295.333 325C295.333 326.473 296.527 327.667 298 327.667C299.473 327.667 300.667 326.473 300.667 325C300.667 323.527 299.473 322.333 298 322.333C296.527 322.333 295.333 323.527 295.333 325ZM285 325V325.5H298V325V324.5H285V325Z"
          fill={
            getIDColour("id_reg1") !== "#000000" || getIDColour("id_reg2") !== "#000000" || getIDColour("id_reg_write") !== "#000000" || getIDColour("id_imm_gen") !== "#000000"
              ? getIDColour("id_reg1")
              : "#000000"
          }
        />

        {/* PC BOX */}
        <g onMouseEnter={() => hover("PC")} onMouseLeave={unhover}>
          <rect x="63.4487" y="222.51" width="21.4049" height="66.7564" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="66.1494" y="257.596">PC</tspan></text>
        </g>

        {/* PC Lines */}
        <g {...segIF("pc_im")}>
          <path id="pc_im_line" d="M109 258L104 255.113V260.887L109 258ZM94 258V258.5H104.5V258V257.5H94V258Z"
            fill={getIFColour("pc_im")}
          />
        </g>
        <g {...segID("id_ex")}>
          <path id="id_ex_line" d="M462 123L457 120.113V125.887L462 123ZM284 123V123.5L457.5 123.5V123V122.5L284 122.5V123Z"
            fill={getIDColour("id_ex")}
          />
        </g>
        <g {...segEX("ex_add")}>
          <path id="ex_add_line" d="M548 125L543 122.113V127.887L548 125ZM490 125V125.5L543.5 125.5V125V124.5L490 124.5V125Z"
            fill={getEXColour("ex_add")}
          />
        </g>
        <path id="pc_all_line" d="M86 258H95"
          stroke={
            getIFColour("pc_im") !== "#000000" || getIFColour("pc_increment") !== "#000000" || getIFColour("pc_id") !== "#000000"
              ? getIFColour("pc_im")
              : "#000000"
          }
        />
        <path id="pc_increment_pc_id_line" d="M95 196.333C93.5272 196.333 92.3333 197.527 92.3333 199C92.3333 200.473 93.5272 201.667 95 201.667C96.4728 201.667 97.6667 200.473 97.6667 199C97.6667 197.527 96.4728 196.333 95 196.333ZM95 255.333C93.5272 255.333 92.3333 256.527 92.3333 258C92.3333 259.473 93.5272 260.667 95 260.667C96.4728 260.667 97.6667 259.473 97.6667 258C97.6667 256.527 96.4728 255.333 95 255.333ZM95 199H94.5V258H95H95.5V199H95Z"
          fill={getIFColour("pc_increment") !== "#000000" || getIFColour("pc_id") !== "#000000" ? getIFColour("pc_increment") : "#000000"}
        />
        <g {...segIF("pc_increment")}>
          <path id="pc_increment_line" d="M155.17 98L150.17 95.1132V100.887L155.17 98ZM95.3298 98L94.8298 98L94.8298 200L95.3298 200L95.8298 200L95.8298 98L95.3298 98ZM94 98V98.5H150.67V98V97.5H94V98Z"
            fill={getIFColour("pc_increment")}
          />
        </g>
        <g {...segIF("pc_id")}>
          <path id="pc_id_line" d="M237 199.979V200.479H237.5L237.5 199.979L237 199.979ZM256.5 124.013L251.5 121.126V126.899L256.5 124.013ZM94.7874 199.979V200.479H237V199.979V199.479H94.7874V199.979ZM237 199.979L237.5 199.979L237.5 123.52L237 123.52L236.5 123.52L236.5 199.979L237 199.979ZM252 124.013V123.513H236.5V124.013V124.513H252V124.013Z"
            fill={getIFColour("pc_id")}
          />
        </g>

        {/* DATA MEMORY BOX */}
        <g onMouseEnter={() => hover("DATA MEMORY")} onMouseLeave={unhover}>
          <rect x="705.722" y="287.384" width="105.69" height="147.487" stroke="black"/>
          <text id="Address_2" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="710.556" y="325.352">Address</tspan></text>
          <text id="Data Memory_3" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="746.871" y="355.626">Data&#10;</tspan><tspan x="738.414" y="367.626">memory</tspan></text>
          <text id="Read Data" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="783.445" y="315.261">Read&#10;</tspan><tspan x="786.277" y="327.261">data</tspan></text>
          <text id="Write Data" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="710.556" y="407.525">Write&#10;</tspan><tspan x="710.556" y="419.525">data</tspan></text>
        </g>

        {/* Data Memory Lines */}
        <g {...segMEM("dm_wb")}>
          <path id="dm_wb_line" d="M825 324L820 321.113V326.887L825 324ZM812 324V324.5H820.5V324V323.5H812V324Z"
            fill={getMEMColour("dm_wb")}
          />
        </g>
        <g {...segWB("dm_mux")}>
          <path id="dm_mux_line" d="M875 325L870 322.113V327.887L875 325ZM853 325V325.5H870.5V325V324.5H853V325Z"
            fill={getWBColour("dm_mux")}
          />
        </g>

        {/* REGISTERS BOX */}
        <g onMouseEnter={() => hover("REGISTER FILE")} onMouseLeave={unhover}>
          <rect x="322.705" y="244.135" width="106.757" height="150.371" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="327.54" y="257.596">Read &#10;</tspan><tspan x="327.54" y="269.596">register 1</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="327.54" y="290.753">Read &#10;</tspan><tspan x="327.54" y="302.753">register 2</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="327.54" y="335.444">Write &#10;</tspan><tspan x="327.54" y="347.444">register</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="327.54" y="368.601">Write &#10;</tspan><tspan x="327.54" y="380.601">data</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="398.294" y="260.479">Read&#10;</tspan><tspan x="393.753" y="272.479">data 1</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="398.294" y="339.769">Read&#10;</tspan><tspan x="392.347" y="351.769">data 2</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="352.955" y="323.911">Registers</tspan></text>
        </g>

        {/* Registers Lines */}
        <g {...segEX("reg2_mem")}>
          <path id="reg2_mem_line" d="M500 419L499.5 419L499.5 419.5H500V419ZM651 419L646 416.113V421.887L651 419ZM497.333 333C497.333 334.473 498.527 335.667 500 335.667C501.473 335.667 502.667 334.473 502.667 333C502.667 331.527 501.473 330.333 500 330.333C498.527 330.333 497.333 331.527 497.333 333ZM500 419V419.5H646.5V419V418.5H500V419ZM500 419L500.5 419L500.5 333L500 333L499.5 333L499.5 419L500 419Z"
            fill={getEXColour("reg2_mem")}
          />
        </g>
        <line id="reg2_mem_mux_line" x1="489.994" y1="333" x2="501.006" y2="333"
          stroke={getEXColour("reg2_mem") !== "#000000" || getEXColour("reg2_mux") !== "#000000" ? getEXColour("reg2_mem") : "#000000"}
        />
        <g {...segEX("reg2_mux")}>
          <path id="reg2_mux_line" d="M522 333L517 330.113V335.887L522 333ZM500 333V333.5H517.5V333V332.5H500V333Z"
            fill={getEXColour("reg2_mux")}
          />
        </g>
        <g {...segID("reg2_ex")}>
          <path id="reg2_ex_line" d="M462 333L457 330.113V335.887L462 333ZM431 333V333.5H457.5V333V332.5H431V333Z"
            fill={getIDColour("reg2_ex")}
          />
        </g>
        <g {...segID("reg1_ex")}>
          <path id="reg1_ex_line" d="M462 274L457 271.113V276.887L462 274ZM431 274V274.5H457.5V274V273.5H431V274Z"
            fill={getIDColour("reg1_ex")}
          />
        </g>
        <g {...segEX("reg1_alu")}>
          <path id="reg1_alu_line" d="M566 274L561 271.113V276.887L566 274ZM490 274V274.5H561.5V274V273.5H490V274Z"
            fill={getEXColour("reg1_alu")}
          />
        </g>
        <g {...segMEM("reg2_dm")}>
          <path id="reg2_dm_line" d="M702 419L697 416.113V421.887L702 419ZM678 419V419.5H697.5V419V418.5H678V419Z"
            fill={getMEMColour("reg2_dm")}
          />
        </g>

        {/* SHIFT LEFT BOX */}
        <g id="Shift Left">
          <path d="M508.707 141.779C513.055 141.779 517.147 145.565 520.18 152.047C523.194 158.489 525.073 167.424 525.073 177.32C525.072 187.216 523.194 196.151 520.18 202.593C517.147 209.075 513.056 212.86 508.707 212.86C504.359 212.86 500.268 209.075 497.235 202.593C494.22 196.151 492.342 187.216 492.342 177.32C492.342 167.424 494.22 158.489 497.235 152.047C500.268 145.565 504.359 141.779 508.707 141.779Z" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="497.075" y="168.936">Shift&#10;</tspan><tspan x="496.679" y="180.936">left 1</tspan><tspan x="496.679" y="192.936">bit</tspan></text>
        </g>

        {/* Shift Left Line */}
        <g {...segEX("ex_shift")}>
          <path id="ex_shift_line" d="M548 182L543 179.113V184.887L548 182ZM526 182V182.5H543.5V182V181.5H526V182Z"
            fill={getEXColour("ex_shift")}
          />
        </g>

        {/* IMM GEN BOX */}
        <g id="Imm Gen" onMouseEnter={() => hover("IMMEDIATE GENERATOR")} onMouseLeave={unhover}>
          <path d="M408.091 418.571C413.521 418.571 418.598 423.398 422.346 431.58C426.075 439.719 428.395 450.998 428.395 463.482C428.395 475.967 426.075 487.246 422.346 495.385C418.598 503.567 413.521 508.393 408.091 508.394C402.66 508.394 397.582 503.567 393.834 495.385C390.105 487.246 387.786 475.967 387.786 463.482C387.786 450.998 390.105 439.719 393.834 431.58C397.582 423.398 402.66 418.571 408.091 418.571Z" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="398.438" y="460.865">Imm&#10;</tspan><tspan x="398.956" y="472.865">Gen</tspan></text>
          <text id="32" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="356.992" y="449.332">32</tspan></text>
          <text id="64" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="431.513" y="449.332">32</tspan></text>
          <line id="slash" y1="-0.5" x2="16.2351" y2="-0.5" transform="matrix(0.255758 0.966741 -0.681045 0.732241 440.631 456.995)" stroke="black"/>
          <line id="slash" y1="-0.5" x2="15.6137" y2="-0.5" transform="matrix(0.320965 0.947091 -0.765958 0.642891 365.948 458.437)" stroke="black"/>
        </g>

        {/* Imm Gen Lines */}
        <g {...segEX("ex_mux")}>
          <path id="ex_mux_line" d="M505.333 383C505.333 384.473 506.527 385.667 508 385.667C509.473 385.667 510.667 384.473 510.667 383C510.667 381.527 509.473 380.333 508 380.333C506.527 380.333 505.333 381.527 505.333 383ZM522 383L517 380.113V385.887L522 383ZM508 383V383.5H517.5V383V382.5H508V383Z"
            fill={getEXColour("ex_mux")}
          />
        </g>
        <g {...segID("imm_ex")}>
          <path id="imm_ex_line" d="M462 467L457 464.113V469.887L462 467ZM429 467V467.5H457.5V467V466.5H429V467Z"
            fill={getIDColour("imm_ex")}
          />
        </g>
        <path id="ex_mux_shift_line" d="M490 464.999H509M508.842 383V465"
          stroke={getEXColour("ex_shift") !== "#000000" || getEXColour("ex_mux") !== "#000000" ? getEXColour("ex_shift") : "#000000"}
        />
        <path id="ex_shift_line2" d="M508.85 214V384"
          stroke={getEXColour("ex_shift")}
        />

        {/* MUX 3 BOX */}
        <g id="Mux 3" onMouseEnter={() => hover("MUX (Write Back)")} onMouseLeave={unhover}>
          <rect x="876.426" y="309.008" width="22.4718" height="79.731" rx="11.2359" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="886.375" y="338.327">M&#10;</tspan><tspan x="887.888" y="350.327">u&#10;</tspan><tspan x="888.108" y="362.327">x</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="880.7" y="380.134">0</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="881.564" y="325.352">1</tspan></text>
        </g>

        {/* Mux 3 Line */}
        <g {...segWB("reg_write")}>
          <path id="reg_write_line" d="M321 374.5L316 371.613V377.387L321 374.5ZM304.5 374.5V375H316.5V374.5V374H304.5V374.5ZM304.5 374L304 374L304 568.57L304.5 568.57L305 568.57L305 374L304.5 374ZM304 568.541V569.041H910V568.541V568.041H304V568.541ZM909.501 353L909.001 353L909.001 569L909.501 569L910.001 569L910.001 353L909.501 353ZM909.001 353.459V352.959H900V353.459V353.959H909.001V353.459Z"
            fill={getWBColour("reg_write")}
          />
        </g>

        {/* MUX 2 BOX */}
        <g id="Mux 2" onMouseEnter={() => hover("MUX (ALU Input)")} onMouseLeave={unhover}>
          <rect x="524.349" y="316.216" width="22.4718" height="82.6143" rx="11.2359" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="534.298" y="345.535">M&#10;</tspan><tspan x="535.812" y="357.535">u&#10;</tspan><tspan x="536.032" y="369.535">x</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="530.021" y="383.017">1</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="529.157" y="331.118">0</tspan></text>
        </g>

        {/* Mux 2 Line */}
        <g {...segEX("mux_alu")}>
          <path id="mux_alu_line" d="M567 357L562 354.113V359.887L567 357ZM548 357V357.5H562.5V357V356.5H548V357Z"
            fill={getEXColour("mux_alu")}
          />
        </g>

        {/* MUX 1 BOX */}
        <g id="Mux 1" onMouseEnter={() => hover("MUX (Next PC)")} onMouseLeave={unhover}>
          <rect x="26.1074" y="212.418" width="21.4049" height="86.9391" rx="10.7024" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="36.5901" y="246.063">M&#10;</tspan><tspan x="38.1038" y="258.063">u&#10;</tspan><tspan x="38.3235" y="270.063">x</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="31.2459" y="283.545">1</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="30.3816" y="227.322">0</tspan></text>
        </g>

        {/* Mux 1 Line */}
        <g {...segIF("mux_pc")}>
          <path id="mux_pc_line" d="M62 256L57 253.113V258.887L62 256ZM48 256V256.5H57.5V256V255.5H48V256Z"
            fill={getIFColour("mux_pc")}
          />
        </g>

        {/* ALU BOX */}
        <g onMouseEnter={() => hover("ALU")} onMouseLeave={unhover}>
          <rect x={569.5} y={257} width={57} height={112.5} stroke="transparent"/>
          <path d="M569.822 256.61V303.17M569.822 322.496V369.056M569.726 302.891L577.396 312.555M577.407 312.218L569.737 322.76M570.023 368.683L626.271 332.665M570.023 256.983L626.271 293.001M626.07 292.628V333.038" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="578.387" y="310.936">ALU</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="600.906" y="296.52">Zero</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="8" fontWeight="500" letterSpacing="0em"><tspan x="605.988" y="316.417">ALU </tspan><tspan x="598.191" y="326.417">Result</tspan></text>
        </g>

        {/* ALU Lines */}
        <g {...segEX("zero_mem")}>
          <path id="zero_mem_line" d="M651 298L646 295.113V300.887L651 298ZM627 298V298.5H646.5V298V297.5H627V298Z"
            fill={getEXColour("zero_mem")}
          />
        </g>
        <g {...segMEM("zero_mem2")}>
          <path id="zero_mem2_line" d="M692 297L687 294.113V299.887L692 297ZM678 297V297.5H687.5V297V296.5H678V297Z"
            fill={getMEMColour("zero_mem2")}
          />
        </g>
        <g {...segMEM("alu_dm")}>
          <path id="alu_dm_line" d="M702 327L697 324.113V329.887L702 327ZM686 327V327.5H697.5V327V326.5H686V327Z"
            fill={getMEMColour("alu_dm")}
          />
        </g>
        <g {...segEX("alu_mem")}>
          <path id="alu_mem_line" d="M651 324L646 321.113V326.887L651 324ZM627 324V324.5H646.5V324V323.5H627V324Z"
            fill={getEXColour("alu_mem")}
          />
        </g>
        <path id="alu_dm_wb_line" d="M678 327H688"
          stroke={getMEMColour("alu_dm") !== "#000000" || getMEMColour("alu_wb") !== "#000000" ? getMEMColour("alu_dm") : "#000000"}
        />
        <g {...segWB("alu_mux")}>
          <path id="alu_mux_line" d="M863 458V458.5H863.5V458H863ZM863 379V378.5H862.5V379H863ZM875 379L870 376.113V381.887L875 379ZM863 458V457.5H853V458V458.5H863V458ZM863 458H863.5V379H863H862.5V458H863ZM863 379V379.5H870.5V379V378.5H863V379Z"
            fill={getWBColour("alu_mux")}
          />
        </g>
        <g {...segMEM("alu_wb")}>
          <path id="alu_wb_line" d="M684.833 327C684.833 328.473 686.027 329.667 687.5 329.667C688.973 329.667 690.167 328.473 690.167 327C690.167 325.527 688.973 324.333 687.5 324.333C686.027 324.333 684.833 325.527 684.833 327ZM825 458L820 455.113V460.887L825 458ZM687.5 327H687V458H687.5H688V327H687.5ZM820.5 458V457.5H687V458V458.5H820.5V458Z"
            fill={getMEMColour("alu_wb")}
          />
        </g>

        {/* ADD 2 BOX */}
        <g id="Add 2" onMouseEnter={() => hover("ADD (Branch Target)")} onMouseLeave={unhover}>
          <rect x={550} y={108} width={57} height={112.5} stroke="transparent"/>
          <path d="M550.603 108.122V145.728M550.603 161.338V198.944M550.521 145.503L557.034 153.308M557.043 153.036L550.531 161.551M550.774 198.643L598.532 169.551M550.774 108.423L598.532 137.515M598.361 137.213V169.853" stroke="black"/>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="557.941" y="140.824">ADD</tspan></text>
          <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="574.585" y="153.799">Sum</tspan></text>
        </g>

        {/* Add 2 Lines */}
        <g {...segEX("add_mem")}>
          <path id="add_mem_line" d="M650.805 156.549L645.805 153.663V159.436L650.805 156.549ZM599.664 156.549V157.049H646.305V156.549V156.049H599.664V156.549Z"
            fill={getEXColour("add_mem")}
          />
        </g>
        <g {...segIF("branch_taken")}>
          <path id="branch_taken_line" d="M720.498 158.556V159.056H720.998V158.556H720.498ZM22.5626 284.498L17.5626 281.611V287.385L22.5626 284.498ZM0.0012241 0.501755L0.0012241 1.00175L721 1.00175L721 0.501755L721 0.0017548L0.0012241 0.00175483L0.0012241 0.501755ZM720.498 158.556H720.998V0.501755H720.498H719.998V158.556H720.498ZM720.498 158.556V158.056H678.382V158.556V159.056H720.498V158.556ZM0.506104 0H0.00610359V285H0.506104H1.0061V0H0.506104ZM18.0626 284.498V283.998H0V284.498V284.998H18.0626V284.498Z"
            fill={getIFColour("branch_taken")}
          />
        </g>

        {/* ADD 1 BOX */}
        <g id="Add 1" onMouseEnter={() => hover("ADD (PC + 4)")} onMouseLeave={unhover}>
          <rect x={154} y={79} width={57} height={112.5} stroke="transparent"/>
          <path id="Add 1_2" d="M157.966 79.2896V115.702M157.966 130.816V167.229M157.903 115.484L162.968 123.042M162.975 122.778L157.91 131.023M158.099 166.937L195.244 138.769M158.099 79.5813L195.244 107.749M195.111 107.458V139.061" stroke="black"/>
          <text id="Add_2" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="166.857" y="122.083">Add</tspan></text>
          <text id="4" fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="123.158" y="153.799">4</tspan></text>
        </g>

        {/* Add 1 Lines */}
        <g {...segIF("pc_default")}>
          <path id="pc_default_line" d="M154 154L149 151.113V156.887L154 154ZM136 154V154.5H149.5V154V153.5H136V154Z"
            fill={getIFColour("pc_default")}
          />
          <path id="pc_default_loop_line" d="M210 21.0006H210.5V20.5006L210 20.5006L210 21.0006ZM23.5 232L18.5 229.113V234.887L23.5 232ZM196 123L196 123.5L210.5 123.501L210.5 123.001L210.5 122.501L196 122.5L196 123ZM210 21.0006H209.5V123.001H210H210.5V21.0006H210ZM210 21.0006L210 20.5006L10 20.5005L10 21.0005L10 21.5005L210 21.5006L210 21.0006ZM10 232V232.5H19V232V231.5H10V232ZM10.5848 232H11.0848V21.0005H10.5848H10.0848V232H10.5848Z"
            fill={getIFColour("pc_default")}
          />
        </g>

        {/* STAGE SEPARATORS */}
        <rect id="IF/ED Wall" x="259.758" y="55.2817" width="23.5387" height="484.828" fill="#D9D9D9" stroke="black"/>
        <rect id="ID/EX Wall" x="465.67" y="55.2817" width="23.5387" height="484.828" fill="#D9D9D9" stroke="black"/>
        <rect id="EX/MEM Wall" x="653.444" y="55.2817" width="23.5387" height="484.828" fill="#D9D9D9" stroke="black"/>
        <rect id="MEM/WB Wall" x="828.415" y="55.2817" width="23.5387" height="484.828" fill="#D9D9D9" stroke="black"/>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="261.658" y="42.7938">IF/ID</tspan></text>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="463.839" y="42.7938">ID/EX</tspan></text>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="647.819" y="42.7938">EX/MEM</tspan></text>
        <text fill="black" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="10" fontWeight="500" letterSpacing="0em"><tspan x="819.129" y="42.7938">MEM/WB</tspan></text>

        {/* PIPELINE STAGE LABEL BOXES */}
        <g>
          <rect x="60" y="32" width="120" height="18" fill="#f3f4f6" rx="6" />
          <text fill="#374151" xmlSpace="preserve" style={{ whiteSpace: "pre", fontWeight: 700, fontSize: 14, letterSpacing: "0em" }} x="70" y="45">{stageLabels?.IF ?? ""}</text>
        </g>
        <g>
          <rect x="320" y="32" width="120" height="18" fill="#f3f4f6" rx="6" />
          <text fill="#374151" xmlSpace="preserve" style={{ whiteSpace: "pre", fontWeight: 700, fontSize: 14, letterSpacing: "0em" }} x="325" y="45">{stageLabels?.ID ?? ""}</text>
        </g>
        <g>
          <rect x="515" y="32" width="120" height="18" fill="#f3f4f6" rx="6" />
          <text fill="#374151" xmlSpace="preserve" style={{ whiteSpace: "pre", fontWeight: 700, fontSize: 14, letterSpacing: "0em" }} x="520" y="45">{stageLabels?.EX ?? ""}</text>
        </g>
        <g>
          <rect x="690" y="32" width="120" height="18" fill="#f3f4f6" rx="6" />
          <text fill="#374151" xmlSpace="preserve" style={{ whiteSpace: "pre", fontWeight: 700, fontSize: 14, letterSpacing: "0em" }} x="695" y="45">{stageLabels?.MEM ?? ""}</text>
        </g>
        <g>
          <rect x="865" y="32" width="120" height="18" fill="#f2f4f6" rx="6" />
          <text fill="#374151" xmlSpace="preserve" style={{ whiteSpace: "pre", fontWeight: 700, fontSize: 14, letterSpacing: "0em" }} x="865" y="45">{stageLabels?.WB ?? ""}</text>
        </g>

        {/* HAZARDS BOX */}
        <g onMouseEnter={() => hover("HAZARDS")} onMouseLeave={unhover}>
          <rect x={hazardsX} y={hazardsY} width={hazardsWidth} height={hazardsHeight}
            fill={hazards && hazards.length > 0 ? "#ff0000" : "#f3f4f6"} stroke="black" rx="6"
          />
          <text x={hazardsX + 15} y={hazardsY + hazardsHeight / 2 + 5} fill="#374151" fontSize={fontSize} fontWeight="700" style={{ whiteSpace: "pre", letterSpacing: "0em" }}>
            Hazards
          </text>
        </g>

        {/* HOVER DISPLAY */}
        {active && (
          <>
            <rect x="1" y="400" width="240" height="160" stroke="black"/>
            <foreignObject x={10} y={400} width={230} height={160}>
              {hoverContent ?? analysisTextbox}
            </foreignObject>
          </>
        )}
      </svg>
    </>
  );
}