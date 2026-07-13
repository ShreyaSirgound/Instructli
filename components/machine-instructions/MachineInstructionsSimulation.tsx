'use client';

import { useMemo, useState } from 'react';
import { Card } from '../Card';

type FormatKind = 'R' | 'I' | 'S' | 'B' | 'J';

type RInstruction = 'add' | 'sub' | 'sll';
type IInstruction = 'addi' | 'lw' | 'slli';
type SInstruction = 'sw' | 'sh' | 'sb';
type BInstruction = 'beq' | 'bne';
type JInstruction = 'jal';

type BitField = {
  label: string;
  bits: number;
  value: number;
};

type DecodeCase = {
  word: number;
  format: FormatKind;
  mnemonic: RInstruction | IInstruction | SInstruction | BInstruction | JInstruction;
  rd?: number;
  rs1?: number;
  rs2?: number;
  immediate?: number;
  assembly: string;
};

const R_META: Record<RInstruction, { funct3: number; funct7: number; opcode: number }> = {
  add: { funct3: 0, funct7: 0, opcode: 0x33 },
  sub: { funct3: 0, funct7: 0x20, opcode: 0x33 },
  sll: { funct3: 1, funct7: 0, opcode: 0x33 },
};

const I_META: Record<IInstruction, { funct3: number; opcode: number; immediateLabel: string; immediateMin: number; immediateMax: number }> = {
  addi: { funct3: 0, opcode: 0x13, immediateLabel: 'immediate', immediateMin: -2048, immediateMax: 2047 },
  lw: { funct3: 2, opcode: 0x03, immediateLabel: 'offset', immediateMin: -2048, immediateMax: 2047 },
  slli: { funct3: 1, opcode: 0x13, immediateLabel: 'shamt', immediateMin: 0, immediateMax: 31 },
};

const S_META: Record<SInstruction, { funct3: number; opcode: number }> = {
  sw: { funct3: 2, opcode: 0x23 },
  sh: { funct3: 1, opcode: 0x23 },
  sb: { funct3: 0, opcode: 0x23 },
};

const B_META: Record<BInstruction, { funct3: number; opcode: number }> = {
  beq: { funct3: 0, opcode: 0x63 },
  bne: { funct3: 1, opcode: 0x63 },
};

const J_META: Record<JInstruction, { opcode: number }> = {
  jal: { opcode: 0x6F },
};

function maskBits(value: number, bits: number) {
  const mask = (1 << bits) - 1;
  return value & mask;
}

function toBitString(value: number, bits: number) {
  return maskBits(value, bits).toString(2).padStart(bits, '0');
}

function toHex32(value: number) {
  return `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

function groupNibbleBits(value: number) {
  return (value >>> 0)
    .toString(2)
    .padStart(32, '0')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function sanitizeRegisterInput(raw: string) {
  const digitsOnly = raw.replace(/\D/g, '');
  if (digitsOnly === '') {
    return '';
  }

  return String(Math.min(31, Number(digitsOnly)));
}

function parseRegisterValue(value: string) {
  if (value === '') {
    return 0;
  }

  return Math.min(31, Math.max(0, Number(value)));
}

function FieldRow({ fields }: { fields: BitField[] }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}>
        {fields.map((field) => (
          <div key={field.label} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700">{field.label}</p>
            <p className="text-xs text-gray-500">{field.bits} bits</p>
            <p className="mt-1 font-mono text-sm text-gray-900">{toBitString(field.value, field.bits)}</p>
            <p className="text-xs text-gray-500">dec: {maskBits(field.value, field.bits)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MachineInstructionsSimulation() {
  const [format, setFormat] = useState<FormatKind>('R');

  const [rInstruction, setRInstruction] = useState<RInstruction>('add');
  const [rRd, setRRd] = useState('9');
  const [rRs1, setRRs1] = useState('20');
  const [rRs2, setRRs2] = useState('21');

  const [iInstruction, setIInstruction] = useState<IInstruction>('lw');
  const [iRd, setIRd] = useState('7');
  const [iRs1, setIRs1] = useState('18');
  const [iImmediate, setIImmediate] = useState(120);

  const [sInstruction, setSInstruction] = useState<SInstruction>('sw');
  const [sRs2, setSRs2] = useState('7');
  const [sRs1, setSRs1] = useState('18');
  const [sImmediate, setSImmediate] = useState(120);

  const [bInstruction, setBInstruction] = useState<BInstruction>('beq');
  const [bRs1, setBRs1] = useState('5');
  const [bRs2, setBRs2] = useState('6');
  const [bOffset, setBOffset] = useState(16);

  const [jRd, setJRd] = useState('1');
  const [jOffset, setJOffset] = useState(100);

  const decodeCases: DecodeCase[] = [
    {
      word: 0x015A04B3,
      format: 'R',
      mnemonic: 'add',
      rd: 9,
      rs1: 20,
      rs2: 21,
      assembly: 'add x9, x20, x21',
    },
    {
      word: 0x07892383,
      format: 'I',
      mnemonic: 'lw',
      rd: 7,
      rs1: 18,
      immediate: 120,
      assembly: 'lw x7, 120(x18)',
    },
    {
      word: 0x06792C23,
      format: 'S',
      mnemonic: 'sw',
      rs1: 18,
      rs2: 7,
      immediate: 120,
      assembly: 'sw x7, 120(x18)',
    },
    {
      word: 0x416283B3,
      format: 'R',
      mnemonic: 'sub',
      rd: 7,
      rs1: 5,
      rs2: 22,
      assembly: 'sub x7, x5, x22',
    },
    {
      word: 0x00628863,
      format: 'B',
      mnemonic: 'beq',
      rs1: 5,
      rs2: 6,
      immediate: 16,
      assembly: 'beq x5, x6, 16',
    },
    {
      word: 0x064000EF,
      format: 'J',
      mnemonic: 'jal',
      rd: 1,
      immediate: 100,
      assembly: 'jal x1, 100',
    },
  ];

  const [decodeIndex, setDecodeIndex] = useState(0);
  const [decodeFormat, setDecodeFormat] = useState('');
  const [decodeMnemonic, setDecodeMnemonic] = useState('');
  const [decodeRd, setDecodeRd] = useState('');
  const [decodeRs1, setDecodeRs1] = useState('');
  const [decodeRs2, setDecodeRs2] = useState('');
  const [decodeImmediate, setDecodeImmediate] = useState('');
  const [decodeChecked, setDecodeChecked] = useState(false);
  const [decodeCorrect, setDecodeCorrect] = useState(false);

  const activeDecode = decodeCases[decodeIndex];

  const decodeRequiredComplete =
    decodeFormat !== '' &&
    decodeMnemonic !== '' &&
    (activeDecode.rs1 == null || decodeRs1 !== '') &&
    (activeDecode.rd == null || decodeRd !== '') &&
    (activeDecode.rs2 == null || decodeRs2 !== '') &&
    (activeDecode.immediate == null || decodeImmediate !== '');

  const encoderResult = useMemo(() => {
    if (format === 'R') {
      const meta = R_META[rInstruction];
      const rd = maskBits(parseRegisterValue(rRd), 5);
      const rs1 = maskBits(parseRegisterValue(rRs1), 5);
      const rs2 = maskBits(parseRegisterValue(rRs2), 5);
      const word =
        (meta.funct7 << 25) |
        (rs2 << 20) |
        (rs1 << 15) |
        (meta.funct3 << 12) |
        (rd << 7) |
        meta.opcode;

      const fields: BitField[] = [
        { label: 'funct7', bits: 7, value: meta.funct7 },
        { label: 'rs2', bits: 5, value: rs2 },
        { label: 'rs1', bits: 5, value: rs1 },
        { label: 'funct3', bits: 3, value: meta.funct3 },
        { label: 'rd', bits: 5, value: rd },
        { label: 'opcode', bits: 7, value: meta.opcode },
      ];

      return {
        assembly: `${rInstruction} x${rd}, x${rs1}, x${rs2}`,
        fields,
        word,
      };
    }

    if (format === 'I') {
      const meta = I_META[iInstruction];
      const rd = maskBits(parseRegisterValue(iRd), 5);
      const rs1 = maskBits(parseRegisterValue(iRs1), 5);
      const immediate = maskBits(iImmediate, 12);
      const word =
        (immediate << 20) |
        (rs1 << 15) |
        (meta.funct3 << 12) |
        (rd << 7) |
        meta.opcode;

      const fields: BitField[] = [
        { label: 'imm[11:0]', bits: 12, value: immediate },
        { label: 'rs1', bits: 5, value: rs1 },
        { label: 'funct3', bits: 3, value: meta.funct3 },
        { label: 'rd', bits: 5, value: rd },
        { label: 'opcode', bits: 7, value: meta.opcode },
      ];

      const asmTail = iInstruction === 'lw' ? `${iImmediate}(x${rs1})` : `x${rs1}, ${iImmediate}`;
      return {
        assembly: `${iInstruction} x${rd}, ${asmTail}`,
        fields,
        word,
      };
    }

    if (format === 'S') {
      const meta = S_META[sInstruction];
      const rs1 = maskBits(parseRegisterValue(sRs1), 5);
      const rs2 = maskBits(parseRegisterValue(sRs2), 5);
      const imm12 = maskBits(sImmediate, 12);
      const immUpper = (imm12 >> 5) & 0x7F;
      const immLower = imm12 & 0x1F;
      const word =
        (immUpper << 25) |
        (rs2 << 20) |
        (rs1 << 15) |
        (meta.funct3 << 12) |
        (immLower << 7) |
        meta.opcode;
      const fields: BitField[] = [
        { label: 'imm[11:5]', bits: 7, value: immUpper },
        { label: 'rs2', bits: 5, value: rs2 },
        { label: 'rs1', bits: 5, value: rs1 },
        { label: 'funct3', bits: 3, value: meta.funct3 },
        { label: 'imm[4:0]', bits: 5, value: immLower },
        { label: 'opcode', bits: 7, value: meta.opcode },
      ];
      return {
        assembly: `${sInstruction} x${rs2}, ${sImmediate}(x${rs1})`,
        fields,
        word,
      };
    }

    if (format === 'B') {
      const meta = B_META[bInstruction];
      const rs1 = maskBits(parseRegisterValue(bRs1), 5);
      const rs2 = maskBits(parseRegisterValue(bRs2), 5);
      const imm12  = (bOffset >> 12) & 1;
      const imm11  = (bOffset >> 11) & 1;
      const imm10_5 = (bOffset >> 5) & 0x3F;
      const imm4_1  = (bOffset >> 1) & 0xF;
      const word =
        (imm12 << 31) |
        (imm10_5 << 25) |
        (rs2 << 20) |
        (rs1 << 15) |
        (meta.funct3 << 12) |
        (imm4_1 << 8) |
        (imm11 << 7) |
        meta.opcode;
      const fields: BitField[] = [
        { label: 'imm[12,10:5]', bits: 7, value: (imm12 << 6) | imm10_5 },
        { label: 'rs2', bits: 5, value: rs2 },
        { label: 'rs1', bits: 5, value: rs1 },
        { label: 'funct3', bits: 3, value: meta.funct3 },
        { label: 'imm[4:1,11]', bits: 5, value: (imm4_1 << 1) | imm11 },
        { label: 'opcode', bits: 7, value: meta.opcode },
      ];
      return {
        assembly: `${bInstruction} x${rs1}, x${rs2}, ${bOffset}`,
        fields,
        word,
      };
    }

    if (format === 'J') {
      const jMeta = J_META['jal'];
      const jRdVal = maskBits(parseRegisterValue(jRd), 5);
      const jImm20    = (jOffset >> 20) & 1;
      const jImm10_1  = (jOffset >> 1) & 0x3FF;
      const jImm11    = (jOffset >> 11) & 1;
      const jImm19_12 = (jOffset >> 12) & 0xFF;
      const jWord =
        (jImm20 << 31) |
        (jImm10_1 << 21) |
        (jImm11 << 20) |
        (jImm19_12 << 12) |
        (jRdVal << 7) |
        jMeta.opcode;
      const jFields: BitField[] = [
        { label: 'imm[20,10:1,11,19:12]', bits: 20, value: (jImm20 << 19) | (jImm10_1 << 9) | (jImm11 << 8) | jImm19_12 },
        { label: 'rd', bits: 5, value: jRdVal },
        { label: 'opcode', bits: 7, value: jMeta.opcode },
      ];
      return {
        assembly: `jal x${jRdVal}, ${jOffset}`,
        fields: jFields,
        word: jWord,
      };
    }

  }, [format, bInstruction, bOffset, bRs1, bRs2, iImmediate, iInstruction, iRd, iRs1, jOffset, jRd, rInstruction, rRd, rRs1, rRs2, sImmediate, sInstruction, sRs1, sRs2]);

  function resetDecoderAnswers(nextIndex: number) {
    setDecodeIndex(nextIndex);
    setDecodeFormat('');
    setDecodeMnemonic('');
    setDecodeRd('');
    setDecodeRs1('');
    setDecodeRs2('');
    setDecodeImmediate('');
    setDecodeChecked(false);
    setDecodeCorrect(false);
  }

  function clearDecodeFeedback() {
    setDecodeChecked(false);
    setDecodeCorrect(false);
  }

  function checkDecodeAnswer() {
    const rdValue = decodeRd === '' ? NaN : Number(decodeRd);
    const rs1Value = decodeRs1 === '' ? NaN : Number(decodeRs1);
    const rs2Value = decodeRs2 === '' ? NaN : Number(decodeRs2);
    const immValue = decodeImmediate === '' ? NaN : Number(decodeImmediate);

    const formatOk = decodeFormat === activeDecode.format;
    const mnemonicOk = decodeMnemonic === activeDecode.mnemonic;
    const rdOk = activeDecode.rd == null ? true : rdValue === activeDecode.rd;
    const rs1Ok = activeDecode.rs1 == null ? true : rs1Value === activeDecode.rs1;
    const rs2Ok = activeDecode.rs2 == null ? true : rs2Value === activeDecode.rs2;
    const immOk = activeDecode.immediate == null ? true : immValue === activeDecode.immediate;

    const allOk = formatOk && mnemonicOk && rdOk && rs1Ok && rs2Ok && immOk;
    setDecodeChecked(true);
    setDecodeCorrect(allOk);
  }

  return (
    <div className="space-y-6">
      <Card variant="simulation" title="Instruction Encoder Workbench">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Build an instruction by selecting fields and see the 32-bit layout and hex update instantly.
          </p>

          <div className="flex flex-wrap gap-2">
            {(['R', 'I', 'S', 'B', 'J'] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFormat(kind)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  format === kind ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                }`}
              >
                {kind}-format
              </button>
            ))}
          </div>

          {format === 'R' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="text-sm text-gray-700">
                Instruction
                <select value={rInstruction} onChange={(e) => setRInstruction(e.target.value as RInstruction)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                  <option value="add">add</option>
                  <option value="sub">sub</option>
                  <option value="sll">sll</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">
                rd
                <input
                  type="text"
                  inputMode="numeric"
                  value={rRd}
                  onChange={(e) => setRRd(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                rs1
                <input
                  type="text"
                  inputMode="numeric"
                  value={rRs1}
                  onChange={(e) => setRRs1(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                rs2
                <input
                  type="text"
                  inputMode="numeric"
                  value={rRs2}
                  onChange={(e) => setRRs2(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
          )}

          {format === 'I' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="text-sm text-gray-700">
                Instruction
                <select
                  value={iInstruction}
                  onChange={(e) => {
                    const next = e.target.value as IInstruction;
                    setIInstruction(next);
                    if (next === 'slli') {
                      setIImmediate(Math.max(0, Math.min(31, iImmediate)));
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="addi">addi</option>
                  <option value="lw">lw</option>
                  <option value="slli">slli</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">
                rd
                <input
                  type="text"
                  inputMode="numeric"
                  value={iRd}
                  onChange={(e) => setIRd(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                rs1
                <input
                  type="text"
                  inputMode="numeric"
                  value={iRs1}
                  onChange={(e) => setIRs1(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                {I_META[iInstruction].immediateLabel}
                <input
                  type="number"
                  min={I_META[iInstruction].immediateMin}
                  max={I_META[iInstruction].immediateMax}
                  value={iImmediate}
                  onChange={(e) => setIImmediate(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
          )}

          {format === 'S' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="text-sm text-gray-700">
                Instruction
                <select value={sInstruction} onChange={(e) => setSInstruction(e.target.value as SInstruction)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                  <option value="sw">sw</option>
                  <option value="sh">sh</option>
                  <option value="sb">sb</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">
                rs2 (data)
                <input
                  type="text"
                  inputMode="numeric"
                  value={sRs2}
                  onChange={(e) => setSRs2(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                rs1 (base)
                <input
                  type="text"
                  inputMode="numeric"
                  value={sRs1}
                  onChange={(e) => setSRs1(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                offset
                <input type="number" min={-2048} max={2047} value={sImmediate} onChange={(e) => setSImmediate(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
            </div>
          )}

          {format === 'B' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="text-sm text-gray-700">
                Instruction
                <select value={bInstruction} onChange={(e) => setBInstruction(e.target.value as BInstruction)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                  <option value="beq">beq</option>
                  <option value="bne">bne</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">
                rs1
                <input
                  type="text"
                  inputMode="numeric"
                  value={bRs1}
                  onChange={(e) => setBRs1(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                rs2
                <input
                  type="text"
                  inputMode="numeric"
                  value={bRs2}
                  onChange={(e) => setBRs2(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                offset (bytes, even)
                <input type="number" step={2} min={-4094} max={4094} value={bOffset} onChange={(e) => setBOffset(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
            </div>
          )}

          {format === 'J' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="text-sm text-gray-700">
                Instruction
                <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" disabled>
                  <option value="jal">jal</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">
                rd
                <input
                  type="text"
                  inputMode="numeric"
                  value={jRd}
                  onChange={(e) => setJRd(sanitizeRegisterInput(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                offset (bytes, even)
                <input type="number" step={2} min={-1048574} max={1048574} value={jOffset} onChange={(e) => setJOffset(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
            </div>
          )}



          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Assembly Preview</p>
            <p className="mt-1 font-mono text-sm text-indigo-900">{encoderResult.assembly}</p>
          </div>

          <FieldRow fields={encoderResult.fields} />

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Final Encoding</p>
            <p className="mt-1 font-mono text-sm text-gray-900">{groupNibbleBits(encoderResult.word)}</p>
            <p className="mt-1 font-mono text-base font-semibold text-gray-900">{toHex32(encoderResult.word)}</p>
          </div>
        </div>
      </Card>

      <Card variant="simulation" title="Reverse Decoder Challenge">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Decode the machine code into its assembly fields.
          </p>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Machine Code Prompt</p>
            <p className="mt-1 font-mono text-base font-semibold text-gray-900">{toHex32(activeDecode.word)}</p>
            <p className="mt-1 font-mono text-sm text-gray-900">{groupNibbleBits(activeDecode.word)}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-sm text-gray-700">
              Format
              <select
                value={decodeFormat}
                onChange={(e) => {
                  setDecodeFormat(e.target.value);
                  clearDecodeFeedback();
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Select format</option>
                <option value="R">R</option>
                <option value="I">I</option>
                <option value="S">S</option>
                <option value="B">B</option>
                <option value="J">J</option>
              </select>
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">
              Mnemonic
              <select
                value={decodeMnemonic}
                onChange={(e) => {
                  setDecodeMnemonic(e.target.value);
                  clearDecodeFeedback();
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Select mnemonic</option>
                <option value="add">add</option>
                <option value="sub">sub</option>
                <option value="sll">sll</option>
                <option value="addi">addi</option>
                <option value="lw">lw</option>
                <option value="slli">slli</option>
                <option value="sw">sw</option>
                <option value="sh">sh</option>
                <option value="sb">sb</option>
                <option value="beq">beq</option>
                <option value="bne">bne</option>
                <option value="jal">jal</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {activeDecode.rd != null && (
              <label className="text-sm text-gray-700">
                rd
                <input
                  type="number"
                  min={0}
                  max={31}
                  value={decodeRd}
                  onChange={(e) => {
                    setDecodeRd(e.target.value);
                    clearDecodeFeedback();
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            )}
            {activeDecode.rs1 != null && (
              <label className="text-sm text-gray-700">
                rs1
                <input
                  type="number"
                  min={0}
                  max={31}
                  value={decodeRs1}
                  onChange={(e) => {
                    setDecodeRs1(e.target.value);
                    clearDecodeFeedback();
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            )}
            {activeDecode.rs2 != null && (
              <label className="text-sm text-gray-700">
                rs2
                <input
                  type="number"
                  min={0}
                  max={31}
                  value={decodeRs2}
                  onChange={(e) => {
                    setDecodeRs2(e.target.value);
                    clearDecodeFeedback();
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            )}
            {activeDecode.immediate != null && (
              <label className="text-sm text-gray-700">
                immediate/offset
                <input
                  type="number"
                  min={-1048576}
                  max={1048574}
                  value={decodeImmediate}
                  onChange={(e) => {
                    setDecodeImmediate(e.target.value);
                    clearDecodeFeedback();
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <button
                type="button"
                onClick={checkDecodeAnswer}
                disabled={!decodeRequiredComplete}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Check decode
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => resetDecoderAnswers((decodeIndex - 1 + decodeCases.length) % decodeCases.length)}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
            >
              Previous challenge
            </button>
            <button
              type="button"
              onClick={() => resetDecoderAnswers((decodeIndex + 1) % decodeCases.length)}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
            >
              Next challenge
            </button>
            </div>
          </div>

          {decodeChecked && decodeRequiredComplete && (
            <div className={`rounded-xl border px-4 py-3 ${decodeCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              {decodeCorrect ? (
                <p className="text-sm font-semibold text-green-800">Correct! {activeDecode.assembly}</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-800">Not quite. Expected decode:</p>
                  <p className="font-mono text-sm text-red-900">{activeDecode.assembly}</p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Challenge {decodeIndex + 1} of {decodeCases.length}</p>
            <p className="mt-1 text-sm text-gray-700">Decode format, mnemonic, and operand fields from the prompt above.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}