import { getViewMode, isAdminSession } from '@/lib/auth/session';

export async function GET() {
  const isAdmin = await isAdminSession();
  const viewMode = await getViewMode();
  return Response.json({ isAdmin, viewMode });
}
