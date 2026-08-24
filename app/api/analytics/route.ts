import { NextRequest } from 'next/server';
import { supabasePublic } from '@/lib/supabase/public';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, getShibbolethIdentity } from '@/lib/auth/session';

type EventType = 'visit' | 'click' | 'question' | 'simulation';
type Outcome = 'correct' | 'incorrect' | 'partial';

type AnalyticsEventRow = {
  id: string;
  module: string;
  type: EventType;
  outcome: Outcome | null;
  score: number | null;
  max_score: number | null;
  detail: string | null;
  student_id: string | null;
  created_at: string;
};

const ALLOWED_TYPES: EventType[] = ['visit', 'click', 'question', 'simulation'];
const ALLOWED_OUTCOMES: Outcome[] = ['correct', 'incorrect', 'partial'];

const MODULE_LABELS: Record<string, string> = {
  'binary-arithmetic': 'Binary arithmetic',
  'single-cycle': 'Single cycle',
  pipeline: '5-stage pipeline',
  'machine-instructions': 'Machine instructions',
  hazards: 'Hazards and detection',
  caching: 'Caching',
  admin: 'Admin',
  app: 'Home',
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!ALLOWED_TYPES.includes(body?.type)) {
    return Response.json({ error: 'Invalid or missing type' }, { status: 400 });
  }
  if (body.outcome !== undefined && !ALLOWED_OUTCOMES.includes(body.outcome)) {
    return Response.json({ error: 'Invalid outcome' }, { status: 400 });
  }
  if (body.score !== undefined && (typeof body.score !== 'number' || !Number.isFinite(body.score))) {
    return Response.json({ error: 'Invalid score' }, { status: 400 });
  }
  if (body.maxScore !== undefined && (typeof body.maxScore !== 'number' || !Number.isFinite(body.maxScore))) {
    return Response.json({ error: 'Invalid maxScore' }, { status: 400 });
  }

  const moduleKey = typeof body.module === 'string' ? body.module.toLowerCase() : 'app';
  const studentId = getShibbolethIdentity(req.headers);

  const { error } = await supabasePublic.from('analytics_events').insert({
    module: moduleKey,
    type: body.type as EventType,
    outcome: body.outcome as Outcome | undefined,
    score: body.score,
    max_score: body.maxScore,
    detail: body.detail,
    student_id: studentId,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

async function fetchAllAnalyticsEvents(): Promise<{ data: AnalyticsEventRow[] | null; error: { message: string; code?: string; details?: string; hint?: string } | null }> {
  const PAGE_SIZE = 1000;
  let from = 0;
  const rows: AnalyticsEventRow[] = [];

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { data: null, error };

    rows.push(...((data as AnalyticsEventRow[]) ?? []));
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: rows, error: null };
}

function accuracyOf(rows: AnalyticsEventRow[]): number {
  const scored = rows.filter((e) => e.outcome === 'correct' || e.outcome === 'incorrect');
  if (scored.length === 0) return 0;
  return scored.filter((e) => e.outcome === 'correct').length / scored.length;
}

function ratingFromAccuracyPct(accuracyPct: number): 'Easy' | 'Medium' | 'Hard' | 'Too Hard' {
  if (accuracyPct >= 75) return 'Easy';
  if (accuracyPct >= 50) return 'Medium';
  if (accuracyPct >= 25) return 'Hard';
  return 'Too Hard';
}

function computeItemStats(events: AnalyticsEventRow[]) {
  const relevant = events.filter(
    (e) => (e.type === 'question' || e.type === 'simulation') && e.detail
  );

  const buckets = new Map<string, AnalyticsEventRow[]>();
  for (const e of relevant) {
    const key = `${e.module}::${e.type}::${e.detail}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(e);
  }

  const items = Array.from(buckets.entries()).map(([key, rows]) => {
    const [moduleKey, type, detail] = key.split('::');
    const accuracyPct = Number((accuracyOf(rows) * 100).toFixed(1));

    return {
      id: key,
      type: type as 'question' | 'simulation',
      title: detail,
      moduleName: MODULE_LABELS[moduleKey] ?? moduleKey,
      attempts: rows.length,
      accuracy: accuracyPct,
      rating: ratingFromAccuracyPct(accuracyPct),
    };
  });

  return items.sort((a, b) => b.attempts - a.attempts);
}

const UNKNOWN_STUDENT_KEY = '__unknown__';

function computeStudentStats(events: AnalyticsEventRow[]) {
  const buckets = new Map<string, AnalyticsEventRow[]>();

  for (const e of events) {
    const key = e.student_id ?? UNKNOWN_STUDENT_KEY;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(e);
  }

  const stats = Array.from(buckets.entries()).map(([studentId, studentEvents]) => {
    const clicks = studentEvents.filter((e) => e.type === 'click').length;
    const visits = studentEvents.filter((e) => e.type === 'visit').length;
    const questionAttempts = studentEvents.filter((e) => e.type === 'question').length;
    const simulationAttempts = studentEvents.filter((e) => e.type === 'simulation').length;

    const accuracyEntries = studentEvents.filter((e) => e.outcome === 'correct' || e.outcome === 'incorrect');
    const averageAccuracy =
      accuracyEntries.length > 0
        ? accuracyEntries.filter((e) => e.outcome === 'correct').length / accuracyEntries.length
        : 0;

    const modulesTouched = Array.from(
      new Set(studentEvents.map((e) => e.module).filter((m) => m !== 'app' && m !== 'admin'))
    );

    const lastActiveAt = studentEvents.reduce<string | null>(
      (latest, e) => (!latest || e.created_at > latest ? e.created_at : latest),
      null
    );

    const trend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const key = date.toISOString().slice(0, 10);
      const dayEvents = studentEvents.filter((e) => e.created_at.startsWith(key));

      const attempts = dayEvents.filter((e) => e.type === 'question' || e.type === 'simulation').length;
      const dayAccuracyEntries = dayEvents.filter((e) => e.outcome === 'correct' || e.outcome === 'incorrect');
      const accuracy =
        dayAccuracyEntries.length > 0
          ? dayAccuracyEntries.filter((e) => e.outcome === 'correct').length / dayAccuracyEntries.length
          : null;

      return {
        day: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        attempts,
        accuracy,
      };
    });

    const isKnown = studentId !== UNKNOWN_STUDENT_KEY;

    return {
      studentId,
      label: isKnown ? studentId : 'Unknown / no identity',
      isKnown,
      clicks,
      visits,
      questionAttempts,
      simulationAttempts,
      averageAccuracy,
      modulesTouched,
      lastActiveAt,
      trend,
    };
  });

  return stats.sort((a, b) => {
    if (a.isKnown !== b.isKnown) return a.isKnown ? -1 : 1;
    return (
      b.clicks + b.visits + b.questionAttempts + b.simulationAttempts -
      (a.clicks + a.visits + a.questionAttempts + a.simulationAttempts)
    );
  });
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data: events, error } = await fetchAllAnalyticsEvents();

  if (error || !events) {
    return Response.json(
      { error: error?.message ?? 'Unknown error', code: error?.code, details: error?.details, hint: error?.hint },
      { status: 500 }
    );
  }

  const clicks = events.filter((e) => e.type === 'click').length;
  const visits = events.filter((e) => e.type === 'visit').length;
  const questionAttempts = events.filter((e) => e.type === 'question').length;
  const simulationAttempts = events.filter((e) => e.type === 'simulation').length;

  const averageAccuracy = accuracyOf(events);

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const thisWeekStart = now - 7 * DAY_MS;
  const lastWeekStart = now - 14 * DAY_MS;

  const thisWeekEvents = events.filter((e) => new Date(e.created_at).getTime() >= thisWeekStart);
  const lastWeekEvents = events.filter((e) => {
    const t = new Date(e.created_at).getTime();
    return t >= lastWeekStart && t < thisWeekStart;
  });

  const weeklyVisits = thisWeekEvents.filter((e) => e.type === 'visit').length;
  const prevWeeklyVisits = lastWeekEvents.filter((e) => e.type === 'visit').length;
  const weeklyVisitsChangePct =
    prevWeeklyVisits > 0 ? ((weeklyVisits - prevWeeklyVisits) / prevWeeklyVisits) * 100 : null;

  const weeklyAvgAccuracy = accuracyOf(thisWeekEvents);
  const prevWeeklyAvgAccuracy = accuracyOf(lastWeekEvents);
  const weeklyAccuracyChangePct =
    lastWeekEvents.some((e) => e.outcome === 'correct' || e.outcome === 'incorrect')
      ? (weeklyAvgAccuracy - prevWeeklyAvgAccuracy) * 100
      : null;

  const totalAttempts = questionAttempts + simulationAttempts;
  const knownStudentCount = new Set(
    events.map((e) => e.student_id).filter((id): id is string => !!id)
  ).size;
  const avgAttemptsPerStudent = knownStudentCount > 0 ? totalAttempts / knownStudentCount : 0;

  const itemStats = computeItemStats(events);

  const moduleKeys = Array.from(new Set(events.map((e) => e.module))).filter(
    (m) => m !== 'app' && m !== 'admin'
  );

  const moduleStats = moduleKeys
    .map((moduleKey) => {
      const moduleEvents = events.filter((e) => e.module === moduleKey);
      const mClicks = moduleEvents.filter((e) => e.type === 'click').length;
      const mVisits = moduleEvents.filter((e) => e.type === 'visit').length;
      const mQuestions = moduleEvents.filter((e) => e.type === 'question').length;
      const mSimulations = moduleEvents.filter((e) => e.type === 'simulation').length;

      const scored = moduleEvents.filter(
        (e): e is AnalyticsEventRow & { score: number; max_score: number } =>
          typeof e.score === 'number' && typeof e.max_score === 'number'
      );
      const averageScore =
        scored.length > 0
          ? (scored.reduce((sum, e) => sum + e.score / e.max_score, 0) / scored.length) * 100
          : 0;

      const trend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const key = date.toISOString().slice(0, 10);
        const count = moduleEvents.filter((e) => (e.created_at as string).startsWith(key)).length;
        return { day: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }), count };
      });

      return {
        module: moduleKey,
        title: MODULE_LABELS[moduleKey] ?? moduleKey,
        clicks: mClicks,
        visits: mVisits,
        questionAttempts: mQuestions,
        simulationAttempts: mSimulations,
        averageScore: Number(averageScore.toFixed(1)),
        trend,
      };
    })
    .sort((a, b) => b.clicks + b.visits - (a.clicks + a.visits));

  const studentStats = computeStudentStats(events);

  return Response.json({
    summary: {
      clicks,
      visits,
      questionAttempts,
      simulationAttempts,
      averageAccuracy,
      weeklyVisits,
      weeklyVisitsChangePct,
      weeklyAvgAccuracy,
      weeklyAccuracyChangePct,
      totalAttempts,
      avgAttemptsPerStudent,
      moduleStats,
      studentStats,
      itemStats,
    },
  });
}