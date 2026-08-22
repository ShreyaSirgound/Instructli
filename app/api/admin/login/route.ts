import { NextRequest } from 'next/server';
import {
  createAdminSessionToken,
  getAllAllowedAdminIdentities,
  getShibbolethHeaderValues,
  getShibbolethIdentity,
  identityVariants,
  setAdminSessionCookie,
  setViewMode,
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
  const headerValues = getShibbolethHeaderValues(req.headers);

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

  const allowedUsers = await getAllAllowedAdminIdentities();
  if (allowedUsers.size === 0) {
    return Response.json(
      {
        error:
          'No admins are configured. Set ADMIN_SHIBBOLETH_ALLOWED_USERS or add an admin from the dashboard.',
      },
      { status: 500 }
    );
  }

  const isAllowed = Array.from(identityVariants(identity)).some((id) => allowedUsers.has(id));
  if (!isAllowed) {
    return Response.json(
      {
        error:
          'Your Shibboleth identity is not on the admin whitelist. Confirm the utorid or email listed in ADMIN_SHIBBOLETH_ALLOWED_USERS or the Manage Admins page.',
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
    // A fresh login always lands in the admin view, even if a previous
    // browser session had left viewMode set to 'student'.
    await setViewMode('admin');
  } catch {
    return Response.json(
      { error: 'Unable to establish admin session. Please verify server configuration.' },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, identity });
}
