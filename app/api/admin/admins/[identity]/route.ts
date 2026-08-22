import { NextRequest } from 'next/server';
import {
  getAdminSessionPayload,
  getAllowedAdminUsers,
  identityVariants,
  normalizeShibbolethIdentity,
  removeAdminUser,
} from '@/lib/auth/session';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ identity: string }> }
) {
  const session = await getAdminSessionPayload();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { identity: rawIdentity } = await params;
  const normalized = normalizeShibbolethIdentity(decodeURIComponent(rawIdentity));
  if (!normalized) {
    return Response.json({ error: 'Invalid identity.' }, { status: 400 });
  }

  if (session.identity && identityVariants(session.identity).has(normalized)) {
    return Response.json({ error: "You can't remove your own admin access." }, { status: 400 });
  }

  if (getAllowedAdminUsers().has(normalized)) {
    return Response.json(
      {
        error:
          'This admin is defined in ADMIN_SHIBBOLETH_ALLOWED_USERS and can only be removed by editing that environment variable.',
      },
      { status: 400 }
    );
  }

  try {
    await removeAdminUser(normalized);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Failed to remove admin.' }, { status: 500 });
  }
}
