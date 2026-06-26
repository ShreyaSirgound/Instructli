'use client';
import React, { useState } from 'react';
import { Card } from '../Card';
import { colors } from '../types';

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
      lines: ['  1100 0000   (−64)', '+ 1111 0000   (−16)', '──────────────────', '  1011 0000   (−80)'],
      note: 'Both operands are negative and the result remains negative and in range. No overflow.',
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

type QuizOption = {
  label: string;
  text: string;
  wrongExplanation?: string;
};

type QuizQuestion = {
  title: string;
  prompt: React.ReactNode;
  options: QuizOption[];
  correctLabel: string;
  correctExplanation: React.ReactNode;
  wrongExplanation: React.ReactNode;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    title: 'Question 1 of 3 — Detect signed overflow',
    prompt: 'Adding 8-bit signed values +100 and +50: does signed overflow occur?',
    options: [
      { label: 'A', text: 'Yes — the sum exceeds +127 and wraps to a negative value' },
      { label: 'B', text: 'No — both operands are positive so the result is always valid', wrongExplanation: 'Both positive operands can still overflow if the sum exceeds +127.' },
      { label: 'C', text: 'Only if there is also a carry out of the MSB', wrongExplanation: 'Carry-out does not define signed overflow by itself.' },
      { label: 'D', text: 'No — this is underflow, not overflow', wrongExplanation: 'Adding positives cannot be underflow in integer arithmetic.' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p>Correct. 100 + 50 = 150, which is outside 8-bit signed range <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs font-mono">-128..+127</code>, so the stored value wraps and appears negative.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p><strong>Overflow concept:</strong> overflow means the true result cannot fit in available bits.</p>
        <p>For signed two's complement addition, overflow occurs only when:</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>positive + positive gives a negative result</li>
          <li>negative + negative gives a positive result</li>
        </ul>
        <p><strong>Positive + negative</strong> cannot overflow. Also, do not equate carry-out with signed overflow.</p>
      </div>
    ),
  },
  {
    title: 'Question 2 of 3 — Underflow vs integer overflow',
    prompt: 'In this module, which statement about underflow is accurate?',
    options: [
      { label: 'A', text: 'Underflow is the same as carry-out in unsigned addition', wrongExplanation: 'Carry-out is an integer-bit event, not floating-point underflow.' },
      { label: 'B', text: 'Underflow is mostly a floating-point tiny-near-zero issue; integer lessons here use overflow for out-of-range results' },
      { label: 'C', text: 'Underflow is when two positives produce a negative in two\'s complement', wrongExplanation: 'That case is signed overflow, not underflow.' },
      { label: 'D', text: 'Underflow is the standard term for any negative integer result', wrongExplanation: 'Negative results are often valid; only out-of-range values are errors.' },
    ],
    correctLabel: 'B',
    correctExplanation: (
      <div className="space-y-2">
        <p>Correct. In many contexts, underflow refers to floating-point results too close to zero to represent. In this integer-focused module, we classify out-of-range results as overflow (too positive or too negative).</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p><strong>Underflow clarification:</strong> underflow is commonly a floating-point concept for tiny magnitudes near zero.</p>
        <p>In fixed-width integer arithmetic here, the practical concern is overflow: result exceeds representable range on either side.</p>
        <p>So when a signed sum becomes impossible for the bit width, we discuss it as overflow, not a separate underflow unit.</p>
      </div>
    ),
  },
  {
    title: 'Question 3 of 3 — Saturating arithmetic',
    prompt: 'With 8-bit signed saturating arithmetic, what is the result of +100 + +50?',
    options: [
      { label: 'A', text: '−106 (wrap-around)', wrongExplanation: 'Wrap-around is regular two\'s complement behavior, not saturation.' },
      { label: 'B', text: '+150', wrongExplanation: '+150 cannot be represented in signed 8-bit format.' },
      { label: 'C', text: '+127 (clamped to maximum)' },
      { label: 'D', text: '+128', wrongExplanation: '+128 is outside the representable signed 8-bit range.' },
    ],
    correctLabel: 'C',
    correctExplanation: (
      <div className="space-y-2">
        <p>Correct. Saturating arithmetic clamps overflow to boundary values, so +150 clamps to +127.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p><strong>Saturating arithmetic rule:</strong> when result exceeds range, clamp to nearest endpoint instead of wrapping.</p>
        <div className="rounded bg-rose-100 px-3 py-2 text-sm space-y-1">
          <p><strong>Positive overflow:</strong> clamp to +127 (8-bit signed max)</p>
          <p><strong>Negative overflow:</strong> clamp to -128 (8-bit signed min)</p>
        </div>
        <p>This is useful in audio and image processing where wrap-around introduces severe artifacts.</p>
      </div>
    ),
  },
];

export function TabOverflowSaturating() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];
  const isCorrect = selectedOption === currentQuestion.correctLabel;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    setQuestionIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
    setSelectedOption(null);
    setSubmitted(false);
  };

  const handlePrevious = () => {
    setQuestionIndex((prev) => (prev - 1 + QUIZ_QUESTIONS.length) % QUIZ_QUESTIONS.length);
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <div>
      <Card variant="practice" title="Practice: Overflow and saturating arithmetic">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Work through overflow, underflow terminology, and saturation behavior. If you miss a question, the feedback reteaches the concept.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">{currentQuestion.title}</p>
              <p className="text-sm text-gray-700">{currentQuestion.prompt}</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label key={option.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-500 transition">
                <input
                  type="radio"
                  name="overflow-saturating-quiz"
                  checked={selectedOption === option.label}
                  onChange={() => setSelectedOption(option.label)}
                  disabled={submitted}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-sm text-gray-700">
                  <strong className="font-semibold">{option.label}.</strong> {option.text}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedOption === null || submitted}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Submit answer
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
              >
                Previous question
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
              >
                Next question
              </button>
            </div>
          </div>

          {submitted && (
            <div className={`rounded-2xl border px-4 py-4 ${isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
              <p className="text-sm font-semibold">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
              <div className="mt-2 text-sm leading-relaxed">
                {isCorrect ? currentQuestion.correctExplanation : currentQuestion.wrongExplanation}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* The Four Overflow Cases */}
      <Card variant="worked" title="The four overflow cases">
        <p className="text-sm text-gray-700 leading-relaxed">
          Here are all possible outcomes for 8-bit signed addition in two's complement:
        </p>
        <OverflowCases />
      </Card>
    </div>
  );
}
