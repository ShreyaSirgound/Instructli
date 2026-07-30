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

export type AnalyticsSummary = {
  clicks: number;
  visits: number;
  questionAttempts: number;
  simulationAttempts: number;
  averageAccuracy: number;
  moduleStats: ModuleAnalytics[];
};

function postEvent(input: {
  module?: string;
  type: AnalyticsActivityType;
  outcome?: 'correct' | 'incorrect' | 'partial';
  score?: number;
  maxScore?: number;
  detail?: string;
}) {
  if (typeof window === 'undefined') return;

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    keepalive: true,
  }).catch(() => {});
}

export function recordAnalyticsVisit(module?: string) {
  postEvent({ module, type: 'visit' });
}

export function recordAnalyticsClick(module?: string) {
  postEvent({ module, type: 'click' });
}

export function recordActivityOutcome(
  module: string,
  activityType: 'question' | 'simulation',
  outcome: 'correct' | 'incorrect' | 'partial',
  score: number,
  maxScore: number,
  detail?: string
) {
  postEvent({ module, type: activityType, outcome, score, maxScore, detail });
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch('/api/analytics');
  if (!res.ok) {
    throw new Error('Failed to load analytics summary');
  }
  const data = await res.json();
  return data.summary as AnalyticsSummary;
}
