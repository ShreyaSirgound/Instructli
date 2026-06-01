'use client';
import React from 'react';
import { Card } from './Card';
import { InfoNote } from './InfoNote';
import { PracticeQuestion } from './PracticeQuestion';
import { colors } from './types';

function OverflowCases() {
  const cases = [
    {
      ok: true,
      title: 'Positive + Positive = Positive (no overflow)',
      lines: ['  0011 0000  (+48)', '+ 0001 0000  (+16)', '──────────────────', '  0100 0000  (+64)'],
      note: 'Both operands positive, result positive. No overflow.',
    },
    {
      ok: false,
      title: 'Positive + Positive = Negative (overflow)',
      lines: ['  0111 1111  (+127)', '+ 0000 0001    (+1)', '──────────────────', '  1000 0000  (−128)'],
      note: 'Two positive numbers sum to a negative — logically impossible. Overflow!',
    },
    {
      ok: true,
      title: 'Negative + Negative = Negative (no overflow)',
      lines: ['  1000 0001  (−127)', '+ 1000 0001  (−127)', '──────────────────', '  0000 0010  (+2) ← WRONG'],
      note: 'In two\'s complement, this result wraps but remains consistent (both operands negative, result conceptually stays "in range").',
    },
    {
      ok: false,
      title: 'Negative + Negative = Positive (overflow)',
      lines: ['  1000 0000  (−128)', '+ 1111 1111   (−1)', '──────────────────', '  0111 1111  (+127)'],
      note: 'Two negative numbers sum to a positive — logically impossible. Overflow!',
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

export function TabOverflowSaturating() {
  return (
    <div>
      {/* Overflow concept */}
      <Card variant="concept" title="Overflow — Result exceeds bit width">
        <p className="text-sm text-gray-700 leading-relaxed">
          Overflow occurs when the result of an operation is too large or too small to fit in the available bits, producing an incorrect result.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          For <strong>signed addition in two's complement</strong>, overflow happens when:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
          <li>Positive + Positive → Negative (sign bit incorrectly flips)</li>
          <li>Negative + Negative → Positive (sign bit incorrectly flips)</li>
        </ul>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Positive + Negative can never overflow</strong> because opposite signs prevent the result from exceeding the range.
        </p>
        <InfoNote tone="warn">
          Do not confuse carry-out with overflow. A carry out of the MSB is expected in unsigned arithmetic. Overflow specifically means the sign changed incorrectly in signed arithmetic.
        </InfoNote>
      </Card>

      {/* Underflow concept */}
      <Card variant="concept" title="Underflow — Result too small in magnitude">
        <p className="text-sm text-gray-700 leading-relaxed">
          Underflow occurs in floating-point arithmetic when a number is too close to zero to be represented. For example, 0.0001 might be too small to store precisely.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>In this course</strong>, we focus on integer arithmetic, so underflow is not a major concern. The term "underflow" sometimes refers to negative overflow (result too small, i.e., too negative), but we use "overflow" for both directions.
        </p>
      </Card>

      {/* The Four Overflow Cases */}
      <Card variant="worked" title="The four overflow cases">
        <p className="text-sm text-gray-700 leading-relaxed">
          Here are all possible outcomes for 8-bit signed addition in two's complement:
        </p>
        <OverflowCases />
      </Card>

      {/* Saturating Arithmetic */}
      <Card variant="concept" title="Saturating arithmetic — Clamping on overflow">
        <p className="text-sm text-gray-700 leading-relaxed">
          Saturating arithmetic prevents overflow by clamping the result to the nearest representable value when an operation would overflow.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>If positive + positive would overflow:</strong> clamp to maximum (+127 for 8-bit signed)
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong>If negative + negative would overflow:</strong> clamp to minimum (−128 for 8-bit signed)
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Example:</strong> Normal: 127 + 1 = 128 → wraps to −128. Saturating: 127 + 1 = 127 (stays at max).
        </p>
        <InfoNote>
          Saturating arithmetic is used in audio processing, image processing, and other domains where wrapping is undesirable. It preserves the direction of the result (positive or negative).
        </InfoNote>
      </Card>

      {/* Practice Q1 */}
      <PracticeQuestion
        title="Question 1 of 3 — detect overflow"
        prompt="Adding 8-bit signed values +100 and +50: does signed overflow occur?"
        options={[
          { label: 'A', text: 'Yes — the sum exceeds +127 and wraps to a negative value' },
          { label: 'B', text: 'No — both operands are positive so the result is always valid', wrongExplanation: 'Both operands being positive does not guarantee no overflow — the numeric sum must also fit within +127.' },
          { label: 'C', text: 'Only if there is also a carry out of the MSB', wrongExplanation: 'Carry out alone is not sufficient for signed overflow — compare carry into and out of the sign bit.' },
          { label: 'D', text: 'No — this is underflow, not overflow', wrongExplanation: 'Adding two positives can only cause positive overflow, not underflow.' },
        ]}
        correctLabel="A"
        correctExplanation="100 + 50 = 150, which exceeds the 8-bit signed maximum of +127. The result wraps to −106 — positive + positive = negative, confirming overflow."
        wrongExplanation="Both operands being positive doesn't guarantee no overflow — the sum must also fit within +127."
      />

      {/* Practice Q2 */}
      <PracticeQuestion
        title="Question 2 of 3 — saturating arithmetic"
        prompt="With 8-bit signed saturating arithmetic, what is the result of +100 + +50?"
        options={[
          { label: 'A', text: '−106 (wraps around)', wrongExplanation: 'Wrap-around is what happens in normal two\'s complement; saturating arithmetic clamps instead.' },
          { label: 'B', text: '+150 (true mathematical result)', wrongExplanation: 'The true mathematical result is +150, but it cannot be represented in 8-bit signed; saturation clamps to +127.' },
          { label: 'C', text: '+127 (saturates to maximum)' },
          { label: 'D', text: '+128', wrongExplanation: '+128 is not representable in signed 8-bit; the maximum is +127.' },
        ]}
        correctLabel="C"
        correctExplanation="The true sum +150 exceeds +127. Saturating arithmetic clamps to the nearest representable value, which is +127."
        wrongExplanation="Saturating arithmetic does not wrap — it clamps to the closest representable value at the boundary."
      />

      {/* Practice Q3 */}
      <PracticeQuestion
        title="Question 3 of 3 — overflow vs carry"
        prompt={<>Adding <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">1111 1111</code> + <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0000 0001</code> in 8-bit two's complement. Which is true?</>}
        options={[
          { label: 'A', text: 'Signed overflow occurs because there is a carry out', wrongExplanation: 'Carry out alone does not cause signed overflow — −1 + 1 = 0 is perfectly valid.' },
          { label: 'B', text: 'Unsigned carry out occurs, but no signed overflow' },
          { label: 'C', text: 'Neither carry out nor overflow occurs', wrongExplanation: 'There is an unsigned carry out here (255 + 1); check the unsigned sum.' },
          { label: 'D', text: 'Both signed overflow and unsigned carry occur', wrongExplanation: 'Unsigned carry occurs, but signed overflow does not; −1 + 1 = 0 is a valid signed result.' },
        ]}
        correctLabel="B"
        correctExplanation="Unsigned: 255 + 1 = 256 → result = 0, carry = 1. Signed: −1 + 1 = 0 (correct). Carry in and carry out of the sign bit both = 1, so they match → no overflow."
        wrongExplanation="Check the sign-bit carries: if carry-in and carry-out of the MSB differ, overflow occurs. Here they both equal 1 — no overflow."
      />
    </div>
  );
}
