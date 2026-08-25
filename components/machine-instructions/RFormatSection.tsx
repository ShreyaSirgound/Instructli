'use client';

import { Card } from '../Card';
import { InstructionQuestion } from './InstructionQuestion';

export function RFormatSection() {
  return (
    <div className="space-y-6">
      <Card variant="concept" title="R-Format Instructions">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="font-medium text-blue-900 mb-2">Structure (32 bits)</p>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-blue-800">| funct7 (7) | rs2 (5) | rs1 (5) | funct3 (3) | rd (5) | opcode (7) |</p>
            <p className="text-gray-600">← bits 31:25 →|← 24:20 →|← 19:15 →|← 14:12 →|← 11:7 →|← 6:0 →</p>
          </div>
        </div>
      </Card>

      <Card variant="worked" title="Worked Example">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
          <p className="font-mono font-medium text-sm mb-3">add x9, x20, x21</p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900">Step 1: Identify the fields</p>
              <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                <li>rd = x9 = 9 (destination register)</li>
                <li>rs1 = x20 = 20 (first source register)</li>
                <li>rs2 = x21 = 21 (second source register)</li>
                <li>This is an ADD instruction: funct7=0, funct3=0, opcode=51</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900">Step 2: Layout in binary (32-bit)</p>
              <div className="font-mono text-xs bg-white p-2 rounded border border-gray-300 mt-1 overflow-x-auto">
                <p className="text-gray-600">funct7 (7 bits) | rs2 (5) | rs1 (5) | funct3 (3) | rd (5) | opcode (7)</p>
                <p className="text-gray-900 font-bold">0000000 | 10101 | 10100 | 000 | 01001 | 0110011</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">Step 3: Convert to hexadecimal</p>
              <p className="font-mono text-gray-700 mt-1">
                0000 0001 0101 1010 0000 0100 1011 0011<span className="sub">2</span> = 015A04B3<span className="sub">16</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="practice" title="Practice Questions">
        <div className="space-y-6">
          <InstructionQuestion
            instruction="sub x7, x5, x22"
            format="R-format"
            expectedValues={{
              funct7: 32,
              rs2: 22,
              rs1: 5,
              funct3: 0,
              rd: 7,
              opcode: 51,
              hex: '416283B3'
            }}
            hints={{
              funct7: "SUB uses funct7=32 (0100000), ADD uses 0",
              rs2: "Second register is x22",
              rs1: "First register is x5",
              funct3: "Both ADD and SUB use funct3=0",
              rd: "Destination is x7",
              opcode: "All arithmetic operations use opcode=51 (0110011)"
            }}
          />

          <InstructionQuestion
            instruction="sll x6, x19, x2"
            format="R-format"
            expectedValues={{
              funct7: 0,
              rs2: 2,
              rs1: 19,
              funct3: 1,
              rd: 6,
              opcode: 51,
              hex: '0021343B'
            }}
            hints={{
              funct7: "Shift operations use funct7=0",
              rs2: "The shift amount register is x2",
              rs1: "The register to shift is x19",
              funct3: "SLL (shift left logical) uses funct3=1",
              rd: "Destination is x6",
              opcode: "opcode=51 for all R-type instructions"
            }}
          />
        </div>
      </Card>
    </div>
  );
}
