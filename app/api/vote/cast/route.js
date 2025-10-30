import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse('Not authenticated', 401);
    }

    const body = await request.json();
    const { candidateId } = body;

    if (!candidateId) {
      return errorResponse('Candidate ID is required');
    }

    // Check if voter exists and hasn't voted
    const voter = await prisma.voter.findUnique({
      where: { id: currentUser.id },
    });

    if (!voter) {
      return errorResponse('Voter not found', 404);
    }

    if (voter.hasVoted) {
      return errorResponse('You have already voted', 403);
    }

    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: parseInt(candidateId) },
    });

    if (!candidate) {
      return errorResponse('Candidate not found', 404);
    }

    // Create vote and update voter in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create vote
      const vote = await tx.vote.create({
        data: {
          voterId: voter.id,
          candidateId: parseInt(candidateId),
        },
        include: {
          candidate: true,
        },
      });

      // Update voter's hasVoted status
      await tx.voter.update({
        where: { id: voter.id },
        data: { hasVoted: true },
      });

      return vote;
    });

    return successResponse(
      {
        vote: result,
        message: `Successfully voted for ${result.candidate.name}`,
      },
      'Vote cast successfully',
      201
    );
  } catch (error) {
    console.error('Cast vote error:', error);
    return errorResponse('Internal server error', 500);
  }
}