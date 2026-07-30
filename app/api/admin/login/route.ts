import { NextRequest } from 'next/server';
import { createAdminSessionToken, setAdminSessionCookie } from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  const { allowed, retryAfterSeconds } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: `Too many attempts. Try again in ${retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  const { passcode } = await req.json().catch(() => ({ passcode: '' }));

  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) {
    return Response.json({ error: 'Server is missing ADMIN_PASSCODE' }, { status: 500 });
  }

  if (typeof passcode !== 'string' || passcode !== expected) {
    return Response.json({ error: 'Incorrect passcode' }, { status: 401 });
  }

  resetRateLimit(ip);
  const token = await createAdminSessionToken();
  await setAdminSessionCookie(token);

  return Response.json({ ok: true });
}
