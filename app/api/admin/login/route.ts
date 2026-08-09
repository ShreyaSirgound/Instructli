import { NextRequest } from 'next/server';
import {
  createAdminSessionToken,
  getAllowedAdminUsers,
  getShibbolethHeaderValues,
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
  let allowedUsers: Set<string>;
  try {
    allowedUsers = getAllowedAdminUsers();
  } catch {
    return Response.json(
      { error: 'Server is missing ADMIN_SHIBBOLETH_ALLOWED_USERS' },
      { status: 500 }
    );
  }
  const headerValues = getShibbolethHeaderValues(req.headers);

  if (allowedUsers.size === 0) {
    return Response.json(
      { error: 'Server is missing ADMIN_SHIBBOLETH_ALLOWED_USERS' },
      { status: 500 }
    );
  }

  if (!identity) {
    return Response.json(
      {
        error:
          'Shibboleth identity was not detected. Ensure your proxy passes a stable identity header such as eppn, uid, mail, or remote_user.',
        detectedHeaders: headerValues,
      },
      { status: 403 }
    );
  }

  if (!isAllowedShibbolethAdmin(req.headers)) {
    return Response.json(
      {
        error:
          'Your Shibboleth identity is not on the admin whitelist. Confirm the utorid or email listed in ADMIN_SHIBBOLETH_ALLOWED_USERS.',
        identity,
        allowedUserCount: allowedUsers.size,
      },
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
