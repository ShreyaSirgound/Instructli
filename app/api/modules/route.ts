import { NextRequest } from 'next/server';
import { supabasePublic } from '@/lib/supabase/public';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/session';

export type ModuleRow = {
  id: string;
  title: string;
  description: string;
  icon_key: string;
  icon_bg: string;
  bar_color: string;
  order_index: number;
  locked: boolean;
  hidden: boolean;
};

// Public: anyone (students, the homepage, the admin page) can read the
// current module list and its order/locked/hidden state. This is what
// makes the state "always reliably taken on a student's side view" —
// there's exactly one table both views read from.
export async function GET() {
  const { data, error } = await supabasePublic
    .from('modules')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ modules: data as ModuleRow[] });
}

// Admin only: reorder, lock/unlock, hide/show. Body shape:
//   { modules: [{ id, order_index, locked, hidden }, ...] }
// The admin page sends the full updated list after any drag or toggle.
export async function PATCH(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.modules)) {
    return Response.json({ error: 'Expected { modules: [...] }' }, { status: 400 });
  }

  const updates = body.modules as Array<Pick<ModuleRow, 'id' | 'order_index' | 'locked' | 'hidden'>>;

  // Upsert each row's mutable fields. Using the service role client here
  // bypasses RLS, which is why requireAdmin() above is not optional.
  const results = await Promise.all(
    updates.map((m) =>
      supabaseAdmin
        .from('modules')
        .update({
          order_index: m.order_index,
          locked: m.locked,
          hidden: m.hidden,
          updated_at: new Date().toISOString(),
        })
        .eq('id', m.id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return Response.json({ error: failed.error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
