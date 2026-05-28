'use client';
import React, { useState } from 'react';
import { Card } from './Card';
import { InfoNote } from './InfoNote';
import { PracticeQuestion } from './PracticeQuestion';

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

export function TabInterpreting() {
  return (
    <div>
      {/* Binary */}
      <Card variant="concept" title="Binary — Base 2">
        <p className="text-sm text-gray-700 leading-relaxed">
          Binary is a number system with base 2. Only two digits are used: 0 and 1. Each digit is called a <strong>bit</strong>.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          Binary numbers are denoted with the prefix <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0b</code> or <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0B</code>, or by the subscript 2. For example, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0b11001</code> or <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">11001₂</code>.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          To understand a binary number, associate each bit with a power of 2, starting from the rightmost bit (least significant). The rightmost bit is 2⁰ = 1, the next is 2¹ = 2, then 2² = 4, and so on.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Example:</strong> <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">11001₂</code> = (1 × 2⁴) + (1 × 2³) + (0 × 2²) + (0 × 2¹) + (1 × 2⁰) = 16 + 8 + 1 = 25₁₀
        </p>
      </Card>

      {/* Octal */}
      <Card variant="concept" title="Octal — Base 8">
        <p className="text-sm text-gray-700 leading-relaxed">
          Octal is a base-8 number system. Eight digits are used: 0, 1, 2, 3, 4, 5, 6, 7.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          Octal numbers are denoted with the prefix <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0o</code> or <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0O</code>, or by the subscript 8. For example, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0o7526</code> or <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">7526₈</code>.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          To interpret an octal number, associate each digit with a power of 8, starting from the rightmost digit.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Example:</strong> <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">7526₈</code> = (7 × 8³) + (5 × 8²) + (2 × 8¹) + (6 × 8⁰) = 3584 + 320 + 16 + 6 = 3926₁₀
        </p>
      </Card>

      {/* Hexadecimal */}
      <Card variant="concept" title="Hexadecimal — Base 16">
        <p className="text-sm text-gray-700 leading-relaxed">
          Hexadecimal is a base-16 number system. Sixteen digits are used: 0–9, A, B, C, D, E, F, where A=10, B=11, C=12, D=13, E=14, F=15.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          Hexadecimal numbers are denoted with the prefix <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0x</code> or <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0X</code>, or by the subscript 16. For example, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0xA21F</code> or <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">A21F₁₆</code>.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          To interpret a hexadecimal number, associate each digit with a power of 16, starting from the rightmost digit.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Example:</strong> <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">A21F₁₆</code> = (10 × 16³) + (2 × 16²) + (1 × 16¹) + (15 × 16⁰) = 40960 + 512 + 16 + 15 = 41503₁₀
        </p>
        <InfoNote>
          Octal groups bits into threes (8 = 2³); hexadecimal groups bits into fours (16 = 2⁴). Both are compact shorthand for binary — no conversion arithmetic needed, only grouping.
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
          { label: 'D', text: '5EF4', wrongExplanation: 'F in hex = 1111; check your 4-bit groups.' },
        ]}
        correctLabel="C"
        correctExplanation="Group into sets: 0101 = 5, 1110 = E, 1101 = D, 0100 = 4 → 5ED4."
        wrongExplanation="Group binary into 4-bit sets from left to right, then convert each group to its hex digit."
      />

      {/* Practice Q2 */}
      <PracticeQuestion
        title="Question 2 of 3 — octal to decimal"
        prompt={<>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">352₈</code> in decimal?</>}
        options={[
          { label: 'A', text: '226', wrongExplanation: '226 in octal is 3 × 64 + 5 × 8 + 2, but octal 352 has different digit positions.' },
          { label: 'B', text: '234' },
          { label: 'C', text: '298', wrongExplanation: 'Check: (3 × 8²) + (5 × 8¹) + (2 × 8⁰) = 192 + 40 + 2 = 234, not 298.' },
          { label: 'D', text: '352', wrongExplanation: 'That is the octal representation; convert using powers of 8 to find the decimal value.' },
        ]}
        correctLabel="B"
        correctExplanation="(3 × 8²) + (5 × 8¹) + (2 × 8⁰) = (3 × 64) + (5 × 8) + 2 = 192 + 40 + 2 = 234₁₀"
        wrongExplanation="Use powers of 8: multiply each digit by 8 raised to its position, starting from the right."
      />

      {/* Practice Q3 */}
      <PracticeQuestion
        title="Question 3 of 3 — hex to decimal"
        prompt={<>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">2C₁₆</code> in decimal?</>}
        options={[
          { label: 'A', text: '32' },
          { label: 'B', text: '44', wrongExplanation: '(2 × 16) + C is not 44; remember C = 12 in decimal.' },
          { label: 'C', text: '212', wrongExplanation: 'That would be if you treated 2C as if it were decimal; convert using hex values.' },
          { label: 'D', text: '28', wrongExplanation: '(2 × 16) + 12 = 32 + 12 = 44, not 28.' },
        ]}
        correctLabel="A"
        correctExplanation="(2 × 16¹) + (C × 16⁰) = (2 × 16) + (12 × 1) = 32 + 12 = 44₁₀"
        wrongExplanation="Multiply each digit by its power of 16. Remember: A=10, B=11, C=12, D=13, E=14, F=15."
      />
    </div>
  );
}
