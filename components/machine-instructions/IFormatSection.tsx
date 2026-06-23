'use client';
import React, { useState } from 'react';
import { Card } from '../Card';
import { InstructionQuestion } from './InstructionQuestion';

export function IFormatSection() {
  return (
    <div className="space-y-6">
      <Card variant="concept" title="I-Format Instructions">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="font-semibold text-blue-900 mb-2">Structure (32 bits)</p>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-blue-800">| immediate (12) | rs1 (5) | funct3 (3) | rd (5) | opcode (7) |</p>
            <p className="text-gray-600">← bits 31:20 →|← 19:15 →|← 14:12 →|← 11:7 →|← 6:0 →</p>
          </div>
        </div>
      </Card>

      <Card variant="worked" title="Worked Example">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
          <p className="font-mono font-semibold text-sm mb-3">lw x7, 120(x18)</p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Step 1: Identify the fields</p>
              <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                <li>rd = x7 = 7 (destination register)</li>
                <li>rs1 = x18 = 18 (base address register)</li>
                <li>immediate = 120 (offset in bytes)</li>
                <li>This is a Load Word: opcode=3, funct3=2</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Step 2: Convert immediate to 12-bit binary</p>
              <p className="font-mono text-gray-700 mt-1">
                120<span className="sub">10</span> = 0111 1000<span className="sub">2</span> = 0x078
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Step 3: Layout in binary (32-bit)</p>
              <div className="font-mono text-xs bg-white p-2 rounded border border-gray-300 mt-1 overflow-x-auto">
                <p className="text-gray-600">immediate (12) | rs1 (5) | funct3 (3) | rd (5) | opcode (7)</p>
                <p className="text-gray-900 font-bold">0000 0111 1000 | 10010 | 010 | 00111 | 0000011</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Step 4: Convert to hexadecimal</p>
              <p className="font-mono text-gray-700 mt-1">
                0000 0111 1000 1001 0010 0000 0111 0011<span className="sub">2</span> = 07892073<span className="sub">16</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="practice" title="Practice Questions">
        <div className="space-y-6">
          <InstructionQuestion
            instruction="addi x5, x18, 5"
            format="I-format"
            expectedValues={{
              immediate: 5,
              rs1: 18,
              funct3: 0,
              rd: 5,
              opcode: 19,
              hex: '00590293'
            }}
            hints={{
              immediate: "Convert 5 to 12-bit: 000000000101",
              rs1: "Source register is x18",
              funct3: "ADDI uses funct3=0",
              rd: "Destination is x5",
              opcode: "ADDI uses opcode=19 (0010011)"
            }}
          />

          <InstructionQuestion
            instruction="slli x6, x19, 2"
            format="I-format"
            expectedValues={{
              immediate: 2,
              rs1: 19,
              funct3: 1,
              rd: 6,
              opcode: 19,
              hex: '00295313'
            }}
            hints={{
              immediate: "Shift amount shamt=2 stored as 000000000010",
              rs1: "Register to shift is x19",
              funct3: "SLLI uses funct3=1",
              rd: "Destination is x6",
              opcode: "SLLI uses opcode=19 (shift immediate operations)"
            }}
          />

          <InstructionQuestion
            instruction="lw x7, 120(x18)"
            format="I-format"
            expectedValues={{
              immediate: 120,
              rs1: 18,
              funct3: 2,
              rd: 7,
              opcode: 3,
              hex: '07892383'
            }}
            hints={{
              immediate: "Offset 120 in decimal: convert to 12-bit binary, then hex",
              rs1: "Base address register is x18",
              funct3: "LW (Load Word) uses funct3=2",
              rd: "Destination is x7",
              opcode: "All load instructions use opcode=3 (0000011)"
            }}
          />
        </div>
      </Card>
    </div>
  );
}
