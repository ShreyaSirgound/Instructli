'use client';
import React, { useState } from 'react';
import { Card } from '../Card';
import { InstructionQuestion } from './InstructionQuestion';

export function SFormatSection() {
  return (
    <div className="space-y-6">
      <Card variant="concept" title="S-Format Instructions">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="font-medium text-blue-900 mb-2">Structure (32 bits)</p>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-blue-800">| imm[11:5] (7) | rs2 (5) | rs1 (5) | funct3 (3) | imm[4:0] (5) | opcode (7) |</p>
            <p className="text-gray-600">← bits 31:25 →|← 24:20 →|← 19:15 →|← 14:12 →|← 11:7 →|← 6:0 →</p>
          </div>
        </div>
      </Card>

      <Card variant="worked" title="Worked Example">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
          <p className="font-mono font-medium text-sm mb-3">sw x7, 120(x18)</p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900">Step 1: Identify the fields</p>
              <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                <li>rs2 = x7 = 7 (value to store - note: not rd!)</li>
                <li>rs1 = x18 = 18 (base address register)</li>
                <li>immediate = 120 (offset in bytes)</li>
                <li>This is a Store Word: opcode=35, funct3=2</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900">Step 2: Split the 12-bit immediate</p>
              <p className="font-mono text-gray-700 mt-1">
                120<span className="sub">10</span> = 0111 1000<span className="sub">2</span> = 0x078
              </p>
              <p className="font-mono text-gray-700 mt-1">
                Split: imm[11:5] = 0000011 (bits 11-5), imm[4:0] = 01000 (bits 4-0)
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Step 3: Layout in binary (32-bit)</p>
              <div className="font-mono text-xs bg-white p-2 rounded border border-gray-300 mt-1 overflow-x-auto">
                <p className="text-gray-600">imm[11:5] (7) | rs2 (5) | rs1 (5) | funct3 (3) | imm[4:0] (5) | opcode (7)</p>
                <p className="text-gray-900 font-bold">0000011 | 00111 | 10010 | 010 | 01000 | 0100011</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">Step 4: Convert to hexadecimal</p>
              <p className="font-mono text-gray-700 mt-1">
                0000 0110 0111 1001 0010 0100 0100 0011<span className="sub">2</span> = 067924A3<span className="sub">16</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="practice" title="Practice Questions">
        <div className="space-y-6">
          <InstructionQuestion
            instruction="sw x7, 120(x18)"
            format="S-format"
            expectedValues={{
              immediateUpper: 3,  // bits 11:5 of 120
              rs2: 7,
              rs1: 18,
              funct3: 2,
              immediateLower: 8,  // bits 4:0 of 120
              opcode: 35,
              hex: '067924A3'
            }}
            hints={{
              immediateUpper: "120 = 0x78: upper bits [11:5] = 0000011 (3 in decimal)",
              rs2: "Value to store is in x7",
              rs1: "Base address register is x18",
              funct3: "SW (Store Word) uses funct3=2",
              immediateLower: "Lower bits [4:0] of 120 = 01000 (8 in decimal)",
              opcode: "All store instructions use opcode=35 (0100011)"
            }}
          />

          <InstructionQuestion
            instruction="sb x12, 4(x5)"
            format="S-format"
            expectedValues={{
              immediateUpper: 0,  // bits 11:5 of 4
              rs2: 12,
              rs1: 5,
              funct3: 0,
              immediateLower: 4,  // bits 4:0 of 4
              opcode: 35,
              hex: '00C28223'
            }}
            hints={{
              immediateUpper: "4 = 0x004: upper bits [11:5] = 0000000 (0)",
              rs2: "Byte to store is in x12",
              rs1: "Base address register is x5",
              funct3: "SB (Store Byte) uses funct3=0",
              immediateLower: "Lower bits [4:0] of 4 = 00100 (4 in decimal)",
              opcode: "opcode=35 for all store instructions"
            }}
          />

          <InstructionQuestion
            instruction="sh x15, 32(x8)"
            format="S-format"
            expectedValues={{
              immediateUpper: 1,  // bits 11:5 of 32
              rs2: 15,
              rs1: 8,
              funct3: 1,
              immediateLower: 0,  // bits 4:0 of 32
              opcode: 35,
              hex: '00F41823'
            }}
            hints={{
              immediateUpper: "32 = 0x020: upper bits [11:5] = 0000001 (1)",
              rs2: "Half-word to store is in x15",
              rs1: "Base address register is x8",
              funct3: "SH (Store Half-word) uses funct3=1",
              immediateLower: "Lower bits [4:0] of 32 = 00000 (0)",
              opcode: "opcode=35 for all store instructions"
            }}
          />
        </div>
      </Card>
    </div>
  );
}
