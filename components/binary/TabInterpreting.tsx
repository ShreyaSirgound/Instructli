'use client';
import React, { useState } from 'react';
import { Card } from '../Card';
import { InfoNote } from '../InfoNote';
import { recordActivityOutcome } from '../../src/utils/analytics';

const N = 8;

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
            className="w-10 h-10 rounded-xl border text-sm font-mono font-medium transition-all duration-150"
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

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    title: 'Question 1 of 3 — Binary (Base 2)',
    prompt: <>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">11001₂</code> in decimal?</>,
    options: [
      { label: 'A', text: '25' },
      { label: 'B', text: '19', wrongExplanation: 'Recount: 16 + 8 + 0 + 0 + 1 = 25, not 19.' },
      { label: 'C', text: '17', wrongExplanation: 'Check your powers of 2: 2⁴=16, 2³=8, 2²=4, 2¹=2, 2⁰=1.' },
      { label: 'D', text: '33', wrongExplanation: 'That is too high; double-check the bit-to-power mapping.' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Binary</strong> is base 2, using only digits 0 and 1.</p>
        <p>Each digit (bit) represents a power of 2:</p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          <div>11001₂</div>
          <div className="text-gray-600">= 1×2⁴ + 1×2³ + 0×2² + 0×2¹ + 1×2⁰</div>
          <div className="text-gray-600">= 1×16 + 1×8 + 0×4 + 0×2 + 1×1</div>
          <div className="border-t border-gray-300 mt-1 pt-1">= 16 + 8 + 0 + 0 + 1 = 25₁₀</div>
        </div>
      </div>
    ),
    wrongExplanation: 'Multiply each bit by its power of 2 (starting from the right at 2⁰ = 1), then sum them.',
  },
  {
    title: 'Question 2 of 3 — Octal (Base 8)',
    prompt: <>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">352₈</code> in decimal?</>,
    options: [
      { label: 'A', text: '226' },
      { label: 'B', text: '234' },
      { label: 'C', text: '298', wrongExplanation: 'Check: (3 × 8²) + (5 × 8¹) + (2 × 8⁰) = 192 + 40 + 2 = 234, not 298.' },
      { label: 'D', text: '352', wrongExplanation: 'That is the octal representation; convert using powers of 8.' },
    ],
    correctLabel: 'B',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Octal</strong> is base 8, using digits 0–7.</p>
        <p>Each digit represents a power of 8:</p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          <div>352₈</div>
          <div className="text-gray-600">= 3×8² + 5×8¹ + 2×8⁰</div>
          <div className="text-gray-600">= 3×64 + 5×8 + 2×1</div>
          <div className="border-t border-gray-300 mt-1 pt-1">= 192 + 40 + 2 = 234₁₀</div>
        </div>
      </div>
    ),
    wrongExplanation: 'Use powers of 8: multiply each digit by 8 raised to its position (from right, starting at 0).',
  },
  {
    title: 'Question 3 of 3 — Hexadecimal (Base 16)',
    prompt: <>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">2C₁₆</code> in decimal?</>,
    options: [
      { label: 'A', text: '44' },
      { label: 'B', text: '32', wrongExplanation: 'Remember C = 12 in decimal; add 12 to 32 to get 44.' },
      { label: 'C', text: '212', wrongExplanation: 'Do not treat 2C as decimal digits; use hex-to-decimal conversion.' },
      { label: 'D', text: '28', wrongExplanation: '(2 × 16) + 12 = 32 + 12 = 44, not 28.' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Hexadecimal</strong> is base 16, using digits 0–9 and letters A–F (where A=10, B=11, C=12, D=13, E=14, F=15).</p>
        <p>Each digit represents a power of 16:</p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          <div>2C₁₆</div>
          <div className="text-gray-600">= 2×16¹ + C×16⁰</div>
          <div className="text-gray-600">= 2×16 + 12×1</div>
          <div className="border-t border-gray-300 mt-1 pt-1">= 32 + 12 = 44₁₀</div>
        </div>
      </div>
    ),
    wrongExplanation: 'Remember: A=10, B=11, C=12, D=13, E=14, F=15. Use powers of 16 to convert.',
  },
];

export function TabInterpreting() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];
  const isCorrect = selectedOption === currentQuestion.correctLabel;

  const handleSubmit = () => {
    setSubmitted(true);
    recordActivityOutcome('binary-arithmetic', 'question', isCorrect ? 'correct' : 'incorrect', isCorrect ? 1 : 0, 1, 'interpreting');
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
      {/* Quiz block */}
      <Card variant="practice" title="Practice: Number system interpretation">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Convert the given number to decimal. Each question explores a different number base.
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
                  name="base-conversion-quiz"
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

      {/* Simulation */}
      <Card variant="simulation" title="Live base converter">
        <p className="text-sm text-gray-700 mb-4">
          Click any bit to toggle it. The decimal, octal, and hex representations update instantly. All values are interpreted as <strong>unsigned</strong> (range 0–255).
        </p>
        <BaseConverter />
      </Card>

      <InfoNote>
        Octal groups bits into threes (8 = 2³); hexadecimal groups bits into fours (16 = 2⁴). Both are compact shorthand for binary — no conversion arithmetic needed, only grouping.
      </InfoNote>
    </div>
  );
}
