'use client';
import React, { useState } from 'react';
import { Card } from '../Card';
import { InfoNote } from '../InfoNote';
import { recordActivityOutcome } from '../../src/utils/analytics';

type QuizOption = {
  label: string;
  text: string;
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
    title: 'Question 1 of 6 — The Memory Wall',
    prompt: 'What is the "memory wall" problem in computer architecture?',
    options: [
      { label: 'A', text: 'Processor speed increased faster than memory access speed, making memory the bottleneck' },
      { label: 'B', text: 'Memory chips are physically too large to fit in a computer' },
      { label: 'C', text: 'Processor and memory speeds improved at exactly the same rate' },
      { label: 'D', text: 'Cache memory is always slower than main memory' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p>The <strong>memory wall</strong> describes the growing gap between processor speed and memory speed.</p>
        <p>As CPUs got faster, more processor cycles could execute before a single memory load completed. This means memory stalls became a larger fraction of total execution time — increasing the effective CPI.</p>
        <p>This is why Amdahl's Law points to the memory system as the highest-priority optimization target.</p>
      </div>
    ),
    wrongExplanation: 'The memory wall is a performance problem: processors became faster much more quickly than memory access times improved, so the processor spends increasing time waiting for data.',
  },
  {
    title: 'Question 2 of 6 — Locality',
    prompt: 'A program iterates through every element of a 1000-element array once. Which type(s) of locality does this exhibit?',
    options: [
      { label: 'A', text: 'Only temporal locality' },
      { label: 'B', text: 'Only spatial locality' },
      { label: 'C', text: 'Both temporal and spatial locality' },
      { label: 'D', text: 'Neither — arrays have no locality' },
    ],
    correctLabel: 'C',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Spatial locality:</strong> When one array element is accessed, nearby elements (stored at close addresses) will also be accessed soon after — the program moves sequentially through memory.</p>
        <p><strong>Temporal locality:</strong> The loop control variable and the loop instructions themselves are re-used repeatedly on every iteration.</p>
        <p>This combined locality is why caches work so well for array processing.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p>Array iteration shows <strong>both</strong> types of locality:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li><strong>Spatial:</strong> consecutive elements sit at consecutive addresses, so loading one block brings in several future elements.</li>
          <li><strong>Temporal:</strong> loop instructions and the loop variable are reused every iteration.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Question 3 of 6 — Cache Blocks',
    prompt: 'Why does a cache load an entire block (cache line) rather than just the single word requested?',
    options: [
      { label: 'A', text: 'Because main memory can only transfer data in large chunks' },
      { label: 'B', text: 'To exploit spatial locality — nearby words are likely to be accessed soon' },
      { label: 'C', text: 'To reduce the number of cache sets needed' },
      { label: 'D', text: 'Because processors can only address memory in 64-byte increments' },
    ],
    correctLabel: 'B',
    correctExplanation: (
      <div className="space-y-2">
        <p>Caches exploit <strong>spatial locality</strong> by fetching a whole block on every miss.</p>
        <p>If you access address A, addresses A+4, A+8, A+12, … are very likely to be needed soon (the next loop iteration, adjacent struct fields, sequential array elements, etc.).</p>
        <p>By prefetching the whole block at once, future accesses to those addresses become <strong>cache hits</strong> with no additional memory penalty.</p>
      </div>
    ),
    wrongExplanation: 'Fetching a block is a deliberate design choice, not a hardware constraint. It exploits spatial locality: words near the requested address are likely to be needed soon, so they are brought in proactively.',
  },
  {
    title: 'Question 4 of 6 — Address Decomposition',
    prompt: (
      <>
        A direct-mapped cache has <strong>8 sets</strong> and blocks hold <strong>4 words (16 bytes)</strong>.
        For a 32-bit byte address, how many bits are used for each field?
      </>
    ),
    options: [
      { label: 'A', text: 'Byte offset: 4 bits | Index: 3 bits | Tag: 25 bits' },
      { label: 'B', text: 'Byte offset: 4 bits | Index: 8 bits | Tag: 20 bits' },
      { label: 'C', text: 'Byte offset: 2 bits | Index: 3 bits | Tag: 27 bits' },
      { label: 'D', text: 'Byte offset: 3 bits | Index: 4 bits | Tag: 25 bits' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p>Address breakdown for a 32-bit address:</p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm space-y-1">
          <div><span className="text-blue-700">Block size</span> = 16 bytes → <span className="text-blue-700">byte offset</span> = log₂(16) = <strong>4 bits</strong></div>
          <div><span className="text-green-700">Sets</span> = 8 → <span className="text-green-700">index</span> = log₂(8) = <strong>3 bits</strong></div>
          <div><span className="text-purple-700">Tag</span> = 32 − 4 − 3 = <strong>25 bits</strong></div>
        </div>
        <p>The tag distinguishes which of the many possible blocks that map to the same index is currently stored there.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p>Use these rules:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li><strong>Byte offset bits</strong> = log₂(block size in bytes) = log₂(16) = 4</li>
          <li><strong>Index bits</strong> = log₂(number of sets) = log₂(8) = 3</li>
          <li><strong>Tag bits</strong> = total address bits − index − offset = 32 − 3 − 4 = 25</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Question 5 of 6 — Hit vs Miss',
    prompt: (
      <>
        A direct-mapped cache has 4 sets, 1 word per block. The current state has the tag at index <code className="rounded bg-gray-100 px-1 font-mono text-sm">10</code> set to <code className="rounded bg-gray-100 px-1 font-mono text-sm">01</code> (valid).
        Address <code className="rounded bg-gray-100 px-1 font-mono text-sm">01 10</code> is accessed (tag = 01, index = 10). Is this a hit or miss?
      </>
    ),
    options: [
      { label: 'A', text: 'Hit — the tag matches the stored tag at that index' },
      { label: 'B', text: 'Miss — index 10 is always empty at the start' },
      { label: 'C', text: 'Miss — the valid bit is 0' },
      { label: 'D', text: 'Hit — any access to a valid entry is a hit' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p>A cache <strong>hit</strong> requires two conditions:</p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>The valid bit (V) = 1 (the entry contains real data)</li>
          <li>The stored tag matches the tag from the incoming address</li>
        </ol>
        <p>Here, V = 1 and stored tag <code className="rounded bg-gray-100 px-1 font-mono">01</code> matches incoming tag <code className="rounded bg-gray-100 px-1 font-mono">01</code> → <strong>Hit!</strong></p>
      </div>
    ),
    wrongExplanation: 'A hit requires both: the valid bit must be 1 AND the stored tag must match the incoming address tag. Here both conditions hold at index 10.',
  },
  {
    title: 'Question 6 of 6 — AMAT',
    prompt: 'A cache has a hit time of 1 cycle and a miss penalty of 50 cycles. The miss rate is 4%. What is the Average Memory Access Time (AMAT)?',
    options: [
      { label: 'A', text: '2 cycles' },
      { label: 'B', text: '3 cycles' },
      { label: 'C', text: '51 cycles' },
      { label: 'D', text: '50 cycles' },
    ],
    correctLabel: 'B',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>AMAT = Hit Time + Miss Rate × Miss Penalty</strong></p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          <div>AMAT = 1 + 0.04 × 50</div>
          <div>AMAT = 1 + 2</div>
          <div className="border-t border-gray-300 mt-1 pt-1 font-medium">AMAT = 3 cycles</div>
        </div>
        <p>Even a modest 4% miss rate doubles the effective memory access time over a perfect cache (1 cycle), showing how impactful misses are on performance.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p>Use the formula: <strong>AMAT = Hit Time + Miss Rate × Miss Penalty</strong></p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          AMAT = 1 + (0.04 × 50) = 1 + 2 = <strong>3 cycles</strong>
        </div>
      </div>
    ),
  },
];

export default function TabCachingBasics() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];
  const isCorrect = selectedOption === currentQuestion.correctLabel;

  function handleSubmit() {
    setSubmitted(true);
    recordActivityOutcome('caching', 'question', isCorrect ? 'correct' : 'incorrect', isCorrect ? 1 : 0, 1, 'caching-basics');
  }

  function handleNext() {
    setQuestionIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
    setSelectedOption(null);
    setSubmitted(false);
  }

  function handlePrevious() {
    setQuestionIndex((prev) => (prev - 1 + QUIZ_QUESTIONS.length) % QUIZ_QUESTIONS.length);
    setSelectedOption(null);
    setSubmitted(false);
  }

  return (
    <div className="space-y-6">
      {/* Concept summary */}
      <InfoNote>
        <strong>Key concepts:</strong> The memory wall motivates caching. Caches exploit <em>spatial locality</em> (nearby addresses accessed together) and <em>temporal locality</em> (recently used data accessed again) to reduce average memory access time. A direct-mapped cache maps each block to exactly one set using <strong>index bits</strong>; a <strong>tag</strong> distinguishes which block currently occupies that set.
      </InfoNote>

      {/* Worked Example 1 */}
      <Card variant="worked" title="Tracing hits and misses in a direct-mapped cache">
        <p className="text-sm text-gray-700 leading-relaxed">
          A direct-mapped cache has <strong>8 sets, 1 word per block</strong>. Initially all entries are invalid.
          For an 8-set cache, the low 3 bits of the word address are the index; remaining upper bits are the tag.
        </p>
        <p className="text-sm text-gray-700 mt-3">Trace these accesses: <span className="font-mono bg-gray-100 rounded px-1">22, 26, 22, 26, 16, 3, 16</span></p>
        <div className="mt-4 overflow-x-auto">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Word Addr</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Binary (tag | index)</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Tag</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Index</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Hit/Miss</th>
              </tr>
            </thead>
            <tbody>
              {[
                { addr: 22, bin: '10 110', tag: '10', idx: '110', result: 'Miss', bg: 'bg-rose-50', tc: 'text-rose-700' },
                { addr: 26, bin: '11 010', tag: '11', idx: '010', result: 'Miss', bg: 'bg-rose-50', tc: 'text-rose-700' },
                { addr: 22, bin: '10 110', tag: '10', idx: '110', result: 'Hit',  bg: 'bg-emerald-50', tc: 'text-emerald-700' },
                { addr: 26, bin: '11 010', tag: '11', idx: '010', result: 'Hit',  bg: 'bg-emerald-50', tc: 'text-emerald-700' },
                { addr: 16, bin: '10 000', tag: '10', idx: '000', result: 'Miss', bg: 'bg-rose-50', tc: 'text-rose-700' },
                { addr: 3,  bin: '00 011', tag: '00', idx: '011', result: 'Miss', bg: 'bg-rose-50', tc: 'text-rose-700' },
                { addr: 16, bin: '10 000', tag: '10', idx: '000', result: 'Hit',  bg: 'bg-emerald-50', tc: 'text-emerald-700' },
              ].map((row, i) => (
                <tr key={i} className={row.bg}>
                  <td className="border border-gray-200 px-3 py-2 font-mono">{row.addr}</td>
                  <td className="border border-gray-200 px-3 py-2 font-mono">{row.bin}</td>
                  <td className="border border-gray-200 px-3 py-2 font-mono">{row.tag}</td>
                  <td className="border border-gray-200 px-3 py-2 font-mono">{row.idx}</td>
                  <td className={`border border-gray-200 px-3 py-2 font-medium ${row.tc}`}>{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-medium text-gray-900">4 misses, 3 hits — miss rate ≈ 57%</p>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">
              The first access to any address is always a <strong>compulsory miss</strong> — the block has never been in the cache.
              Subsequent accesses to the same address (22→22, 26→26, 16→16) are hits, showing temporal locality being exploited.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-medium text-gray-900">A hit requires two conditions</p>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">
              The valid bit (V) must be 1, and the stored tag at that index must match the incoming address tag.
              If either condition fails, it is a miss and the block is fetched from memory.
            </p>
          </div>
        </div>
      </Card>

      {/* Worked Example 2 */}
      <Card variant="worked" title="Calculating CPI with I-cache and D-cache misses">
        <p className="text-sm text-gray-700 leading-relaxed">
          A processor has base CPI = 2, I-cache miss rate = 2%, D-cache miss rate = 4%, miss penalty = 100 cycles, and 36% of instructions are loads/stores.
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-medium text-gray-900">Step 1 — Instruction cache stall cycles per instruction</p>
            <div className="mt-2 rounded bg-gray-100 px-3 py-2 font-mono text-sm space-y-1">
              <div className="text-gray-500">I-cache stalls = miss rate × miss penalty</div>
              <div>= 0.02 × 100 = <strong>2 cycles / instruction</strong></div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-medium text-gray-900">Step 2 — Data cache stall cycles per instruction</p>
            <p className="text-sm text-gray-600 mt-1">Only load/store instructions access data memory, so the miss rate is scaled by the fraction of such instructions.</p>
            <div className="mt-2 rounded bg-gray-100 px-3 py-2 font-mono text-sm space-y-1">
              <div className="text-gray-500">D-cache stalls = (load/store fraction) × miss rate × miss penalty</div>
              <div>= 0.36 × 0.04 × 100 = <strong>1.44 cycles / instruction</strong></div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-medium text-gray-900">Step 3 — Actual CPI</p>
            <div className="mt-2 rounded bg-gray-100 px-3 py-2 font-mono text-sm space-y-1">
              <div>Actual CPI = Base CPI + I-cache stalls + D-cache stalls</div>
              <div>= 2 + 2 + 1.44 = <strong>5.44</strong></div>
              <div className="text-gray-500 text-xs mt-1">Slowdown: 5.44 / 2 = 2.72× over ideal</div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              Cache misses more than doubled the CPI. This illustrates why even modest miss rates have outsized performance impact — and why Amdahl's Law points to the memory system as the top optimization target.
            </p>
          </div>
        </div>
      </Card>

      {/* Practice Questions */}
      <Card variant="practice" title="Practice Questions — Caching Fundamentals">
        <div className="space-y-6">
          <p className="text-sm text-gray-700">Test your understanding of locality, address decomposition, and cache performance.</p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">{currentQuestion.title}</p>
            <div className="text-sm text-gray-700">{currentQuestion.prompt}</div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label key={option.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-500 transition cursor-pointer">
                <input
                  type="radio"
                  name="caching-basics-q"
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Previous question
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
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
    </div>
  );
}
