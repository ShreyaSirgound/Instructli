'use client';
import React, { useState } from 'react';
import { Card } from '../Card';
import { InfoNote } from '../InfoNote';

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
    title: 'Question 1 of 6 — Why Associativity Exists',
    prompt: 'What problem does set-associativity solve that a direct-mapped cache cannot?',
    options: [
      { label: 'A', text: 'Conflict misses — two frequently-used blocks mapping to the same index evict each other repeatedly' },
      { label: 'B', text: 'Compulsory misses — the first access to any block' },
      { label: 'C', text: 'The memory wall — slow DRAM access speeds' },
      { label: 'D', text: 'Capacity misses — the cache being too small overall' },
    ],
    correctLabel: 'A',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Conflict misses</strong> occur in direct-mapped caches when two blocks hash to the same index. They compete for the single slot, evicting each other repeatedly even if the cache has empty space elsewhere.</p>
        <p>A 2-way set associative cache allows two blocks to coexist in the same set, eliminating most conflict misses between pairs of addresses. Fully associative caches eliminate all conflict misses.</p>
      </div>
    ),
    wrongExplanation: 'Associativity targets conflict misses specifically — situations where direct-mapping forces frequently-needed blocks to kick each other out despite free space at other indices.',
  },
  {
    title: 'Question 2 of 6 — Degrees of Associativity',
    prompt: 'A cache stores 16 blocks total. If it is 4-way set associative, how many sets does it have?',
    options: [
      { label: 'A', text: '64 sets' },
      { label: 'B', text: '16 sets' },
      { label: 'C', text: '4 sets' },
      { label: 'D', text: '2 sets' },
    ],
    correctLabel: 'C',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Number of sets = Total blocks ÷ Associativity</strong></p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
          Sets = 16 blocks ÷ 4-way = <strong>4 sets</strong>
        </div>
        <p>Each set holds 4 blocks (ways). The index field selects 1 of the 4 sets; then all 4 ways are checked in parallel for a tag match.</p>
      </div>
    ),
    wrongExplanation: 'Sets = Total blocks ÷ Ways = 16 ÷ 4 = 4 sets. Each set contains 4 "ways" (slots), and any block can go in any of the 4 ways within its set.',
  },
  {
    title: 'Question 3 of 6 — Address Decomposition with Associativity',
    prompt: (
      <>
        A 2-way set associative cache has <strong>4 sets</strong> and <strong>8-byte blocks</strong>. For a 16-bit byte address, how many bits are the index?
      </>
    ),
    options: [
      { label: 'A', text: '1 bit (log₂ 2 = 1, for the associativity)' },
      { label: 'B', text: '2 bits (log₂ 4 = 2, for the sets)' },
      { label: 'C', text: '3 bits (log₂ 8 = 3, for the block size)' },
      { label: 'D', text: '4 bits (log₂ 16 = 4)' },
    ],
    correctLabel: 'B',
    correctExplanation: (
      <div className="space-y-2">
        <p>The index selects which <strong>set</strong> to look in — not which way. Associativity does not change the number of index bits.</p>
        <div className="rounded bg-gray-100 px-3 py-2 font-mono text-sm space-y-1">
          <div>Block offset = log₂(8 bytes) = <strong>3 bits</strong></div>
          <div>Index = log₂(4 sets) = <strong>2 bits</strong></div>
          <div>Tag = 16 − 3 − 2 = <strong>11 bits</strong></div>
        </div>
        <p>Compared to a direct-mapped cache with 8 sets and 8-byte blocks, increasing associativity halved the sets (fewer index bits) and increased tag bits. This wider tag lets the cache distinguish more possible occupants per set.</p>
      </div>
    ),
    wrongExplanation: 'The index selects which set to examine. Index bits = log₂(number of sets) = log₂(4) = 2. Associativity (ways per set) does not appear in the index.',
  },
  {
    title: 'Question 4 of 6 — LRU Replacement',
    prompt: 'A 2-way set associative cache uses LRU replacement. Set 0 holds blocks A (recently used) and B (older). Block C maps to set 0 and causes a miss. Which block is evicted?',
    options: [
      { label: 'A', text: 'Block A, because it was loaded most recently' },
      { label: 'B', text: 'Block B, because it was least recently used' },
      { label: 'C', text: 'Block C, because it is the new arrival' },
      { label: 'D', text: 'Either A or B randomly' },
    ],
    correctLabel: 'B',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>LRU (Least Recently Used)</strong> evicts the block that was accessed furthest in the past — the assumption is that recently-used blocks are more likely to be needed again soon (temporal locality).</p>
        <p>Block B is older (less recently used) than Block A, so LRU evicts B and installs C in its slot.</p>
      </div>
    ),
    wrongExplanation: 'LRU evicts the block not used for the longest time. Block B is older than A, so LRU chooses B for eviction. The recently-used block A is kept because it is more likely to be needed again.',
  },
  {
    title: 'Question 5 of 6 — Three Cs of Misses',
    prompt: 'A benchmark never fills the cache yet has many misses — the same cache lines are reloaded again and again at the same index. Which type of miss is this?',
    options: [
      { label: 'A', text: 'Compulsory miss — first access to new data' },
      { label: 'B', text: 'Capacity miss — cache is too small overall' },
      { label: 'C', text: 'Conflict miss — blocks at the same index evict each other' },
      { label: 'D', text: 'Coherence miss — multiple caches disagree on a value' },
    ],
    correctLabel: 'C',
    correctExplanation: (
      <div className="space-y-2">
        <p><strong>Conflict misses</strong> happen when two (or more) frequently-needed blocks share the same set in the cache, causing them to repeatedly evict each other — even though the cache has unused capacity elsewhere.</p>
        <p>The fix is to <strong>increase associativity</strong>: a 2-way or 4-way cache would allow both blocks to coexist in the same set.</p>
      </div>
    ),
    wrongExplanation: (
      <div className="space-y-2">
        <p>The three miss types:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li><strong>Compulsory:</strong> first ever access to that block</li>
          <li><strong>Capacity:</strong> working set too big for cache (all slots full)</li>
          <li><strong>Conflict:</strong> two blocks compete for the same index even though other indices are empty</li>
        </ul>
        <p>Since the cache never fills up but misses persist at the same lines, this is a <strong>conflict miss</strong>.</p>
      </div>
    ),
  },
  {
    title: 'Question 6 of 6 — Associativity Trade-offs',
    prompt: 'Compared to a direct-mapped cache of the same total size, a fully associative cache has:',
    options: [
      { label: 'A', text: 'Lower miss rate, lower hit time' },
      { label: 'B', text: 'Higher miss rate, lower hit time' },
      { label: 'C', text: 'Lower miss rate, but potentially higher hit time' },
      { label: 'D', text: 'No change in miss rate, higher hit time' },
    ],
    correctLabel: 'C',
    correctExplanation: (
      <div className="space-y-2">
        <p>Full associativity eliminates all conflict misses, so <strong>miss rate decreases</strong>.</p>
        <p>However, checking every slot in parallel requires N comparators (one per way) and a wider multiplexer to select data — this <strong>increases hit time</strong>.</p>
        <p>This trade-off is why real processors use moderate associativity (4-way, 8-way) rather than fully associative caches for performance-critical L1 caches.</p>
      </div>
    ),
    wrongExplanation: 'More associativity reduces conflict misses (lower miss rate) but requires more parallel comparators and a larger mux, which increases circuit complexity and therefore hit time.',
  },
];

export default function TabAssociativeCaching() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];
  const isCorrect = selectedOption === currentQuestion.correctLabel;

  function handleSubmit() {
    setSubmitted(true);
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
        <strong>Key concepts:</strong> Set-associative caches reduce conflict misses by allowing multiple blocks to occupy the same set (index). A <em>k</em>-way cache has <em>Total blocks ÷ k</em> sets. On a miss the <strong>replacement policy</strong> (LRU, random) selects which way to evict. The three miss types are <strong>Compulsory</strong> (cold start), <strong>Capacity</strong> (cache too small), and <strong>Conflict</strong> (index collision). Multilevel caches (L1, L2, L3) each target a different balance of hit time vs. miss rate.
      </InfoNote>

      {/* Worked Example 1 */}
      <Card variant="worked" title="LRU eviction in a 2-way set associative cache">
        <p className="text-sm text-gray-700 leading-relaxed">
          A <strong>2-way set associative</strong> cache has <strong>2 sets</strong>, 1 word per block, using LRU replacement. All entries start invalid.
          For a 2-set cache, bit 0 of the word address is the set index; remaining bits are the tag.
          Trace: <span className="font-mono bg-gray-100 rounded px-1">0, 8, 0, 6, 8</span>
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Addr</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Set</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Hit/Miss</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Cache state after access</th>
              </tr>
            </thead>
            <tbody>
              {[
                { addr: 0, set: 0, hm: 'Miss',                    cache: '[Tag=000 (Way 0)]',                        bg: 'bg-rose-50',    tc: 'text-rose-700' },
                { addr: 8, set: 0, hm: 'Miss',                    cache: '[Tag=000 (W0), Tag=100 (W1)]',             bg: 'bg-rose-50',    tc: 'text-rose-700' },
                { addr: 0, set: 0, hm: 'Hit',                     cache: '[Tag=000 (W0, MRU), Tag=100 (W1, LRU)]',  bg: 'bg-emerald-50', tc: 'text-emerald-700' },
                { addr: 6, set: 0, hm: 'Miss — evict LRU (100)', cache: '[Tag=000 (W0, LRU), Tag=011 (W1, MRU)]',  bg: 'bg-rose-50',    tc: 'text-rose-700' },
                { addr: 8, set: 0, hm: 'Miss — evict LRU (000)', cache: '[Tag=100 (W0, MRU), Tag=011 (W1, LRU)]',  bg: 'bg-rose-50',    tc: 'text-rose-700' },
              ].map((r, i) => (
                <tr key={i} className={r.bg}>
                  <td className="border border-gray-200 px-3 py-2 font-mono">{r.addr}</td>
                  <td className="border border-gray-200 px-3 py-2 font-mono">{r.set}</td>
                  <td className={`border border-gray-200 px-3 py-2 font-semibold ${r.tc}`}>{r.hm}</td>
                  <td className="border border-gray-200 px-3 py-2 font-mono text-xs">{r.cache}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">4 misses, 1 hit — miss rate = 80%</p>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">
              All three distinct word addresses (0, 8, 6) hash to set 0. With only 2 ways, the third distinct address must evict one of the first two — a <strong>conflict miss</strong>. A 3-way or fully associative cache would let all three coexist.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">LRU always evicts the oldest entry in the set</p>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">
              After addr 0 hits at step 3, it becomes MRU and tag 100 becomes LRU. When addr 6 arrives and causes a miss, tag 100 (LRU) is evicted — not tag 000 (MRU).
            </p>
          </div>
        </div>
      </Card>

      {/* Worked Example 2 */}
      <Card variant="worked" title="Adding an L2 cache to reduce the miss penalty">
        <p className="text-sm text-gray-700 leading-relaxed">
          A 4 GHz processor (cycle time = 0.25 ns) has base CPI = 1, an L1 miss rate of 2% per instruction, and main memory latency of 100 ns. We add an L2 cache with 5 ns access time and a 25% miss rate on L1 misses.
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">Step 1 — Convert latencies to cycles</p>
            <div className="mt-2 rounded bg-gray-100 px-3 py-2 font-mono text-sm space-y-1">
              <div>Main memory penalty = 100 ns / 0.25 ns = <strong>400 cycles</strong></div>
              <div>L2 access time &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= 5 ns / 0.25 ns &nbsp;= <strong>20 cycles</strong></div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">Step 2 — CPI with L1 only</p>
            <div className="mt-2 rounded bg-gray-100 px-3 py-2 font-mono text-sm space-y-1">
              <div className="text-gray-500">CPI = Base CPI + miss rate × miss penalty</div>
              <div>= 1 + 0.02 × 400 = <strong>9</strong></div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">Step 3 — CPI with L1 + L2</p>
            <p className="text-sm text-gray-600 mt-1">On an L1 miss, access L2 first (20 cycles). Only if L2 also misses do we pay the full 400-cycle penalty.</p>
            <div className="mt-2 rounded bg-gray-100 px-3 py-2 font-mono text-sm space-y-1">
              <div className="text-gray-500">Effective miss penalty = L2 time + (L2 miss rate × DRAM penalty)</div>
              <div>= 20 + (0.25 × 400) = <strong>120 cycles</strong> per L1 miss</div>
              <div className="mt-1">CPI = 1 + 0.02 × 120 = <strong>3.4</strong></div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              Speedup: 9 / 3.4 ≈ <strong>2.65×</strong>. The L2 intercepts 75% of L1 misses at 20 cycles instead of 400, dramatically reducing average memory latency.
            </p>
          </div>
        </div>
      </Card>

      {/* Practice Questions */}
      <Card variant="practice" title="Practice Questions — Associative Caching &amp; Performance">
        <div className="space-y-6">
          <p className="text-sm text-gray-700">Test your understanding of associativity, replacement policies, miss types, and multilevel cache performance.</p>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">{currentQuestion.title}</p>
            <div className="text-sm text-gray-700">{currentQuestion.prompt}</div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label key={option.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-500 transition cursor-pointer">
                <input
                  type="radio"
                  name="assoc-caching-q"
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Previous question
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
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
    </div>
  );
}
