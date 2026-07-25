'use client';
import React, { useState } from 'react';
import { Card } from './Card';
import { colors } from './types';
import { recordActivityOutcome } from '../src/utils/analytics';

interface Option {
  label: string;
  text: string;
  wrongExplanation?: string;
}

interface PracticeQuestionProps {
  title: string;
  prompt: React.ReactNode;
  options: Option[];
  correctLabel: string;
  correctExplanation: string;
  wrongExplanation?: string;
}

export function PracticeQuestion({
  title,
  prompt,
  options,
  correctLabel,
  correctExplanation,
  wrongExplanation,
}: PracticeQuestionProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  function pick(label: string) {
    const correct = label === correctLabel;
    setChosen(label);
    setIsCorrect(correct);
    recordActivityOutcome('app', 'question', correct ? 'correct' : 'incorrect', correct ? 1 : 0, 1, title);
  }

  function borderStyle(label: string) {
    if (isCorrect === null) return {};
    if (isCorrect === true) {
      if (label === correctLabel) return { borderColor: colors.green.dark, backgroundColor: colors.green.light, color: colors.green.dark };
      return {};
    }
    if (isCorrect === false && label === chosen) return { borderColor: colors.red.dark, backgroundColor: colors.red.light, color: colors.red.dark };
    return {};
  }

  return (
    <Card variant="practice" title={title}>
      <div className="text-sm text-gray-700 leading-relaxed mb-4">{prompt}</div>

      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => pick(opt.label)}
            style={borderStyle(opt.label)}
            className="flex items-start gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-left text-gray-800 transition-all duration-150 hover:border-gray-300 hover:bg-gray-50"
          >
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold"
              style={isCorrect === true && opt.label === correctLabel ? { backgroundColor: colors.green.dark, color: '#fff' }
                   : isCorrect === false && opt.label === chosen       ? { backgroundColor: colors.red.dark,   color: '#fff' }
                   : {}}
            >
              {opt.label}
            </span>
            {opt.text}
          </button>
        ))}
      </div>

          {isCorrect !== null && (
            <div
              className="mt-4 rounded-2xl px-5 py-3 text-sm leading-relaxed"
              style={{
                backgroundColor: isCorrect ? colors.green.light : colors.yellow.light,
                color:           isCorrect ? colors.green.dark  : colors.yellow.dark,
              }}
            >
              <span className="font-semibold">{isCorrect ? 'Correct! ' : 'Incorrect. '}</span>
              {isCorrect
                ? correctExplanation
                : (options.find((o) => o.label === chosen)?.wrongExplanation ?? wrongExplanation ?? '')}
            </div>
          )}
    </Card>
  );
}