'use client';
import React from 'react';
import { Card } from './Card';
import { InfoNote } from './InfoNote';
import { PracticeQuestion } from './PracticeQuestion';

export function TabRepresentationFormats() {
  return (
    <div>
      {/* Unsigned */}
      <Card variant="concept" title="Unsigned — Only non-negative values">
        <p className="text-sm text-gray-700 leading-relaxed">
          Unsigned binary numbers only represent non-negative values (0 and positive). Every bit represents magnitude.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          With n bits, an unsigned integer can represent values from 0 to 2ⁿ − 1. For 8 bits: 0 to 255.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Example:</strong> <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1011 1110</code> in unsigned 8-bit = 128 + 32 + 16 + 8 + 4 + 2 = 190 (base 10)
        </p>
        <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">8-bit unsigned range:</p>
          <p className="text-sm text-gray-700"><strong>Minimum:</strong> 0000 0000 = 0</p>
          <p className="text-sm text-gray-700"><strong>Maximum:</strong> 1111 1111 = 255</p>
        </div>
      </Card>

      {/* Sign-Magnitude */}
      <Card variant="concept" title="Sign-Magnitude — Intuitive but flawed">
        <p className="text-sm text-gray-700 leading-relaxed">
          Sign-magnitude uses the most significant bit (leftmost) as a sign bit: 0 for positive, 1 for negative. The remaining bits represent the magnitude.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Problem:</strong> Sign-magnitude breaks for hardware. There are two zeros (+0 and −0), and addition doesn't work correctly. For example, 0001 + 1001 should equal 0, but it gives 1010 = −2.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Example:</strong> <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1011 1110</code> in sign-magnitude 8-bit = -(32 + 16 + 8 + 4 + 2) = -62 (base 10)
        </p>
        <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">8-bit sign-magnitude range:</p>
          <p className="text-sm text-gray-700"><strong>Minimum:</strong> 1111 1111 = -127</p>
          <p className="text-sm text-gray-700"><strong>Maximum:</strong> 0111 1111 = +127</p>
        </div>
        <InfoNote tone="warn">
          Sign-magnitude is avoided in modern hardware because addition and subtraction require separate circuits.
        </InfoNote>
      </Card>

      {/* Two's Complement */}
      <Card variant="concept" title="Two's Complement — The standard">
        <p className="text-sm text-gray-700 leading-relaxed">
          In two's complement, the MSB (most significant bit) has weight −2ⁿ⁻¹ instead of +2ⁿ⁻¹. All other bits have positive weights.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          To negate a number: <strong>invert every bit, then add 1.</strong> This works in both directions.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          <strong>Example:</strong> To represent −66 from +66:
        </p>
        <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 font-mono text-sm space-y-1">
          <div>+66 = 0100 0010</div>
          <div>Invert =&gt; 1011 1101</div>
          <div>Add 1 =&gt; 1011 1110 = -66</div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          Verify: -128 + 32 + 16 + 8 + 4 + 2 = -66 ✓
        </p>
        <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">8-bit two's complement range:</p>
          <p className="text-sm text-gray-700"><strong>Minimum:</strong> 1000 0000 = -128</p>
          <p className="text-sm text-gray-700"><strong>Maximum:</strong> 0111 1111 = +127</p>
          <p className="text-sm text-gray-700 mt-2"><strong>Key facts:</strong> All-zeros = 0, all-ones = -1</p>
        </div>
        <InfoNote>
          Two's complement is used by virtually all modern computers. There is exactly one zero, and the same adder circuit works for both positive and negative numbers.
        </InfoNote>
      </Card>

      {/* Practice Q1 */}
      <PracticeQuestion
        title="Question 1 of 3 — read a negative two's complement"
        prompt={<>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1011 1110</code> in 8-bit two's complement?</>}
        options={[
          { label: 'A', text: '-66' },
          { label: 'B', text: '190 (unsigned)', wrongExplanation: "This is the unsigned interpretation; two's complement uses the MSB as negative — invert and add 1 to find the magnitude." },
          { label: 'C', text: '-62', wrongExplanation: 'Close: re-invert the bits carefully (1011 1110 becomes 0100 0001) and add 1 to get 0100 0010 = 66, so original is -66.' },
          { label: 'D', text: '-74', wrongExplanation: 'Off by a few weights; double-check your inversion and +1 step.' },
        ]}
        correctLabel="A"
        correctExplanation="Invert 1011 1110 becomes 0100 0001, add 1 becomes 0100 0010 = 66. So the original value is -66."
        wrongExplanation="The MSB is 1, so this is negative. Invert all bits then add 1 to find the magnitude."
      />

      {/* Practice Q2 */}
      <PracticeQuestion
        title="Question 2 of 3 — encode a negative in two's complement"
        prompt="What is the 8-bit two's complement representation of −17?"
        options={[
          { label: 'A', text: '1001 0001 (sign-magnitude)', wrongExplanation: 'Sign-magnitude is different; it uses a sign bit plus magnitude and does not perform invert+1.' },
          { label: 'B', text: '1110 1110 (inverted, before +1)', wrongExplanation: 'This is the inverted bits before adding 1 — you must complete the invert+1 step.' },
          { label: 'C', text: '1110 1111' },
          { label: 'D', text: '1111 0001', wrongExplanation: 'This pattern corresponds to a different magnitude; start from +17 and apply invert+1.' },
        ]}
        correctLabel="C"
        correctExplanation="+17 = 0001 0001. Invert all bits becomes 1110 1110. Add 1 becomes 1110 1111. Verify: -128+64+32+8+4+2+1 = -17 ✓"
        wrongExplanation="Start from +17 = 0001 0001, invert every bit, then add 1."
      />

      {/* Practice Q3 */}
      <PracticeQuestion
        title="Question 3 of 3 — distinguish formats"
        prompt={<>The bit pattern <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1100 0001</code> means different values in different formats. In 8-bit unsigned, what is it?</>}
        options={[
          { label: 'A', text: '193' },
          { label: "B", text: "-63 (two's complement)", wrongExplanation: "That would be the two's complement interpretation; the question asks for unsigned." },
          { label: 'C', text: '−65 (sign-magnitude)', wrongExplanation: 'That would be the sign-magnitude interpretation; the question asks for unsigned.' },
          { label: 'D', text: '128', wrongExplanation: 'Check: 128 + 64 + 1 = 193 for unsigned, not 128.' },
        ]}
        correctLabel="A"
        correctExplanation="In unsigned: 128 + 64 + 1 = 193₁₀"
        wrongExplanation="In unsigned, every bit is positive. Sum the weights of all 1-bits: 2⁷ + 2⁶ + 2⁰."
      />
    </div>
  );
}
