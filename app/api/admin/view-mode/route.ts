import { NextRequest } from 'next/server';
import { getAdminSessionPayload, setViewMode } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const session = await getAdminSessionPayload();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { mode } = await req.json().catch(() => ({ mode: null }));
  if (mode !== 'admin' && mode !== 'student') {
    return Response.json({ error: "mode must be 'admin' or 'student'." }, { status: 400 });
  }

  await setViewMode(mode);
  return Response.json({ ok: true, viewMode: mode });
}
