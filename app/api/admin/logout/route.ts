import { clearAdminSessionCookie } from '@/lib/auth/session';

export async function POST() {
  await clearAdminSessionCookie();
  return Response.json({ ok: true });
}
