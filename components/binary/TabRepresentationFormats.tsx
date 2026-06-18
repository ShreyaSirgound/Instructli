'use client';
import React, { useState } from 'react';
import { Card } from '../Card';

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
    title: 'Question 1 of 3 — Unsigned representation',
    prompt: <>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">1011 1110</code> in 8-bit unsigned?</>,
    options: [
      { label: 'A', text: '190' },
      { label: 'B', text: '128', wrongExplanation: 'That is only 2⁷; include all the other 1-bits: 64, 32, 16, 8, 4, 2.' },
      { label: 'C', text: '66', wrongExplanation: 'Recount the powers of 2: 128 + 32 + 16 + 8 + 4 + 2 = 190.' },
      { label: 'D', text: '-66', wrongExplanation: 'That is two\'s complement interpretation; unsigned only uses positive values.' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Unsigned binary</strong> only represents non-negative values (0 and positive). Every bit represents magnitude.</p>
        <p>With n bits, an unsigned integer can represent 0 to 2ⁿ − 1. For 8 bits: 0 to 255.</p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          <div>1011 1110 (unsigned 8-bit)</div>
          <div className="text-gray-600">= 128 + 32 + 16 + 8 + 4 + 2 = 190₁₀</div>
        </div>
        <p className="text-sm">8-bit unsigned range: 0 to 255</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p><strong>Unsigned representation rule:</strong> every bit contributes positive magnitude. There is no sign bit.</p>
        <p>With n bits, range is <code className="rounded bg-rose-100 px-1 py-0.5 text-xs font-mono">0</code> to <code className="rounded bg-rose-100 px-1 py-0.5 text-xs font-mono">2ⁿ − 1</code>. For 8 bits, that is <code className="rounded bg-rose-100 px-1 py-0.5 text-xs font-mono">0..255</code>.</p>
        <div className="rounded bg-rose-100 px-3 py-2 font-mono text-sm">
          <div>1011 1110</div>
          <div className="text-rose-700">= 128 + 32 + 16 + 8 + 4 + 2 = 190</div>
        </div>
        <p>Recompute by mapping each 1-bit to its power of 2 weight and summing.</p>
      </div>
    ),
  },
  {
    title: 'Question 2 of 3 — Sign-Magnitude representation',
    prompt: <>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">1011 1110</code> in 8-bit sign-magnitude?</>,
    options: [
      { label: 'A', text: '-62' },
      { label: 'B', text: '190 (unsigned)', wrongExplanation: 'This is the unsigned interpretation; in sign-magnitude, MSB=1 means negative.' },
      { label: 'C', text: '-66', wrongExplanation: 'That is two\'s complement; in sign-magnitude, just take the magnitude bits (ignore MSB sign bit).' },
      { label: 'D', text: '+62', wrongExplanation: 'MSB is 1, so the sign is negative. The magnitude is 32 + 16 + 8 + 4 + 2 = 62, so the value is -62.' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Sign-Magnitude</strong> uses the MSB as a sign bit (0 for positive, 1 for negative), and the remaining bits represent magnitude.</p>
        <p>In 8-bit sign-magnitude, the range is −127 to +127.</p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          <div>1011 1110</div>
          <div className="text-gray-600">MSB = 1 → negative</div>
          <div className="text-gray-600">Magnitude = 0011 1110 = 32+16+8+4+2 = 62</div>
          <div className="border-t border-gray-300 mt-1 pt-1">= -62</div>
        </div>
        <p className="text-sm text-rose-700"><strong>Note:</strong> Sign-magnitude is avoided in modern hardware because addition/subtraction require separate circuits and there are two zeros.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p><strong>Sign-magnitude rule:</strong> MSB is sign only (0 = positive, 1 = negative). Remaining bits are plain magnitude.</p>
        <div className="rounded bg-rose-100 px-3 py-2 font-mono text-sm">
          <div>1011 1110</div>
          <div className="text-rose-700">Sign bit = 1 → negative</div>
          <div className="text-rose-700">Magnitude = 011 1110 = 62</div>
          <div className="border-t border-rose-200 mt-1 pt-1">Value = -62</div>
        </div>
        <p>Do not invert bits here. Invert-and-add-1 is only for two's complement interpretation.</p>
        <p>This format is uncommon in modern processors because it has two zeros and requires extra arithmetic logic.</p>
      </div>
    ),
  },
  {
    title: 'Question 3 of 3 — Two\'s Complement representation',
    prompt: <>What is <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">1011 1110</code> in 8-bit two's complement?</>,
    options: [
      { label: 'A', text: '-190', wrongExplanation: 'Two\'s complement has a narrower negative range: only down to -128.' },
      { label: 'B', text: '-62', wrongExplanation: 'Check your conversion: invert 1011 1110 → 0100 0001, add 1 → 0100 0010 = 66, so the original is -66.' },
      { label: 'C', text: '-66' },
      { label: 'D', text: '-128', wrongExplanation: 'That is the minimum value (1000 0000); this bit pattern has more 1s.' },
    ],
    correctLabel: 'C',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Two's Complement</strong> is the standard for modern computers. The MSB has weight −2ⁿ⁻¹ (negative), and all other bits are positive.</p>
        <p>To find a negative number's magnitude, invert all bits and add 1 (or subtract from 2ⁿ).</p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          <div>1011 1110</div>
          <div className="text-gray-600">Invert → 0100 0001</div>
          <div className="text-gray-600">Add 1 → 0100 0010 = 66</div>
          <div className="border-t border-gray-300 mt-1 pt-1">So original = -66</div>
        </div>
        <p className="text-sm">8-bit two's complement range: −128 to +127. One zero, same adder for positive and negative.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p><strong>Two's complement rule:</strong> MSB has negative weight (for 8-bit: -128). Other bits remain positive weights.</p>
        <p>For a negative pattern, you can find magnitude by invert then add 1:</p>
        <div className="rounded bg-rose-100 px-3 py-2 font-mono text-sm">
          <div>1011 1110</div>
          <div className="text-rose-700">invert → 0100 0001</div>
          <div className="text-rose-700">+1 → 0100 0010 = 66</div>
          <div className="border-t border-rose-200 mt-1 pt-1">Value = -66</div>
        </div>
        <p>8-bit two's complement range is <code className="rounded bg-rose-100 px-1 py-0.5 text-xs font-mono">-128..+127</code>, and this is why one adder can handle both positive and negative arithmetic.</p>
      </div>
    ),
  },
];

export function TabRepresentationFormats() {
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

  return (
    <div>
      {/* Quiz block */}
      <Card variant="practice" title="Practice: Signed and unsigned representations">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Test your understanding of different binary representation formats: unsigned, sign-magnitude, and two's complement.
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
                  name="representation-formats-quiz"
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedOption === null || submitted}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Submit answer
            </button>
            {submitted && (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center rounded-full bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition"
              >
                {questionIndex === QUIZ_QUESTIONS.length - 1 ? 'Start over' : 'Next question'}
              </button>
            )}
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
    </div>
  );
}
