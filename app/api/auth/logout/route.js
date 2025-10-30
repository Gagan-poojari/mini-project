import { clearAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/utils';

export async function POST() {
  await clearAuthCookie();
  return successResponse(null, 'Logged out successfully');
}