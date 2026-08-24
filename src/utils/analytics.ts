export type AnalyticsActivityType = 'visit' | 'click' | 'question' | 'simulation';

export type ModuleAnalytics = {
  module: string;
  title: string;
  clicks: number;
  visits: number;
  questionAttempts: number;
  simulationAttempts: number;
  averageScore: number;
  trend: Array<{ day: string; count: number }>;
};

export type StudentAnalytics = {
  studentId: string;
  label: string;
  isKnown: boolean;
  clicks: number;
  visits: number;
  questionAttempts: number;
  simulationAttempts: number;
  averageAccuracy: number;
  modulesTouched: string[];
  lastActiveAt: string | null;
  trend: Array<{ day: string; attempts: number; accuracy: number | null }>;
};

export type ItemAnalytics = {
  id: string;
  type: 'question' | 'simulation';
  title: string;
  moduleName: string;
  attempts: number;
  accuracy: number;
  rating: 'Easy' | 'Medium' | 'Hard' | 'Too Hard';
};

export type AnalyticsSummary = {
  clicks: number;
  visits: number;
  questionAttempts: number;
  simulationAttempts: number;
  averageAccuracy: number;
  weeklyVisits: number;
  weeklyVisitsChangePct: number | null;
  weeklyAvgAccuracy: number;
  weeklyAccuracyChangePct: number | null;
  totalAttempts: number;
  avgAttemptsPerStudent: number;
  moduleStats: ModuleAnalytics[];
  studentStats: StudentAnalytics[];
  itemStats: ItemAnalytics[];
};

const POST_RETRY_DELAY_MS = 600;
const POST_MAX_ATTEMPTS = 2;

async function postEvent(
  input: {
    module?: string;
    type: AnalyticsActivityType;
    outcome?: 'correct' | 'incorrect' | 'partial';
    score?: number;
    maxScore?: number;
    detail?: string;
  },
  attempt = 1
): Promise<void> {
  if (typeof window === 'undefined') return;

  let res: Response | undefined;
  try {
    res = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      keepalive: true,
    });
    if (res.ok) return;
  } catch {
    // network error, fall through to retry/log below
  }

  if (attempt < POST_MAX_ATTEMPTS) {
    await new Promise((resolve) => setTimeout(resolve, POST_RETRY_DELAY_MS));
    return postEvent(input, attempt + 1);
  }

  console.error('[analytics] failed to record event', {
    type: input.type,
    module: input.module,
    status: res?.status,
  });
}

export function recordAnalyticsVisit(module?: string) {
  void postEvent({ module, type: 'visit' });
}

export function recordAnalyticsClick(module?: string) {
  void postEvent({ module, type: 'click' });
}

export function recordActivityOutcome(
  module: string,
  activityType: 'question' | 'simulation',
  outcome: 'correct' | 'incorrect' | 'partial',
  score: number,
  maxScore: number,
  detail?: string
) {
  void postEvent({ module, type: activityType, outcome, score, maxScore, detail });
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch('/api/analytics');
  if (!res.ok) {
    throw new Error('Failed to load analytics summary');
  }
  const data = await res.json();
  return data.summary as AnalyticsSummary;
}