'use client';
import React, { useState } from 'react';
import { Card } from '../Card';
import { colors } from '../types';
import { recordActivityOutcome } from '../../src/utils/analytics';

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
  const base = 'flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-mono font-medium transition-all duration-150 select-none';
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
    { label: 'A (unsigned)',      main: uA, sub: `two's complement: ${sA}` },
    { label: 'B (unsigned)',      main: uB, sub: `two's complement: ${sB}` },
    { label: 'Result (unsigned)', main: uR, sub: `two's complement: ${sR}` },
    { label: 'Carry out',         main: co, sub: 'out of MSB' },
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
            <p className="text-xl font-medium text-gray-900">{main}</p>
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
    title: 'Question 1 of 2 — Binary addition',
    prompt: <>Add <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0011 1010</code> + <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0001 0110</code>. What is the 8-bit result?</>,
    options: [
      { label: 'A', text: '0101 0000', wrongExplanation: 'Close, but recheck the least significant columns where carry begins.' },
      { label: 'B', text: '0101 0001' },
      { label: 'C', text: '0100 1111', wrongExplanation: 'This is off by carry propagation from right to left.' },
      { label: 'D', text: '0110 0000', wrongExplanation: 'That value is too high for these operands.' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p>Correct. Column-by-column addition gives <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs font-mono">0101 0000</code> in pure bit math, and decimal check is 58 + 22 = 80.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p><strong>Binary addition rules:</strong> add right to left, including carry-in each step.</p>
        <div className="rounded bg-rose-100 px-3 py-2 font-mono text-sm space-y-1">
          <div>0 + 0 = 0</div>
          <div>0 + 1 = 1</div>
          <div>1 + 1 = 10  (write 0, carry 1)</div>
          <div>1 + 1 + 1 = 11  (write 1, carry 1)</div>
        </div>
        <p>In fixed-width arithmetic, a carry beyond the leftmost bit is discarded in the stored result. That carry-out is separate from signed overflow.</p>
      </div>
    ),
  },
  {
    title: 'Question 2 of 2 — Binary subtraction via two\'s complement',
    prompt: <>Compute <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0010 0101</code> − <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">0000 1010</code> using two's complement.</>,
    options: [
      { label: 'A', text: '0001 1011' },
      { label: 'B', text: '0010 1111', wrongExplanation: 'This equals 47, which does not match 37 − 10.' },
      { label: 'C', text: '0011 0111', wrongExplanation: 'Negation of the subtrahend appears incorrect.' },
      { label: 'D', text: '0000 1111', wrongExplanation: 'This gives 15, so the subtraction steps are incomplete.' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p>Correct. Negate <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs font-mono">0000 1010</code> to <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs font-mono">1111 0110</code>, add it to <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs font-mono">0010 0101</code>, then keep the low 8 bits: <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs font-mono">0001 1011</code>.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p><strong>Subtraction workflow in two's complement:</strong> convert <code className="rounded bg-rose-100 px-1 py-0.5 text-xs font-mono">A − B</code> into <code className="rounded bg-rose-100 px-1 py-0.5 text-xs font-mono">A + (-B)</code>.</p>
        <div className="rounded bg-rose-100 px-3 py-2 font-mono text-sm space-y-1">
          <div>B = 0000 1010</div>
          <div>invert(B) = 1111 0101</div>
          <div>+1 = 1111 0110  (this is -10)</div>
          <div className="mt-1">A + (-B): 0010 0101 + 1111 0110 = (1)0001 1011</div>
          <div>drop carry-out -&gt; 0001 1011</div>
        </div>
        <p>This is why hardware uses one adder for both addition and subtraction.</p>
      </div>
    ),
  },
];

export function TabAdditionSubtraction() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];
  const isCorrect = selectedOption === currentQuestion.correctLabel;

  const handleSubmit = () => {
    setSubmitted(true);
    recordActivityOutcome('binary-arithmetic', 'question', isCorrect ? 'correct' : 'incorrect', isCorrect ? 1 : 0, 1, 'addition-subtraction');
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
      <Card variant="practice" title="Practice: Binary addition and subtraction">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Work through one addition question and one subtraction question. Feedback is designed to reteach the method if you miss one.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{currentQuestion.title}</p>
              <p className="text-sm text-gray-700">{currentQuestion.prompt}</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label key={option.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-500 transition">
                <input
                  type="radio"
                  name="addition-subtraction-quiz"
                  checked={selectedOption === option.label}
                  onChange={() => setSelectedOption(option.label)}
                  disabled={submitted}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-sm text-gray-700">
                  <strong className="font-medium">{option.label}.</strong> {option.text}
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedOption === null || submitted}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition"
            >
              Submit answer
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
              >
                Previous question
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
              >
                Next question
              </button>
            </div>
          </div>

          {submitted && (
            <div className={`rounded-2xl border px-4 py-4 ${isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
              <p className="text-sm font-medium">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
              <div className="mt-2 text-sm leading-relaxed">
                {isCorrect ? currentQuestion.correctExplanation : currentQuestion.wrongExplanation}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Interactive Adder */}
      <Card variant="simulation" title="Interactive 8-bit adder">
        <InteractiveAdder />
      </Card>
    </div>
  );
}
