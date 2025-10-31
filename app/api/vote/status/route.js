import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse('Not authenticated', 401);
    }

    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    if (!electionId) {
      return errorResponse('Election ID is required');
    }

    // Check if user has voted in this election
    const vote = await prisma.vote.findUnique({
      where: {
        voterId_electionId: {
          voterId: currentUser.id,
          electionId: parseInt(electionId),
        },
      },
      include: {
        candidate: {
          include: {
            party: true,
          },
        },
      },
    });

    return successResponse({
      hasVoted: !!vote,
      vote: vote,
    });
  } catch (error) {
    console.error('Get vote status error:', error);
    return errorResponse('Internal server error', 500);
  }
}