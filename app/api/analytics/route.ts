import { NextRequest } from 'next/server';
import { supabasePublic } from '@/lib/supabase/public';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/session';

type EventType = 'visit' | 'click' | 'question' | 'simulation';
type Outcome = 'correct' | 'incorrect' | 'partial';

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
  if (!body?.type) {
    return Response.json({ error: 'Missing type' }, { status: 400 });
  }

  const { error } = await supabasePublic.from('analytics_events').insert({
    module: (body.module ?? 'app').toLowerCase(),
    type: body.type as EventType,
    outcome: body.outcome as Outcome | undefined,
    score: body.score,
    max_score: body.maxScore,
    detail: body.detail,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data: events, error } = await supabaseAdmin
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    {/*return Response.json({ error: error.message }, { status: 500 });*/}
    return Response.json(
      { error: error.message, code: error.code, details: error.details, hint: error.hint },
      { status: 500 }
    );
  }

  const clicks = events.filter((e) => e.type === 'click').length;
  const visits = events.filter((e) => e.type === 'visit').length;
  const questionAttempts = events.filter((e) => e.type === 'question').length;
  const simulationAttempts = events.filter((e) => e.type === 'simulation').length;

  const accuracyEntries = events.filter((e) => e.outcome === 'correct' || e.outcome === 'incorrect');
  const averageAccuracy =
    accuracyEntries.length > 0
      ? accuracyEntries.filter((e) => e.outcome === 'correct').length / accuracyEntries.length
      : 0;

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

      const scored = moduleEvents.filter((e) => typeof e.score === 'number' && typeof e.max_score === 'number');
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

  return Response.json({
    summary: {
      clicks,
      visits,
      questionAttempts,
      simulationAttempts,
      averageAccuracy,
      moduleStats,
    },
  });
}
