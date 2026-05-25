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

function OverflowCases() {
  const cases = [
    {
      ok: true,
      title: 'No overflow',
      lines: ['  0011 0000  (+48)', '+ 0001 0000  (+16)', '──────────────────', '  0100 0000  (+64)'],
      note: 'Carry in = 0, carry out = 0 → no overflow',
    },
    {
      ok: false,
      title: 'Positive overflow',
      lines: ['  0111 1111  (+127)', '+ 0000 0001    (+1)', '──────────────────', '  1000 0000  (−128)'],
      note: 'Carry in = 1, carry out = 0 → overflow',
    },
    {
      ok: true,
      title: 'Unsigned carry (not overflow)',
      lines: ['  1111 1111   (255)', '+ 0000 0001     (1)', '──────────────────', '1 0000 0000   (→ 0)'],
      note: 'Carry out = 1, but no signed overflow',
    },
    {
      ok: false,
      title: 'Negative overflow',
      lines: ['  1000 0000  (−128)', '+ 1111 1111    (−1)', '──────────────────', '  0111 1111  (+127)'],
      note: 'Carry in = 0, carry out = 1 → overflow',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {cases.map((c) => {
        const col = c.ok ? colors.green : colors.red;
        return (
          <div
            key={c.title}
            className="rounded-2xl border px-5 py-4"
            style={{ backgroundColor: col.light, borderColor: col.light }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: col.dark }}>{c.title}</p>
            <pre className="text-xs leading-6 font-mono whitespace-pre" style={{ color: col.dark }}>
              {c.lines.join('\n')}
            </pre>
            <p className="text-xs mt-2" style={{ color: col.dark }}>{c.note}</p>
          </div>
        );
      })}
    </div>
  );
}

export function TabAdditionOverflow() {
  return (
    <div>
      {/* Concept */}
      <Card variant="concept" title="Binary addition rules">
        <p className="text-sm text-gray-700 leading-relaxed">
          Binary addition works column-by-column from right to left, exactly like decimal. At each
          position you sum the two bits plus any carry-in from the column to the right.
        </p>
        <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 font-mono text-sm text-gray-800 space-y-1.5">
          <div>0 + 0 = 0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (no carry)</div>
          <div>0 + 1 = 1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (no carry)</div>
          <div>1 + 1 = 10 &nbsp;&nbsp; → &nbsp;write 0, carry 1</div>
          <div>1 + 1 + 1 = 11 → &nbsp;write 1, carry 1</div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          Signed overflow occurs when the carry <em>into</em> the sign bit differs from the carry{' '}
          <em>out of</em> the sign bit — meaning the sign of the result is wrong.
        </p>
        <InfoNote tone="warn">
          Carry out ≠ overflow. A carry out of the MSB is expected and correct for unsigned
          arithmetic. Signed overflow only occurs when positive + positive = negative, or
          negative + negative = positive.
        </InfoNote>
      </Card>

      {/* Simulation */}
      <Card variant="simulation" title="Interactive 8-bit adder">
        <InteractiveAdder />
      </Card>

      {/* Worked example */}
      <Card variant="worked" title="The four overflow cases">
        <p className="text-sm text-gray-700 leading-relaxed">
          Overflow detection depends on whether carry-in and carry-out of the sign bit match.
          Here are the four possible cases for 8-bit signed addition.
        </p>
        <OverflowCases />
      </Card>

      {/* Q1 */}
      <PracticeQuestion
        title="Question 1 of 3 — detect overflow"
        prompt="Adding 8-bit signed values +100 and +50: does signed overflow occur?"
        options={[
          { label: 'A', text: 'Yes — the sum exceeds +127 and wraps to a negative value' },
          { label: 'B', text: 'No — both operands are positive so the result is always valid' },
          { label: 'C', text: 'Only if there is also a carry out of the MSB' },
          { label: 'D', text: 'No — this is underflow, not overflow' },
        ]}
        correctLabel="A"
        correctExplanation="100 + 50 = 150, which exceeds the 8-bit signed maximum of +127. The result wraps to −106 — positive + positive = negative, confirming overflow."
        wrongExplanation="Both operands being positive doesn't guarantee no overflow — the sum must also fit within +127."
      />

      {/* Q2 */}
      <PracticeQuestion
        title="Question 2 of 3 — saturating arithmetic"
        prompt="With 8-bit signed saturating arithmetic, what is the result of +100 + +50?"
        options={[
          { label: 'A', text: '−106 (wraps around)' },
          { label: 'B', text: '+150 (true mathematical result)' },
          { label: 'C', text: '+127 (saturates to maximum)' },
          { label: 'D', text: '+128' },
        ]}
        correctLabel="C"
        correctExplanation="The true sum +150 exceeds +127 (the max signed 8-bit value). Saturating arithmetic clamps to the nearest representable value, which is +127."
        wrongExplanation="Saturating arithmetic does not wrap — it clamps to the closest representable value at the boundary."
      />

      {/* Q3 */}
      <PracticeQuestion
        title="Question 3 of 3 — overflow vs unsigned carry"
        prompt={<>Adding <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1111 1111</code> + <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0000 0001</code>. Which statement is correct?</>}
        options={[
          { label: 'A', text: 'Signed overflow occurs because there is a carry out' },
          { label: 'B', text: 'Unsigned carry out occurs, but there is no signed overflow' },
          { label: 'C', text: 'Neither carry out nor overflow occurs' },
          { label: 'D', text: 'Both signed overflow and unsigned carry occur' },
        ]}
        correctLabel="B"
        correctExplanation="Unsigned: 255 + 1 = 256, carry out = 1, 8-bit result = 0. Signed: −1 + 1 = 0, which is perfectly correct. Carry-in and carry-out of the sign bit are both 1 — they match, so no signed overflow."
        wrongExplanation="Check the sign bit carries separately: carry into the sign bit and carry out of it must differ for signed overflow. Here they both equal 1 — they match."
      />
    </div>
  );
}