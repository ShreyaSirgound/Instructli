import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = '7d';

const SHIBBOLETH_IDENTITY_HEADERS = [
  'x-shib-eppn',
  'x-shibboleth-eppn',
  'x-shib-uid',
  'x-shibboleth-uid',
  'x-shib-mail',
  'x-shibboleth-mail',
  'x-forwarded-email',
  'x-forwarded-user',
  'x-remote-user',
  'remote_user',
  'eppn',
  'uid',
  'mail',
  'user',
];

export function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a random string of 32+ characters in your environment variables.'
    );
  }
  return new TextEncoder().encode(secret);
}

function normalizeShibbolethIdentity(rawValue: string | null | undefined) {
  if (!rawValue) return null;
  const value = rawValue.trim();
  if (!value) return null;
  return value.toLowerCase();
}

export function getShibbolethIdentity(headers: Headers | null | undefined) {
  if (!headers) return null;

  for (const headerName of SHIBBOLETH_IDENTITY_HEADERS) {
    const value = headers.get(headerName);
    const normalized = normalizeShibbolethIdentity(value);
    if (normalized) return normalized;
  }

  return null;
}

const DEFAULT_ALLOWED_ADMIN_USERS = ['pasterhe'];

export function getAllowedAdminUsers(): Set<string> {
  const raw = process.env.ADMIN_SHIBBOLETH_ALLOWED_USERS ?? '';
  const values = raw
    ? raw
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    : DEFAULT_ALLOWED_ADMIN_USERS;

  return new Set(values);
}

export function isAllowedShibbolethAdmin(headers: Headers | null | undefined) {
  const identity = getShibbolethIdentity(headers);
  if (!identity) return false;
  const allowedUsers = getAllowedAdminUsers();
  return allowedUsers.has(identity);
}

export async function createAdminSessionToken(identity?: string) {
  const claims: { role: 'admin'; identity?: string } = { role: 'admin' };
  if (identity) claims.identity = identity;

  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function setAdminSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days, matches SESSION_DURATION
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<Response | null> {
  const ok = await isAdminSession();
  if (ok) return null;
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
