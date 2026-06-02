'use client';
import React, { useState } from 'react';
import { Card } from './Card';
import { InfoNote } from './InfoNote';
import { PracticeQuestion } from './PracticeQuestion';
import { colors } from './types';

const N = 8;

function toUnsigned(bits: number[]) {
  return bits.reduce((acc, b, i) => acc + b * Math.pow(2, N - 1 - i), 0);
}
function toSigned(bits: number[]) {
  const u = toUnsigned(bits);
  return bits[0] ? u - (1 << N) : u;
}
function computeCarryOut(bA: number[], bB: number[]) {
  let c = 0;
  for (let i = N - 1; i >= 0; i--) c = Math.floor((bA[i] + bB[i] + c) / 2);
  return c;
}
function computeCarries(bA: number[], bB: number[]) {
  const c = new Array(N).fill(0);
  let carry = 0;
  for (let i = N - 1; i >= 0; i--) {
    const s = bA[i] + bB[i] + carry;
    carry = s >= 2 ? 1 : 0;
    if (i > 0) c[i] = carry;
  }
  return c;
}
function computeResult(bA: number[], bB: number[]) {
  const r = new Array(N).fill(0);
  let carry = 0;
  for (let i = N - 1; i >= 0; i--) {
    const s = bA[i] + bB[i] + carry;
    r[i] = s % 2;
    carry = s >= 2 ? 1 : 0;
  }
  return r;
}

function BitCell({
  value, type, onClick,
}: { value: number; type: 'carry' | 'input' | 'result'; onClick?: () => void }) {
  const base = 'flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-mono font-semibold transition-all duration-150 select-none';
  const styles: Record<string, string> = {
    carry:  'border-green-200 bg-green-50 text-green-800 text-xs',
    result: 'border-purple-200 bg-purple-50 text-purple-800',
    input:  'cursor-pointer border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-400 hover:bg-white',
  };
  return (
    <div className={`${base} ${styles[type]}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      {value}
    </div>
  );
}

function InteractiveAdder() {
  const [bA, setBA] = useState<number[]>([0, 1, 1, 1, 1, 1, 1, 1]);
  const [bB, setBB] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 1]);

  const carries = computeCarries(bA, bB);
  const result  = computeResult(bA, bB);
  const uA = toUnsigned(bA), uB = toUnsigned(bB), uR = toUnsigned(result);
  const sA = toSigned(bA),   sB = toSigned(bB),   sR = toSigned(result);
  const co = computeCarryOut(bA, bB);
  const overflow = (sA >= 0 && sB >= 0 && sR < 0) || (sA < 0 && sB < 0 && sR >= 0);

  function toggleA(i: number) { setBA((p) => p.map((b, j) => j === i ? b ^ 1 : b)); }
  function toggleB(i: number) { setBB((p) => p.map((b, j) => j === i ? b ^ 1 : b)); }

  const statCards = [
    { label: 'A (decimal)',      main: uA, sub: `signed: ${sA}` },
    { label: 'B (decimal)',      main: uB, sub: `signed: ${sB}` },
    { label: 'Result (decimal)', main: uR, sub: `signed: ${sR}` },
    { label: 'Carry out',        main: co, sub: 'out of MSB' },
  ];

  return (
    <div>
      <p className="text-sm text-gray-700 mb-4">
        Click any bit in row A or B to toggle it. Carries and result update live.
      </p>

      {/* Grid */}
      <div className="space-y-2 mb-5">
        {/* Carry row */}
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-right text-xs text-gray-400">Carry</span>
          {carries.map((v, i) => <BitCell key={i} value={v} type="carry" />)}
        </div>
        {/* A row */}
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-right text-xs text-gray-500">A</span>
          {bA.map((v, i) => <BitCell key={i} value={v} type="input" onClick={() => toggleA(i)} />)}
        </div>
        {/* Plus + B row */}
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-right text-lg text-gray-300">+</span>
          <span className="shrink-0 text-right text-xs text-gray-500">B</span>
          {bB.map((v, i) => <BitCell key={i} value={v} type="input" onClick={() => toggleB(i)} />)}
        </div>
        {/* Divider */}
        <div className=" h-px bg-gray-200" />
        {/* Result row */}
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-right text-xs text-gray-500">Result</span>
          {result.map((v, i) => <BitCell key={i} value={v} type="result" />)}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {statCards.map(({ label, main, sub }) => (
          <div key={label} className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-semibold text-gray-900">{main}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Overflow banner */}
      {overflow ? (
        <div className="rounded-2xl px-5 py-3 text-sm flex items-center gap-2" style={{ backgroundColor: colors.red.light, color: colors.red.dark }}>
          ⚠ Signed overflow — the result's sign is wrong. The true sum can't fit in 8 bits.
        </div>
      ) : (
        <div className="rounded-2xl px-5 py-3 text-sm flex items-center gap-2" style={{ backgroundColor: colors.green.light, color: colors.green.dark }}>
          ✓ No signed overflow — the result is correct.
        </div>
      )}
    </div>
  );
}

export function TabAdditionSubtraction() {
  return (
    <div>
      {/* Addition Rules */}
      <Card variant="concept" title="Binary addition rules">
        <p className="text-sm text-gray-700 leading-relaxed">
          Binary addition works column-by-column from right to left, exactly like decimal addition. At each position you sum the two bits plus any carry-in from the column to the right.
        </p>
        <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 font-mono text-sm text-gray-800 space-y-1.5">
          <div>0 + 0 = 0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (no carry)</div>
          <div>0 + 1 = 1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (no carry)</div>
          <div>1 + 1 = 10 &nbsp;&nbsp; → &nbsp;write 0, carry 1</div>
          <div>1 + 1 + 1 = 11 → &nbsp;write 1, carry 1</div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          One unique feature: because binary numbers use a fixed number of bits, any extra bits that overflow are simply discarded.
        </p>
        <InfoNote>
          When adding two n-bit numbers, the result may require n+1 bits. The extra bit is dropped, which is why carry-out and overflow are different concepts.
        </InfoNote>
      </Card>

      {/* Subtraction */}
      <Card variant="concept" title="Binary subtraction">
        <p className="text-sm text-gray-700 leading-relaxed">
          To subtract two numbers in binary, <strong>negate the second number and then add.</strong> This avoids error-prone borrowing and works well with two's complement.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Example:</strong> To compute 11001 − 10, convert to 11001 + (−10).
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          First, find −10 in two's complement:
        </p>
        <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 font-mono text-sm text-gray-900">
          <div>10 = 01010</div>
          <div>invert → 10101</div>
          <div>add 1 → 10110</div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          Then add the values row by row:
        </p>
        <pre className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 font-mono text-sm text-gray-900 whitespace-pre-wrap">
  11001
+ 10110
-------
 101111
(drop carry) 01111
        </pre>
        <InfoNote>
          Two's complement makes subtraction as simple as addition, which is why it is the standard in modern computers.
        </InfoNote>
      </Card>

      {/* Interactive Adder */}
      <Card variant="simulation" title="Interactive 8-bit adder">
        <InteractiveAdder />
      </Card>

      {/* Practice Q1 */}
      <PracticeQuestion
        title="Question 1 of 3 — binary addition"
        prompt={<>Add <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0011 1010</code> + <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0001 0110</code>. What is the result?</>}
        options={[
          { label: 'A', text: '0101 0000', wrongExplanation: 'Check your carry propagation; 1010 + 0110 in the rightmost nibble produces a carry.' },
          { label: 'B', text: '0101 0001' },
          { label: 'C', text: '0100 1111', wrongExplanation: 'Off by one; re-add carefully, especially the least significant bits.' },
          { label: 'D', text: '0110 0000', wrongExplanation: 'This is too large; double-check the column-by-column addition.' },
        ]}
        correctLabel="B"
        correctExplanation="58₁₀ + 22₁₀ = 80₁₀. In binary: 0011 1010 + 0001 0110 = 0101 0000."
        wrongExplanation="Add column by column from right to left, carrying over when needed."
      />

      {/* Practice Q2 */}
      <PracticeQuestion
        title="Question 2 of 3 — subtraction via negation"
        prompt={<>Compute <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0010 0101</code> − <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0000 1010</code> using two's complement negation and addition.</>}
        options={[
          { label: 'A', text: '0001 1011' },
          { label: 'B', text: '0010 1111', wrongExplanation: 'Check your negation of 0000 1010 and re-add; 37 − 10 = 27, not 47.' },
          { label: 'C', text: '0011 0111', wrongExplanation: 'This is too large; ensure you negate 0000 1010 correctly (invert → 1111 0101, add 1 → 1111 0110).' },
          { label: 'D', text: '0000 1111', wrongExplanation: 'This equals 15, not 27; re-verify your negation step.' },
        ]}
        correctLabel="A"
        correctExplanation="37₁₀ − 10₁₀ = 27₁₀. Negate 0000 1010: invert → 1111 0101, add 1 → 1111 0110 = −10. Add: 0010 0101 + 1111 0110 = (1)0001 1011 (drop carry) = 0001 1011."
        wrongExplanation="Invert all bits of the subtrahend, add 1, then add the result to the minuend."
      />

      {/* Practice Q3 */}
      <PracticeQuestion
        title="Question 3 of 3 — carry out vs result"
        prompt="What is 1111 1111 + 0000 0001 in 8-bit binary? (unsigned)"
        options={[
          { label: 'A', text: '1 0000 0000 (9 bits, carry=1)', wrongExplanation: 'The carry exists, but the 8-bit result in the register is what we store.' },
          { label: 'B', text: '0000 0000 (result wraps to 0; carry out = 1)' },
          { label: 'C', text: '1111 1111', wrongExplanation: 'Overflow occurred; 255 + 1 produces a carry, and the 8-bit result wraps to 0.' },
          { label: 'D', text: '0000 0010', wrongExplanation: 'Unsigned: 255 + 1 = 256, which wraps to 0 in 8 bits, not 2.' },
        ]}
        correctLabel="B"
        correctExplanation="255 + 1 = 256 in decimal. In 8-bit unsigned, 256 wraps to 0 (the extra bit is carried out and discarded). Result = 0000 0000, carry out = 1."
        wrongExplanation="Fixed-bit registers drop overflow bits. 255 + 1 in 8-bit unsigned equals 0 with a carry out."
      />
    </div>
  );
}
