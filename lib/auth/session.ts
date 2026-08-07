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
  'x-shib-displayname',
  'x-shibboleth-displayname',
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

  return value.toLowerCase().replace(/\s+/g, ' ');
}

const DEFAULT_ALLOWED_ADMIN_USERS = ['pasterhe', 'rhea.paste@mail.utoronto.ca'];

function identityVariants(rawValue: string | null | undefined): Set<string> {
  const normalized = normalizeShibbolethIdentity(rawValue);
  if (!normalized) return new Set();

  const ids = new Set<string>([normalized]);
  const atIndex = normalized.indexOf('@');
  if (atIndex > 0) {
    ids.add(normalized.slice(0, atIndex));
  }

  return ids;
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

function parseAllowedAdminValues(raw: string): Set<string> {
  return raw
    .split(/[\r\n,;]+/)
    .map((value) => normalizeShibbolethIdentity(value))
    .filter(Boolean)
    .reduce((set, value) => {
      set.add(value as string);
      const atIndex = value!.indexOf('@');
      if (atIndex > 0) {
        set.add((value as string).slice(0, atIndex));
      }
      return set;
    }, new Set<string>());
}

export function getAllowedAdminUsers(): Set<string> {
  const raw = process.env.ADMIN_SHIBBOLETH_ALLOWED_USERS ?? '';
  return raw ? parseAllowedAdminValues(raw) : parseAllowedAdminValues(DEFAULT_ALLOWED_ADMIN_USERS.join(','));
}

export function isAllowedShibbolethAdmin(headers: Headers | null | undefined) {
  const allowedUsers = getAllowedAdminUsers();
  if (allowedUsers.size === 0) return false;

  const identity = getShibbolethIdentity(headers);
  if (!identity) return false;

  const identities = identityVariants(identity);
  for (const id of identities) {
    if (allowedUsers.has(id)) return true;
  }

  return false;
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
