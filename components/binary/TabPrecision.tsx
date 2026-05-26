import React from 'react';
import { Card } from './Card';
import { InfoNote } from './InfoNote';
import { PracticeQuestion } from './PracticeQuestion';
import { colors } from './types';

const terms = [
  {
    name: 'Overflow',
    def: 'The result is too large in magnitude to be represented in the available bits. E.g. +127 + 1 in 8-bit signed.',
  },
  {
    name: 'Underflow',
    def: 'The result is too small in magnitude — it rounds to zero. Relevant for floating-point numbers with a limited exponent range.',
  },
  {
    name: 'Precision',
    def: 'How finely spaced the representable values are. More bits devoted to the fractional part → higher precision but smaller range.',
  },
  {
    name: 'Truncation',
    def: 'Dropping low-order bits to fit a value into a smaller format. The lost bits introduce a small but unavoidable truncation error.',
  },
];

function FixedPointVisual() {
  return (
    <div>
      <p className="text-sm text-gray-700 leading-relaxed mt-2">
        Consider an 8-bit fixed-point format: 1 sign bit, 3 integer bits, 4 fractional bits.
      </p>

      {/* Bit-field diagram */}
      <div className="mt-4 flex overflow-hidden rounded-2xl border border-gray-200 text-xs font-mono">
        <div className="flex flex-col items-center justify-center px-4 py-3 shrink-0" style={{ backgroundColor: colors.yellow.light }}>
          <span className="font-semibold text-800 text-[10px] mb-1 font-sans" style={{ color: colors.yellow.dark }}>sign</span>
          <span className="font-semibold" style={{ color: colors.yellow.dark }}>0</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center border-x border-gray-200 px-4 py-3" style={{ backgroundColor: colors.blue.light }}>
          <span className="font-semibold text-400 text-[10px] mb-1 font-sans" style={{ color: colors.blue.dark }}>integer (2², 2¹, 2⁰)</span>
          <span className="font-semibold tracking-widest" style={{ color: colors.blue.dark }}>101</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-3" style={{ backgroundColor: colors.purple.light }}>
          <span className="font-semibold text-400 text-[10px] mb-1 font-sans" style={{ color: colors.purple.dark }}>fractional (2⁻¹ … 2⁻⁴)</span>
          <span className="font-semibold tracking-widest" style={{ color: colors.purple.dark }}>1010</span>
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mt-4">
        Reading the value: sign = 0 (positive), integer bits 101 = 5, fractional bits 1010 = 0.5 +
        0.125 = 0.625. Result: <strong>+5.625</strong>.
      </p>
      <p className="text-sm text-gray-700 leading-relaxed mt-2">
        Smallest positive value: 2⁻⁴ = 0.0625. Largest positive value: 0 111 1111 = 7.9375.
      </p>

      <InfoNote tone="warn">
        Fixed-point cannot represent most real numbers exactly. A value like 0.1 in decimal has no
        finite binary representation — it must be truncated, introducing a small but unavoidable error.
      </InfoNote>
    </div>
  );
}

export function TabPrecision() {
  return (
    <div>
      {/* Key terms */}
      <Card variant="concept" title="Key terms">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {terms.map((t) => (
            <div key={t.name} className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">{t.name}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{t.def}</p>
            </div>
          ))}
        </div>
        <InfoNote>
          Range and precision trade off against each other. Moving the binary point left gives more
          fractional precision but shrinks the integer range. Moving it right does the opposite.
        </InfoNote>
      </Card>

      {/* Worked example */}
      <Card variant="worked" title="Fixed-point representation">
        <p className="text-sm text-gray-700 leading-relaxed">
          Fixed-point stores both integer and fractional parts within a single bit field by fixing
          where the binary point sits. The hardware is simple (same as integers), but range and
          precision are both constrained.
        </p>
        <FixedPointVisual />
      </Card>

      {/* Q1 */}
      <PracticeQuestion
        title="Question 1 of 2 — classify the error"
        prompt={<>A sensor produces the value <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1.5 × 10⁻⁴⁵</code>. The floating-point format can only represent numbers as small as <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1.2 × 10⁻³⁸</code>. What type of error occurs?</>}
        options={[
          { label: 'A', text: 'Overflow — the exponent is out of range', wrongExplanation: 'Overflow refers to values that are too large to represent, not too small — this example is far below the minimum magnitude.' },
          { label: 'B', text: 'Underflow — the value is too small and rounds to zero' },
          { label: 'C', text: 'Truncation error — low-order bits are dropped', wrongExplanation: 'Truncation refers to dropping low-order fraction bits when converting formats; underflow here means the value rounds to zero.' },
          { label: 'D', text: 'No error — the value is stored exactly', wrongExplanation: 'This value cannot be stored exactly nor represented — it is below the representable range and will round to zero.' },
        ]}
        correctLabel="B"
        correctExplanation="The value 1.5×10⁻⁴⁵ is smaller than the minimum representable magnitude (1.2×10⁻³⁸). It cannot be stored and rounds to zero — this is underflow."
        wrongExplanation="Overflow means the value is too large. Here the value is far too small — below the minimum representable magnitude."
      />

      {/* Q2 */}
      <PracticeQuestion
        title="Question 2 of 2 — fixed-point range"
        prompt="A 32-bit fixed-point format uses 1 sign bit, 15 integer bits, and 16 fractional bits. What is the smallest positive number it can represent?"
        options={[
          { label: 'A', text: '2⁻¹⁵ ≈ 0.0000305', wrongExplanation: 'This uses 15 fractional bits — but the format has 16 fractional bits, so the smallest positive unit is 2⁻¹⁶.' },
          { label: 'B', text: '2⁻³² (as if all bits were fractional)', wrongExplanation: 'Not all bits are fractional: there is 1 sign bit and 15 integer bits, so only 16 bits are fractional.' },
          { label: 'C', text: '2⁻¹⁶ ≈ 0.0000153' },
          { label: 'D', text: '1 (smallest integer)', wrongExplanation: '1 is an integer; the smallest positive fractional unit is 2⁻¹⁶ in this format.' },
        ]}
        correctLabel="C"
        correctExplanation="With 16 fractional bits, the least significant bit has weight 2⁻¹⁶ ≈ 0.0000153. Every other bit is zero, so this single bit is the smallest positive non-zero value."
        wrongExplanation="Count only the fractional bits (16 of them). The least significant fractional bit has weight 2⁻¹⁶."
      />
    </div>
  );
}