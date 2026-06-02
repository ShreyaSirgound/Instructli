'use client';
import React, { useState } from 'react';
import { Card } from '../Card';
import { InfoNote } from '../InfoNote';
import { PracticeQuestion } from '../PracticeQuestion';

const N = 8;

function BaseConverter() {
  const [bits, setBits] = useState<number[]>([0, 1, 0, 1, 1, 0, 1, 0]);

  function toggle(i: number) {
    setBits((prev) => prev.map((b, j) => (j === i ? b ^ 1 : b)));
  }

  const value = bits.reduce((acc, b, i) => acc + b * Math.pow(2, N - 1 - i), 0);
  const weights = [128, 64, 32, 16, 8, 4, 2, 1];

  return (
    <div>
      {/* Weight labels */}
      <div className="flex gap-2 mb-1 ml-[1px]">
        {weights.map((w) => (
          <div key={w} className="w-10 text-center text-xs text-gray-400">{w}</div>
        ))}
      </div>

      {/* Bit toggles */}
      <div className="flex gap-2 mb-5">
        {bits.map((b, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-10 h-10 rounded-xl border text-sm font-mono font-semibold transition-all duration-150"
            style={
              b
                ? { backgroundColor: '#E6F1FB', borderColor: '#85B7EB', color: '#195FA5' }
                : { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#374151' }
            }
          >
            {b}
          </button>
        ))}
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Decimal',     val: value.toString() },
          { label: 'Octal',       val: value.toString(8).toUpperCase() },
          { label: 'Hexadecimal', val: value.toString(16).toUpperCase() },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-semibold text-gray-900 font-mono">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabNumberSystems() {
  return (
    <div>
      {/* Concept */}
      <Card variant="concept" title="Unsigned binary integers">
        <p className="text-sm text-gray-700 leading-relaxed">
          Every bit position has a weight that is a power of 2. The rightmost bit is 2⁰ = 1, the
          next is 2¹ = 2, and so on. To convert to decimal, sum the weights of all positions that
          hold a 1.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          An n-bit unsigned integer can represent values from 0 to 2ⁿ − 1. With 8 bits: 0 to 255.
        </p>
        <InfoNote>
          Octal groups bits into threes (8 = 2³); hexadecimal groups bits into fours (16 = 2⁴).
          Both are compact shorthand for binary — no conversion arithmetic needed, only grouping.
        </InfoNote>
      </Card>

      {/* Simulation */}
      <Card variant="simulation" title="Live base converter">
        <p className="text-sm text-gray-700 mb-4">
          Click any bit to toggle it. The decimal, octal, and hex representations update instantly.
        </p>
        <BaseConverter />
      </Card>

      {/* Practice Q1 */}
      <PracticeQuestion
        title="Question 1 of 3 — binary to hex"
        prompt={<>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0101 1110 1101 0100</code> in hexadecimal?</>}
        options={[
          { label: 'A', text: '5CD4', wrongExplanation: 'C in hex is 1100, so check the second group of four bits: 1110 should become E, not C.' },
          { label: 'B', text: '6ED4', wrongExplanation: '6 is not represented as 0101 — recheck the first 4-bit group and its hex value.' },
          { label: 'C', text: '5ED4' },
          { label: 'D', text: '5EF4', wrongExplanation: 'F in hex = 1111; check your 4-bit groups and carry.' },
        ]}
        correctLabel="C"
        correctExplanation="Group into sets: 0101 = 5, 1110 = E, 1101 = D, 0100 = 4 → 5ED4."
        wrongExplanation="Re-group carefully into 4-bit sets from left to right."
      />

      {/* Practice Q2 */}
      <PracticeQuestion
        title="Question 2 of 3 — binary to decimal"
        prompt={<>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1011 1110</code> as an unsigned decimal number?</>}
        options={[
          { label: 'A', text: '176', wrongExplanation: '176 in binary is 1011 0000 — compare that with 1011 1110 and re-sum the weights.' },
          { label: 'B', text: '181', wrongExplanation: '181 in binary is 1011 0101 — your current bits add up differently, especially the least significant bits.' },
          { label: 'C', text: '190' },
          { label: 'D', text: '191', wrongExplanation: '191 in binary is 1011 1111 — the rightmost bit is 1 there, but your number ends in 0.' },
        ]}
        correctLabel="C"
        correctExplanation="128 + 32 + 16 + 8 + 4 + 2 = 190. The rightmost bit is 0 so we don't add 1."
        wrongExplanation="Sum the weights of every bit that is 1."
      />

      {/* Practice Q3 */}
      <PracticeQuestion
        title="Question 3 of 3 — octal to hex"
        prompt="Convert 35 (octal) to hexadecimal. Hint: expand each octal digit into 3 bits, then regroup into sets."
        options={[
          { label: 'A', text: '1C' },
          { label: 'B', text: '1D' },
          { label: 'C', text: '2D' },
          { label: 'D', text: '10' },
        ]}
        correctLabel="B"
        correctExplanation="35₈ → 011 101 → pad to 8 bits → 0001 1101 → regroup into sets → 0001 = 1, 1101 = D → 1D₁₆."
        wrongExplanation="Convert 3 and 5 from octal into binary, pad to two extra bits so you have 8 bits, regroup into 4-bit hex digits, then convert each group."
      />
    </div>
  );
}