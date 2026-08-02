import { NextRequest } from 'next/server';

const NAME_HEADERS = [
  'x-shib-displayname',
  'x-shibboleth-displayname',
  'x-remote-user-name',
  'x-remote-user',
  'x-forwarded-user',
  'displayname',
  'name',
  'remote_user',
  'eppn',
  'uid',
];

function normalizeName(rawValue: string | null): string | null {
  if (!rawValue) return null;
  const value = rawValue.trim();
  if (!value) return null;

  if (value.includes('@')) {
    const local = value.split('@')[0];
    const parts = local.split(/[.\-_]/).filter(Boolean);
    if (parts.length > 1) {
      return parts.map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
    }
    return local;
  }

  return value;
}

export async function GET(req: NextRequest) {
  const name = NAME_HEADERS.reduce<string | null>((found, headerName) => {
    if (found) return found;
    return normalizeName(req.headers.get(headerName));
  }, null);

  return Response.json({ name });
}
