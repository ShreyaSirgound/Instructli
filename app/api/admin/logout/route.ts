import { clearAdminSessionCookie, clearViewMode } from '@/lib/auth/session';

export async function POST() {
  await clearAdminSessionCookie();
  await clearViewMode();
  return Response.json({ ok: true });
}
