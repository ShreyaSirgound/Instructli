import React from 'react';
import { Card } from './Card';
import { InfoNote } from './InfoNote';
import { PracticeQuestion } from './PracticeQuestion';
import { colors } from './types';

function SignMagnitudeProblems() {
  const issues = [
    {
      title: 'Problem 1 — two zeros',
      body: '0000 = +0 and 1000 = −0 are both valid, wasting a bit pattern and complicating equality checks.',
      note: 'One representable value is sacrificed.',
    },
    {
      title: 'Problem 2 — addition breaks',
      body: (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Try adding +1 and −1 using sign-magnitude:</div>
          <pre className="rounded-2xl bg-gray-50 border border-gray-100 p-3 font-mono text-sm text-gray-900 whitespace-pre">
  0001
+ 1001
-------
  1010 = −2
          </pre>
          <div className="text-sm text-gray-600">Wrong — the hardware cannot reuse the integer adder.</div>
        </div>
      ),
      note: 'Needs separate subtraction circuitry.',
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {issues.map((item) => (
        <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
          <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
          <div className="text-sm text-gray-600 leading-relaxed">{item.body}</div>
          <p className="mt-2 text-xs font-medium" style={{ color: colors.red.dark }}>{item.note}</p>
        </div>
      ))}
    </div>
  );
}

function WorkedExample() {
  const steps = [
    { n: '1', code: '+66  =  0100 0010' },
    { n: '2', code: 'invert  →  1011 1101' },
    { n: '3', code: 'add 1   →  1011 1110  =  −66' },
  ];
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 mt-4 font-mono text-sm">
      {steps.map((s) => (
        <div key={s.n} className="flex gap-4 leading-8">
          <span className="text-gray-400 w-4 shrink-0">{s.n}</span>
          <span className="text-gray-800">{s.code}</span>
        </div>
      ))}
    </div>
  );
}

export function TabSignedIntegers() {
  return (
    <div>
      {/* Why not sign-magnitude */}
      <Card variant="concept" title="Why not sign-magnitude?">
        <p className="text-sm text-gray-700 leading-relaxed">
          Sign-magnitude is the intuitive approach: use the leftmost bit as a +/− flag and treat the
          rest as magnitude. It works for humans but breaks for hardware.
        </p>
        <SignMagnitudeProblems />
        <p className="text-sm text-gray-700 leading-relaxed mt-4">
          Two's complement fixes both problems. There is exactly one zero, and the same adder circuit
          works for both positive and negative numbers.
        </p>
      </Card>

      {/* Two's complement concept */}
      <Card variant="concept" title="Two's complement">
        <p className="text-sm text-gray-700 leading-relaxed">
          In two's complement the MSB has weight −2<sup>n−1</sup> instead of +2<sup>n−1</sup>.
          All other bit weights are unchanged and positive.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          To negate any number: <strong>invert every bit, then add 1.</strong> This works in both
          directions — positive to negative and back again.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-gray-700 list-disc list-inside">
          <li>Range for n bits: −2<sup>n−1</sup> to +2<sup>n−1</sup>−1</li>
          <li>For 8 bits: −128 to +127</li>
          <li>All-zeros = 0 &nbsp;·&nbsp; all-ones = −1</li>
        </ul>
        <InfoNote>
          Non-negative numbers look identical in unsigned and two's complement — it is only negative
          numbers where the representations differ.
        </InfoNote>
      </Card>

      {/* Worked example */}
      <Card variant="worked" title="Representing −66 in 8-bit two's complement">
        <p className="text-sm text-gray-700 leading-relaxed">
          Start with positive 66, invert all bits, then add 1.
        </p>
        <WorkedExample />
        <p className="text-sm text-gray-700 leading-relaxed mt-4">
          Verify by expanding: −128 + 32 + 16 + 8 + 4 + 2 = −66 ✓
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-2">
          The same process works in reverse: to read{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1011 1110</code>,
          invert → <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0100 0001</code>,
          add 1 → <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">0100 0010</code> = 66,
          so the original is −66.
        </p>
      </Card>

      {/* Q1 */}
      <PracticeQuestion
        title="Question 1 of 2 — read a negative value"
        prompt={<>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">1011 1110</code> interpreted as an 8-bit two's complement number?</>}
        options={[
          { label: 'A', text: '−66' },
          { label: 'B', text: '190 (unsigned interpretation)', wrongExplanation: "This is the unsigned interpretation; two's complement uses the MSB as a negative weight — invert the bits and add 1 to read negatives." },
          { label: 'C', text: '−62', wrongExplanation: 'Close — check your inversion and +1 step; a small mistake in the LSBs changes the magnitude.' },
          { label: 'D', text: '−74', wrongExplanation: 'Off by a few weights; re-run invert+1 carefully to compute the correct magnitude.' },
        ]}
        correctLabel="A"
        correctExplanation="Invert 1011 1110 → 0100 0001, add 1 → 0100 0010 = 66. So the original value is −66."
        wrongExplanation="The MSB is 1, so this is negative. Invert all bits then add 1 to find the magnitude."
      />

      {/* Q2 */}
      <PracticeQuestion
        title="Question 2 of 2 — encode a negative value"
        prompt="What is the 8-bit two's complement representation of −17?"
        options={[
          { label: 'A', text: '1001 0001  (sign-magnitude)', wrongExplanation: "Sign-magnitude is different: it uses a sign bit plus magnitude and doesn't perform invert+1." },
          { label: 'B', text: '1110 1110  (inverted, before +1)', wrongExplanation: "This is the inverted bits before adding 1 — you must add 1 to complete two's complement." },
          { label: 'C', text: '1110 1111' },
          { label: 'D', text: '1111 0001', wrongExplanation: 'This pattern corresponds to a different magnitude; start from +17, invert every bit, then add 1 to get the correct encoding.' },
        ]}
        correctLabel="C"
        correctExplanation="+17 = 0001 0001. Invert all bits → 1110 1110. Add 1 → 1110 1111. Verify: −128+64+32+8+4+2+1 = −17 ✓"
        wrongExplanation="Start from +17 = 0001 0001, invert every bit, then add 1."
      />
    </div>
  );
}