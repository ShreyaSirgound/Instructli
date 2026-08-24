'use client';
import React, { useState } from 'react';
import { recordActivityOutcome } from '../../src/utils/analytics';
import { Card } from '../Card';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

interface ExpectedValues {
  [key: string]: number | string;
}

interface InstructionQuestionProps {
  instruction: string;
  format: 'R-format' | 'I-format' | 'S-format';
  expectedValues: ExpectedValues;
  hints: { [key: string]: string };
}

export function InstructionQuestion({
  instruction,
  format,
  expectedValues,
  hints,
}: InstructionQuestionProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const fields = Object.keys(expectedValues).filter(k => k !== 'hex');
  const getFieldLabel = (field: string): string => {
    const labels: { [key: string]: string } = {
      funct7: 'funct7 (bits 31:25)',
      rs2: 'rs2 (bits 24:20)',
      rs1: 'rs1 (bits 19:15)',
      funct3: 'funct3 (bits 14:12)',
      rd: 'rd (bits 11:7)',
      opcode: 'opcode (bits 6:0)',
      immediate: 'immediate (bits 31:20)',
      immediateLower: 'imm[4:0] (bits 11:7)',
      immediateUpper: 'imm[11:5] (bits 31:25)',
    };
    return labels[field] || field;
  };

  const checkAnswer = (field: string, value: string): boolean => {
    const expected = expectedValues[field];
    if (typeof expected === 'number') {
      return parseInt(value, 10) === expected;
    }
    return value.toLowerCase() === (expected as string).toLowerCase();
  };

  const allCorrect = fields.every(
    field => answers[field] && checkAnswer(field, answers[field])
  );

  const handleInputChange = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-mono font-bold text-lg text-gray-900">{instruction}</p>
          <p className="text-sm text-gray-600">{format}</p>
        </div>
        <button
          onClick={() => setShowHints(!showHints)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700"
        >
          {showHints ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {showHints ? 'Hide' : 'Show'} Hints
        </button>
      </div>

      {showHints && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="font-medium text-blue-900 text-sm mb-2">Hints:</p>
          <div className="space-y-1">
            {fields.map(field => (
              <div key={field} className="text-sm text-blue-800">
                <span className="font-mono font-medium">{field}:</span> {hints[field]}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {fields.map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getFieldLabel(field)}
            </label>
            <input
              type="text"
              placeholder="Enter value in decimal"
              value={answers[field] || ''}
              onChange={e => handleInputChange(field, e.target.value)}
              className={`w-full px-3 py-2 border rounded font-mono text-sm focus:outline-none transition-colors ${
                submitted && answers[field]
                  ? checkAnswer(field, answers[field])
                    ? 'border-green-500 bg-green-50 focus:border-green-600'
                    : 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 bg-white focus:border-blue-500'
              }`}
              disabled={submitted && allCorrect}
            />
            {submitted && answers[field] && (
              <div className="mt-1 flex items-center gap-1">
                {checkAnswer(field, answers[field]) ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Correct!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-xs text-red-600 font-medium">
                      Expected: {expectedValues[field]}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setSubmitted(true);
            recordActivityOutcome('machine-instructions', 'question', allCorrect ? 'correct' : 'incorrect', allCorrect ? 1 : 0, 1, instruction);
          }}
          disabled={!fields.every(f => answers[f]) || allCorrect}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            allCorrect
              ? 'bg-green-600 text-white'
              : fields.every(f => answers[f])
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          {allCorrect ? '✓ All Correct!' : 'Check Answers'}
        </button>

        {submitted && !allCorrect && (
          <button
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="px-4 py-2 rounded font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>

      {submitted && allCorrect && (
        <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="font-medium text-green-900 text-sm mb-1">Excellent!</p>
          <p className="text-sm text-green-800">
            Machine code (hex): <span className="font-mono font-semibold">{expectedValues.hex}</span>
          </p>
        </div>
      )}
    </div>
  );
}
