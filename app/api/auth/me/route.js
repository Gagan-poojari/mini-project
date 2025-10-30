import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse('Not authenticated', 401);
    }

    // Fetch fresh user data from database
    const voter = await prisma.voter.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        hasVoted: true,
        createdAt: true,
      },
    });

    if (!voter) {
      return errorResponse('User not found', 404);
    }

    return successResponse(voter);
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('Internal server error', 500);
  }
}