import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse('Not authenticated', 401);
    }

    // Get voter with their vote
    const voter = await prisma.voter.findUnique({
      where: { id: currentUser.id },
      include: {
        vote: {
          include: {
            candidate: true,
          },
        },
      },
    });

    if (!voter) {
      return errorResponse('Voter not found', 404);
    }

    return successResponse({
      hasVoted: voter.hasVoted,
      vote: voter.vote,
    });
  } catch (error) {
    console.error('Get vote status error:', error);
    return errorResponse('Internal server error', 500);
  }
}