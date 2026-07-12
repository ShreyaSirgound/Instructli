"use client";

import { useState, useMemo } from "react";

type CacheType = "direct-mapped" | "fully-associative" | "set-associative";
type ReplacementPolicy = "lru" | "random";

interface CacheConfig {
  type: CacheType;
  numBlocks: number;   // total blocks (= numSets * numWays)
  blockSizeWords: number;
  numWays: number;     // 1 = direct-mapped, numBlocks = fully-associative
  policy: ReplacementPolicy;
}

// One slot in the cache
interface CacheWay {
  valid: boolean;
  tag: number | null;
  lruCounter: number; // lower = least recently used
}

// Cache is stored as sets × ways: cache[setIndex][wayIndex]
type CacheState = CacheWay[][];

interface AccessResult {
  addr: number;
  setIndex: number;
  tag: number;
  hit: boolean;
  wayHit: number | null;       // which way was the hit (null on miss)
  evictedWay: number | null;   // which way was evicted (null on hit or empty install)
  evictedTag: number | null;
}

function numSets(config: CacheConfig): number {
  return config.numBlocks / config.numWays;
}

function decompose(
  addr: number,
  config: CacheConfig
): { blockAddr: number; setIndex: number; tag: number } {
  const blockAddr = Math.floor(addr / config.blockSizeWords);
  const sets = numSets(config);
  const setIndex = blockAddr % sets;
  const tag = Math.floor(blockAddr / sets);
  return { blockAddr, setIndex, tag };
}

function emptyCache(config: CacheConfig): CacheState {
  const sets = numSets(config);
  return Array.from({ length: sets }, () =>
    Array.from({ length: config.numWays }, () => ({
      valid: false,
      tag: null,
      lruCounter: 0,
    }))
  );
}

/**
 * Pick which way to evict when a set is full. LRU evicts the least-recently
 * used way (lowest counter); random picks uniformly among all ways in the
 * set (all are guaranteed valid here, since this is only called when there's
 * no empty way left).
 */
function pickEvictionWay(set: CacheWay[], policy: ReplacementPolicy): number {
  if (policy === "random") {
    return Math.floor(Math.random() * set.length);
  }
  return set.reduce(
    (lruIdx, w, i) => (w.lruCounter < set[lruIdx].lruCounter ? i : lruIdx),
    0
  );
}

/**
 * Simulate one cache access. Returns the result and the new cache state.
 */
function simulateAccess(
  state: CacheState,
  addr: number,
  config: CacheConfig
): { result: AccessResult; newState: CacheState } {
  const { setIndex, tag } = decompose(addr, config);
  const set = state[setIndex];

  // Check for hit
  const hitWayIdx = set.findIndex((w) => w.valid && w.tag === tag);
  const hit = hitWayIdx !== -1;

  // Deep-clone state
  const newState: CacheState = state.map((s) => s.map((w) => ({ ...w })));
  const newSet = newState[setIndex];

  let evictedWay: number | null = null;
  let evictedTag: number | null = null;
  let wayHit: number | null = null;

  if (hit) {
    wayHit = hitWayIdx;
    const maxCounter = Math.max(...newSet.map((w) => w.lruCounter));
    newSet[hitWayIdx].lruCounter = maxCounter + 1;
  } else {
    // Find an empty way first, otherwise evict per the configured policy
    const emptyWayIdx = newSet.findIndex((w) => !w.valid);
    const targetWayIdx =
      emptyWayIdx !== -1 ? emptyWayIdx : pickEvictionWay(newSet, config.policy);

    if (newSet[targetWayIdx].valid) {
      evictedWay = targetWayIdx;
      evictedTag = newSet[targetWayIdx].tag;
    }

    const maxCounter =
      newSet.length > 0 ? Math.max(...newSet.map((w) => w.lruCounter)) : 0;
    newSet[targetWayIdx] = { valid: true, tag, lruCounter: maxCounter + 1 };
  }

  return {
    result: { addr, setIndex, tag, hit, wayHit, evictedWay, evictedTag },
    newState,
  };
}

function generateAccessSequence(config: CacheConfig): number[] {
  const { blockSizeWords } = config;
  const sets = numSets(config);
  const ways = config.numWays;

  // Line A, B, C map to set 0; D maps to set 1
  const A = 0;           // set 0, tag 0
  const B = sets;        // set 0, tag 1  (conflict with A in direct-mapped)
  const C = sets * 2;    // set 0, tag 2  (conflict with A,B in direct-mapped; evicts in 1-way)
  const D = 1;           // set 1, tag 0  (different set, never conflicts)

  let pool: number[];

  if (ways === 1) {
    // Direct-mapped: A and B conflict, lots of opportunity for conflict misses
    pool = [A, D, A, B, A, B, D, C];
    // Expected: miss miss HIT miss miss HIT HIT miss
  } else if (ways >= sets) {
    // Fully-associative: conflicts only on capacity, LRU evicts oldest
    // Fill all ways with unique lines, then re-access them (hits), then overflow
    const lines = Array.from({ length: ways }, (_, i) => i * sets);
    const overflow = ways * sets; // one more than capacity
    pool = [...lines, lines[0], lines[1], overflow, lines[0]];
    // Expected: ways cold misses, then 2 hits, then capacity miss, then miss (evicted by LRU)
  } else {
    // Set-associative: partial conflicts
    pool = [A, B, D, A, B, C, A, D];
    // A and B both go to set 0; with 2 ways both fit -> hits. C evicts LRU from set 0.
  }

  return pool.map((b) => b * blockSizeWords);
}

function buildFeedback(result: AccessResult, config: CacheConfig): string {
  const { addr, setIndex, tag, hit, wayHit, evictedWay, evictedTag } = result;
  const sets = numSets(config);

  const locationDesc =
    config.type === "fully-associative"
      ? `tag ${tag}`
      : `set ${setIndex} (tag ${tag})`;

  if (hit) {
    const wayDesc = config.numWays > 1 ? ` in way ${wayHit}` : "";
    const bookkeepingDesc =
      config.numWays > 1
        ? config.policy === "lru"
          ? " — LRU counter updated."
          : " — no recency bookkeeping needed under random replacement."
        : ".";
    return `Hit! Addr ${addr} maps to ${locationDesc}. The cache holds tag ${tag}${wayDesc}${bookkeepingDesc}`;
  }

  const policyLabel = config.policy === "lru" ? "LRU" : "random";
  const installDesc =
    evictedTag !== null
      ? `Tag ${evictedTag} (way ${evictedWay}) was evicted (${policyLabel}). Tag ${tag} installed.`
      : `Empty slot found. Tag ${tag} installed.`;

  if (config.type === "direct-mapped") {
    return `Miss. Addr ${addr} → block ${Math.floor(addr / config.blockSizeWords)}, index ${setIndex} (= block % ${sets}), tag ${tag}. ${installDesc}`;
  }
  if (config.type === "fully-associative") {
    return `Miss. Addr ${addr} → tag ${tag} (no index bits — all ${config.numBlocks} ways searched). ${installDesc}`;
  }
  return `Miss. Addr ${addr} → set ${setIndex} (= block % ${sets}), tag ${tag}. ${config.numWays} ways searched. ${installDesc}`;
}

const DEFAULT_CONFIG: CacheConfig = {
  type: "direct-mapped",
  numBlocks: 4,
  blockSizeWords: 1,
  numWays: 1,
  policy: "lru",
};

export default function CacheTracer() {
  const [config, setConfig] = useState<CacheConfig>(DEFAULT_CONFIG);
  const [accessAddrs, setAccessAddrs] = useState<number[]>(() =>
    generateAccessSequence(DEFAULT_CONFIG)
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<AccessResult[]>([]);
  const [cacheState, setCacheState] = useState<CacheState>(() =>
    emptyCache(DEFAULT_CONFIG)
  );
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  const done = currentStep >= accessAddrs.length;
  const currentAddr = accessAddrs[currentStep];

  // Pre-compute what the simulator would say for the current step (without mutating state).
  // Memoized so that under the random policy, the eviction choice for a given step is settled
  // once (on step change) rather than being re-rolled on every unrelated re-render.
  const preview = useMemo(
    () => (!done ? simulateAccess(cacheState, currentAddr, config) : null),
    [currentStep, config, done]
  );
  const actuallyHit = preview?.result.hit ?? false;

  function handlePrediction(userSaidHit: boolean) {
    if (!preview) return;
    const { result, newState } = preview;

    setResults((prev) => [...prev, result]);
    setFeedback({
      correct: userSaidHit === result.hit,
      message: buildFeedback(result, config),
    });
    setCacheState(newState);
    setCurrentStep((s) => s + 1);
  }

  function applyConfig(newConfig: CacheConfig) {
    setConfig(newConfig);
    setCacheState(emptyCache(newConfig));
    setAccessAddrs(generateAccessSequence(newConfig));
    setResults([]);
    setCurrentStep(0);
    setFeedback(null);
  }

  function handleTypeChange(type: CacheType) {
    const numWays =
      type === "direct-mapped"
        ? 1
        : type === "fully-associative"
        ? config.numBlocks
        : Math.min(2, config.numBlocks); // 2-way set-associative default
    applyConfig({ ...config, type, numWays });
  }

  function handleBlocksChange(numBlocks: number) {
    const numWays =
      config.type === "direct-mapped"
        ? 1
        : config.type === "fully-associative"
        ? numBlocks
        : Math.min(config.numWays, numBlocks);
    applyConfig({ ...config, numBlocks, numWays });
  }

  function handleWaysChange(numWays: number) {
    applyConfig({ ...config, numWays });
  }

  function handlePolicyChange(policy: ReplacementPolicy) {
    applyConfig({ ...config, policy });
  }

  function handleReset() {
    applyConfig(config);
  }

  function rowStatus(i: number): "hit" | "miss" | "current" | "pending" {
    if (i < results.length) return results[i].hit ? "hit" : "miss";
    if (i === currentStep) return "current";
    return "pending";
  }

  const sets = numSets(config);
  const score = results.length > 0
    ? `${results.filter((r) => r.hit).length} hits / ${results.filter((r) => !r.hit).length} misses`
    : null;

  // Hint text for prediction prompt
  const hintText = (() => {
    if (!preview) return "";
    const { setIndex, tag } = preview.result;
    const set = cacheState[setIndex];
    const validTags = set.filter((w) => w.valid).map((w) => w.tag);

    if (config.type === "direct-mapped") {
      const slot = set[0];
      return `Addr ${currentAddr} maps to index ${setIndex} (tag ${tag}). Index ${setIndex} currently holds ${slot.valid ? `tag ${slot.tag}` : "nothing (invalid)"}.`;
    }
    if (config.type === "fully-associative") {
      return `Addr ${currentAddr} has tag ${tag}. Cache currently holds tags: [${validTags.join(", ") || "empty"}].`;
    }
    return `Addr ${currentAddr} maps to set ${setIndex} (tag ${tag}). Set ${setIndex} currently holds tags: [${validTags.join(", ") || "empty"}].`;
  })();

  return (
    <div style={styles.page}>
        <p style={styles.cardSubtitle}>
          Predict whether or not the following are hits or misses.
        </p>

        {/* Config */}
        <div style={styles.configRow}>
          <label style={styles.configLabel}>Type:</label>
          <select
            style={styles.configChip}
            value={config.type}
            onChange={(e) => handleTypeChange(e.target.value as CacheType)}
          >
            <option value="direct-mapped">direct-mapped</option>
            <option value="set-associative">set-associative</option>
            <option value="fully-associative">fully-associative</option>
          </select>

          <label style={styles.configLabel}>Blocks:</label>
          <select
            style={styles.configChip}
            value={config.numBlocks}
            onChange={(e) => handleBlocksChange(Number(e.target.value))}
          >
            {[2, 4, 8].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          {config.type === "set-associative" && (
            <>
              <label style={styles.configLabel}>Ways:</label>
              <select
                style={styles.configChip}
                value={config.numWays}
                onChange={(e) => handleWaysChange(Number(e.target.value))}
              >
                {[2, 4].filter((w) => w < config.numBlocks).map((w) => (
                  <option key={w} value={w}>{w}-way</option>
                ))}
              </select>
            </>
          )}

          <label style={styles.configLabel}>Block size:</label>
          <select
            style={styles.configChip}
            value={config.blockSizeWords}
            onChange={(e) => applyConfig({ ...config, blockSizeWords: Number(e.target.value) })}
          >
            {[1, 2, 4].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "word" : "words"}</option>
            ))}
          </select>

          {config.numWays > 1 && (
            <>
              <label style={styles.configLabel}>Replacement:</label>
              <select
                style={styles.configChip}
                value={config.policy}
                onChange={(e) => handlePolicyChange(e.target.value as ReplacementPolicy)}
              >
                <option value="lru">LRU</option>
                <option value="random">random</option>
              </select>
            </>
          )}
        </div>

        {/* Config summary pill */}
        <div style={styles.summaryPill}>
          {config.type === "direct-mapped" && `${config.numBlocks} sets × 1 way`}
          {config.type === "fully-associative" && `1 set × ${config.numBlocks} ways (${config.policy === "lru" ? "LRU" : "random"})`}
          {config.type === "set-associative" && `${sets} sets × ${config.numWays} ways (${config.policy === "lru" ? "LRU" : "random"})`}
          {" · "}block size {config.blockSizeWords} word{config.blockSizeWords > 1 ? "s" : ""}
        </div>

        <div style={styles.mainColumns}>
          {/* Access sequence */}
          <div style={styles.column}>
            <p style={styles.columnLabel}>ACCESS SEQUENCE</p>
            <div style={styles.accessList}>
              {accessAddrs.map((addr, i) => {
                const status = rowStatus(i);
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.accessRow,
                      ...(status === "hit" ? styles.accessRowHit : {}),
                      ...(status === "miss" ? styles.accessRowMiss : {}),
                      ...(status === "current" ? styles.accessRowCurrent : {}),
                      ...(status === "pending" ? styles.accessRowPending : {}),
                    }}
                  >
                    <span style={styles.addrLabel}>Addr {addr}</span>
                    <span
                      style={{
                        ...styles.resultBadge,
                        ...(status === "hit" ? styles.hitText : {}),
                        ...(status === "miss" ? styles.missText : {}),
                        ...(status === "current" ? styles.questionText : {}),
                      }}
                    >
                      {status === "hit" ? "hit" : status === "miss" ? "miss" : status === "current" ? "?" : "–"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cache state table */}
          <div style={styles.column}>
            <p style={styles.columnLabel}>CACHE STATE</p>
            <table style={styles.table}>
              <thead>
                <tr>
                  {config.type !== "fully-associative" && <th style={styles.th}>Set</th>}
                  <th style={styles.th}>Way</th>
                  <th style={styles.th}>Valid</th>
                  <th style={styles.th}>Tag</th>
                  {config.numWays > 1 && config.policy === "lru" && <th style={styles.th}>LRU</th>}
                </tr>
              </thead>
              <tbody>
                {cacheState.map((set, si) =>
                  set.map((way, wi) => {
                    const lastResult = results[results.length - 1];
                    const justUpdated =
                      lastResult &&
                      !lastResult.hit &&
                      lastResult.setIndex === si &&
                      (lastResult.evictedWay === wi ||
                        (lastResult.evictedWay === null && !cacheState[si][wi].valid));
                    const justHit =
                      lastResult &&
                      lastResult.hit &&
                      lastResult.setIndex === si &&
                      lastResult.wayHit === wi;

                    return (
                      <tr key={`${si}-${wi}`}>
                        {config.type !== "fully-associative" && wi === 0 && (
                          <td style={{ ...styles.td, ...styles.tdSet }} rowSpan={config.numWays}>
                            {si}
                          </td>
                        )}
                        <td style={styles.td}>{wi}</td>
                        <td style={styles.td}>{way.valid ? "1" : "0"}</td>
                        <td
                          style={{
                            ...styles.td,
                            ...(justUpdated ? styles.updatedCell : {}),
                            ...(justHit ? styles.hitCell : {}),
                          }}
                        >
                          {way.valid
                            ? justUpdated
                              ? `${way.tag} ← new`
                              : way.tag
                            : "–"}
                        </td>
                        {config.numWays > 1 && config.policy === "lru" && (
                          <td style={{ ...styles.td, ...styles.tdLru }}>
                            {way.valid ? way.lruCounter : "–"}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {score && (
              <div style={styles.scoreBox}>
                <span style={styles.scoreText}>{score}</span>
              </div>
            )}
          </div>
        </div>

        {/* Prediction prompt */}
        {!done && (
          <div style={styles.predictionSection}>
            <p style={styles.predictionLabel}>Your prediction</p>
            <p style={styles.predictionHint}>{hintText} Is this a hit or a miss?</p>
            <div style={styles.buttonRow}>
              <button style={styles.hitBtn} onClick={() => handlePrediction(true)}>Hit</button>
              <button style={styles.missBtn} onClick={() => handlePrediction(false)}>Miss</button>
            </div>
          </div>
        )}

        {done && (
          <div style={styles.predictionSection}>
            <p style={styles.predictionLabel}>
              🎉 Sequence complete! {results.filter((r) => r.hit).length}/{results.length} hits.
            </p>
            <div style={styles.buttonRow}>
              <button style={styles.hitBtn} onClick={handleReset}>Try Again</button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            style={{
              ...styles.feedbackBox,
              ...(feedback.correct ? styles.feedbackCorrect : styles.feedbackIncorrect),
            }}
          >
            <p style={styles.feedbackTitle}>
              {feedback.correct ? "✓ Correct!" : "✗ Incorrect!"}
            </p>
            <p style={styles.feedbackMsg}>{feedback.message}</p>
          </div>
        )}
      </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 999,
    backgroundColor: "#ede9fe",
    color: "#6d28d9",
    fontSize: "0.75rem",
    fontWeight: 500,
    marginBottom: "0.75rem",
  },
  cardTitle: { fontSize: "1.25rem", fontWeight: 700, color: "#111", margin: "0 0 0.25rem" },
  cardSubtitle: { color: "#555", fontSize: "0.9rem", margin: "0 0 1rem" },
  configRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: "0.75rem" },
  configLabel: { fontSize: "0.78rem", fontWeight: 600, color: "#666" },
  configChip: {
    padding: "4px 10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#333",
    cursor: "pointer",
    outline: "none",
  },
  summaryPill: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    backgroundColor: "#f0f4ff",
    color: "#3b5bdb",
    fontSize: "0.78rem",
    fontWeight: 500,
    marginBottom: "1.25rem",
  },
  mainColumns: { display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1.25rem" },
  column: { flex: 1, minWidth: 200 },
  columnLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: "0.6rem",
  },
  accessList: { display: "flex", flexDirection: "column", gap: 6 },
  accessRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: 7,
    border: "1px solid #e5e5e5",
    fontSize: "0.875rem",
  },
  accessRowHit: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  accessRowMiss: { backgroundColor: "#fff5f5", borderColor: "#fecaca" },
  accessRowCurrent: { backgroundColor: "#fff", borderColor: "#d1d5db" },
  accessRowPending: { backgroundColor: "#fafafa", borderColor: "#e5e7eb", opacity: 0.7 },
  addrLabel: { color: "#444", fontWeight: 500 },
  resultBadge: { fontWeight: 700, fontSize: "0.85rem", color: "#aaa" },
  hitText: { color: "#16a34a" },
  missText: { color: "#dc2626" },
  questionText: { color: "#6b7280" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  th: {
    textAlign: "left",
    color: "#888",
    fontWeight: 600,
    fontSize: "0.78rem",
    paddingBottom: 6,
    borderBottom: "1px solid #e5e5e5",
  },
  td: { padding: "6px 4px", color: "#444", borderBottom: "1px solid #f0f0f0" },
  tdSet: { fontWeight: 700, color: "#333", verticalAlign: "middle" },
  tdLru: { color: "#888", fontSize: "0.78rem" },
  updatedCell: { color: "#6d28d9", fontWeight: 700 },
  hitCell: { color: "#16a34a", fontWeight: 700 },
  scoreBox: {
    marginTop: 12,
    padding: "6px 10px",
    backgroundColor: "#f5f3ff",
    borderRadius: 6,
    display: "inline-block",
  },
  scoreText: { fontSize: "0.82rem", color: "#6d28d9", fontWeight: 600 },
  predictionSection: { marginTop: 8, paddingTop: 16, borderTop: "1px solid #f0f0f0" },
  predictionLabel: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 4, color: "#111" },
  predictionHint: { fontSize: "0.85rem", color: "#555", marginBottom: 12 },
  buttonRow: { display: "flex", gap: 10 },
  hitBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 8,
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    maxWidth: 260,
  },
  missBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#333",
    fontWeight: 600,
    fontSize: "0.95rem",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    maxWidth: 260,
  },
  feedbackBox: { marginTop: 16, padding: "12px 16px", borderRadius: 8 },
  feedbackCorrect: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" },
  feedbackIncorrect: { backgroundColor: "#fff7ed", border: "1px solid #fed7aa" },
  feedbackTitle: { fontWeight: 700, fontSize: "0.9rem", marginBottom: 4, color: "#111" },
  feedbackMsg: { fontSize: "0.85rem", color: "#555", margin: 0, lineHeight: 1.5 },
};