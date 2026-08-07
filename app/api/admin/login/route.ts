import { NextRequest } from 'next/server';
import {
  createAdminSessionToken,
  getAllowedAdminUsers,
  getShibbolethIdentity,
  isAllowedShibbolethAdmin,
  setAdminSessionCookie,
} from '@/lib/auth/session';
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

  const identity = getShibbolethIdentity(req.headers);
  const allowedUsers = getAllowedAdminUsers();

  if (allowedUsers.size === 0) {
    return Response.json(
      { error: 'Server is missing ADMIN_SHIBBOLETH_ALLOWED_USERS' },
      { status: 500 }
    );
  }

  if (!identity || !isAllowedShibbolethAdmin(req.headers)) {
    return Response.json(
      { error: 'You do not have admin access permission.' },
      { status: 403 }
    );
  }

  resetRateLimit(ip);

  try {
    const token = await createAdminSessionToken(identity);
    await setAdminSessionCookie(token);
  } catch {
    return Response.json(
      { error: 'Unable to establish admin session. Please verify server configuration.' },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, identity });
}
