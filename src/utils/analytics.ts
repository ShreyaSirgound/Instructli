export type AnalyticsActivityType = 'visit' | 'click' | 'question' | 'simulation';

export type AnalyticsRecord = {
  id: string;
  module: string;
  type: AnalyticsActivityType;
  timestamp: string;
  outcome?: 'correct' | 'incorrect' | 'partial';
  score?: number;
  maxScore?: number;
  detail?: string;
};

export type AnalyticsData = {
  version: 1;
  clicks: number;
  visits: number;
  records: AnalyticsRecord[];
};

export type ModuleAnalytics = {
  module: string;
  title: string;
  clicks: number;
  visits: number;
  questionAttempts: number;
  simulationAttempts: number;
  correctAnswers: number;
  averageScore: number;
  trend: Array<{ day: string; count: number }>;
};

export type AnalyticsSummary = {
  clicks: number;
  visits: number;
  questionAttempts: number;
  simulationAttempts: number;
  averageAccuracy: number;
  moduleStats: ModuleAnalytics[];
};

const STORAGE_KEY = 'instructli-analytics-v1';
const EVENT_NAME = 'instructli:analytics-updated';

const MODULE_LABELS: Record<string, string> = {
  'binary-arithmetic': 'Binary arithmetic',
  'single-cycle': 'Single cycle',
  'pipeline': '5-stage pipeline',
  'machine-instructions': 'Machine instructions',
  'hazards': 'Hazards and detection',
  'caching': 'Caching',
  'admin': 'Admin',
  app: 'Home',
};

function safeParseAnalytics(raw: string | null): AnalyticsData {
  if (!raw) {
    return { version: 1, clicks: 0, visits: 0, records: [] };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AnalyticsData>;
    return {
      version: 1,
      clicks: parsed.clicks ?? 0,
      visits: parsed.visits ?? 0,
      records: Array.isArray(parsed.records) ? parsed.records : [],
    };
  } catch {
    return { version: 1, clicks: 0, visits: 0, records: [] };
  }
}

function saveAnalytics(data: AnalyticsData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

function normalizeModule(module: string) {
  return (module || 'app').toLowerCase();
}

export function recordAnalyticsEvent(input: {
  module?: string;
  type: AnalyticsActivityType;
  outcome?: AnalyticsRecord['outcome'];
  score?: number;
  maxScore?: number;
  detail?: string;
}) {
  if (typeof window === 'undefined') return;

  const data = safeParseAnalytics(window.localStorage.getItem(STORAGE_KEY));
  const module = normalizeModule(input.module ?? 'app');
  const record: AnalyticsRecord = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    module,
    type: input.type,
    timestamp: new Date().toISOString(),
    ...(input.outcome ? { outcome: input.outcome } : {}),
    ...(typeof input.score === 'number' ? { score: input.score } : {}),
    ...(typeof input.maxScore === 'number' ? { maxScore: input.maxScore } : {}),
    ...(input.detail ? { detail: input.detail } : {}),
  };

  data.records.push(record);
  if (input.type === 'click') data.clicks += 1;
  if (input.type === 'visit') data.visits += 1;

  saveAnalytics(data);
}

export function recordAnalyticsVisit(module?: string) {
  recordAnalyticsEvent({ module, type: 'visit' });
}

export function recordAnalyticsClick(module?: string) {
  recordAnalyticsEvent({ module, type: 'click' });
}

export function recordActivityOutcome(module: string, activityType: 'question' | 'simulation', outcome: 'correct' | 'incorrect' | 'partial', score: number, maxScore: number, detail?: string) {
  recordAnalyticsEvent({
    module,
    type: activityType,
    outcome,
    score,
    maxScore,
    detail,
  });
}

export function getAnalyticsSummary(): AnalyticsSummary {
  if (typeof window === 'undefined') {
    return {
      clicks: 0,
      visits: 0,
      questionAttempts: 0,
      simulationAttempts: 0,
      averageAccuracy: 0,
      moduleStats: [],
    };
  }

  const data = safeParseAnalytics(window.localStorage.getItem(STORAGE_KEY));
  const moduleMap = new Map<string, ModuleAnalytics>();

  data.records.forEach((record) => {
    const moduleKey = normalizeModule(record.module);
    const title = MODULE_LABELS[moduleKey] ?? moduleKey;
    const current = moduleMap.get(moduleKey) ?? {
      module: moduleKey,
      title,
      clicks: 0,
      visits: 0,
      questionAttempts: 0,
      simulationAttempts: 0,
      correctAnswers: 0,
      averageScore: 0,
      trend: [],
    };

    if (record.type === 'click') current.clicks += 1;
    if (record.type === 'visit') current.visits += 1;
    if (record.type === 'question') current.questionAttempts += 1;
    if (record.type === 'simulation') current.simulationAttempts += 1;

    if (record.outcome === 'correct') current.correctAnswers += 1;

    moduleMap.set(moduleKey, current);
  });

  const moduleStats = Array.from(moduleMap.values())
    .filter((entry) => entry.module !== 'app' && entry.module !== 'admin')
    .map((entry) => {
    const scores = data.records.filter((record) => record.module === entry.module && typeof record.score === 'number' && typeof record.maxScore === 'number').map((record) => (record.score ?? 0) / (record.maxScore ?? 1));
    const averageScore = scores.length > 0 ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
    const accuracy = entry.questionAttempts + entry.simulationAttempts > 0 ? entry.correctAnswers / (entry.questionAttempts + entry.simulationAttempts) : 0;
    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const count = data.records.filter((record) => record.module === entry.module && record.timestamp.startsWith(key)).length;
      return { day: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }), count };
    });

    return {
      ...entry,
      averageScore: Number((averageScore * 100).toFixed(1)),
      trend,
      correctAnswers: entry.correctAnswers,
      questionAttempts: entry.questionAttempts,
      simulationAttempts: entry.simulationAttempts,
      clicks: entry.clicks,
      visits: entry.visits,
      accuracy,
    };
  }).sort((a, b) => b.clicks + b.visits - (a.clicks + a.visits));

  const questionAttempts = data.records.filter((record) => record.type === 'question').length;
  const simulationAttempts = data.records.filter((record) => record.type === 'simulation').length;
  const accuracyEntries = data.records.filter((record) => record.outcome === 'correct' || record.outcome === 'incorrect');
  const averageAccuracy = accuracyEntries.length > 0 ? accuracyEntries.filter((record) => record.outcome === 'correct').length / accuracyEntries.length : 0;

  return {
    clicks: data.clicks,
    visits: data.visits,
    questionAttempts,
    simulationAttempts,
    averageAccuracy,
    moduleStats,
  };
}

export function subscribeToAnalytics(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
