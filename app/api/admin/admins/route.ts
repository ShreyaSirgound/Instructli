import { NextRequest } from 'next/server';
import {
  addAdminUser,
  getAdminSessionPayload,
  getAllowedAdminUsers,
  listAdminUsers,
} from '@/lib/auth/session';

export async function GET() {
  const session = await getAdminSessionPayload();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dynamicAdmins = await listAdminUsers();
    const seedAdmins = Array.from(getAllowedAdminUsers()).sort();
    return Response.json({ seedAdmins, dynamicAdmins });
  } catch {
    return Response.json({ error: 'Failed to load admins.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionPayload();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { identity } = await req.json().catch(() => ({ identity: null }));
  if (!identity || typeof identity !== 'string') {
    return Response.json({ error: 'A utorid or email is required.' }, { status: 400 });
  }

  try {
    const normalized = await addAdminUser(identity, session.identity ?? 'unknown');
    return Response.json({ ok: true, identity: normalized });
  } catch {
    return Response.json({ error: 'Failed to add admin.' }, { status: 500 });
  }
}
