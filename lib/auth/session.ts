import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const COOKIE_NAME = 'admin_session';
export const VIEW_MODE_COOKIE = 'admin_view_mode';
const SESSION_DURATION = '7d';
const ADMIN_USERS_TABLE = 'admin_users';

export type ViewMode = 'admin' | 'student';

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
  'email',
  'user',
];

const SHIBBOLETH_DEBUG_HEADERS = ['x-shib-displayname', 'x-shibboleth-displayname'];

export function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a random string of 32+ characters in your environment variables.'
    );
  }
  return new TextEncoder().encode(secret);
}

export function normalizeShibbolethIdentity(rawValue: string | null | undefined) {
  if (!rawValue) return null;
  const value = rawValue.trim();
  if (!value) return null;

  return value.toLowerCase().replace(/\s+/g, ' ');
}

export function identityVariants(rawValue: string | null | undefined): Set<string> {
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

export function getShibbolethHeaderValues(headers: Headers | null | undefined) {
  if (!headers) return {} as Record<string, string | null>;

  const values = SHIBBOLETH_IDENTITY_HEADERS.reduce<Record<string, string | null>>((acc, headerName) => {
    acc[headerName] = normalizeShibbolethIdentity(headers.get(headerName));
    return acc;
  }, {});

  for (const headerName of SHIBBOLETH_DEBUG_HEADERS) {
    values[headerName] = normalizeShibbolethIdentity(headers.get(headerName));
  }

  return values;
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
  const raw = process.env.ADMIN_SHIBBOLETH_ALLOWED_USERS?.trim() ?? '';
  if (!raw) return new Set();
  return parseAllowedAdminValues(raw);
}

export async function getDynamicAdminIdentities(): Promise<Set<string>> {
  try {
    const { data, error } = await supabaseAdmin.from(ADMIN_USERS_TABLE).select('identity');
    if (error || !data) return new Set();

    return data.reduce((set, row: { identity: string }) => {
      for (const variant of identityVariants(row.identity)) {
        set.add(variant);
      }
      return set;
    }, new Set<string>());
  } catch {
    return new Set();
  }
}

export async function getAllAllowedAdminIdentities(): Promise<Set<string>> {
  const merged = new Set(getAllowedAdminUsers());
  const dynamic = await getDynamicAdminIdentities();
  for (const id of dynamic) merged.add(id);
  return merged;
}

export async function isAllowedShibbolethAdmin(headers: Headers | null | undefined) {
  const identity = getShibbolethIdentity(headers);
  if (!identity) return false;

  const identities = identityVariants(identity);
  const allowedUsers = await getAllAllowedAdminIdentities();
  if (allowedUsers.size === 0) return false;

  for (const id of identities) {
    if (allowedUsers.has(id)) return true;
  }

  return false;
}

export async function listAdminUsers() {
  const { data, error } = await supabaseAdmin
    .from(ADMIN_USERS_TABLE)
    .select('identity, added_by, created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addAdminUser(identity: string, addedBy: string) {
  const normalized = normalizeShibbolethIdentity(identity);
  if (!normalized) throw new Error('Invalid identity');

  const { error } = await supabaseAdmin
    .from(ADMIN_USERS_TABLE)
    .upsert({ identity: normalized, added_by: addedBy }, { onConflict: 'identity' });

  if (error) {
    console.error('addAdminUser Supabase error:', error);
    throw error;
  }
  return normalized;
}

export async function removeAdminUser(identity: string) {
  const normalized = normalizeShibbolethIdentity(identity);
  if (!normalized) throw new Error('Invalid identity');

  const { error } = await supabaseAdmin.from(ADMIN_USERS_TABLE).delete().eq('identity', normalized);
  if (error) throw error;
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
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getViewMode(): Promise<ViewMode> {
  const store = await cookies();
  const value = store.get(VIEW_MODE_COOKIE)?.value;
  return value === 'student' ? 'student' : 'admin';
}

export async function setViewMode(mode: ViewMode) {
  const store = await cookies();
  store.set(VIEW_MODE_COOKIE, mode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearViewMode() {
  const store = await cookies();
  store.delete(VIEW_MODE_COOKIE);
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

export async function getAdminSessionPayload(): Promise<{ role: string; identity?: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== 'admin') return null;
    return payload as { role: string; identity?: string };
  } catch {
    return null;
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
