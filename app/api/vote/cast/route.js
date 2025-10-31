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
    const { candidateId, electionId } = body;

    if (!candidateId || !electionId) {
      return errorResponse('Candidate ID and Election ID are required');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if election exists and is active
    const election = await prisma.election.findUnique({
      where: { id: parseInt(electionId) },
    });

    if (!election) {
      return errorResponse('Election not found', 404);
    }

    const now = new Date();
    if (now < election.startDate) {
      return errorResponse('Election has not started yet', 403);
    }

    if (now > election.endDate) {
      return errorResponse('Election has ended', 403);
    }

    // Check if user has already voted in this election
    const existingVote = await prisma.vote.findUnique({
      where: {
        voterId_electionId: {
          voterId: user.id,
          electionId: parseInt(electionId),
        },
      },
    });

    if (existingVote) {
      return errorResponse('You have already voted in this election', 403);
    }

    // Check if candidate exists and belongs to this election
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: parseInt(candidateId),
        electionId: parseInt(electionId),
      },
      include: {
        party: true,
      },
    });

    if (!candidate) {
      return errorResponse('Candidate not found in this election', 404);
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        voterId: user.id,
        electionId: parseInt(electionId),
        candidateId: parseInt(candidateId),
      },
      include: {
        candidate: {
          include: {
            party: true,
          },
        },
        election: true,
      },
    });

    return successResponse(
      {
        vote,
        message: `Successfully voted for ${vote.candidate.name} in ${vote.election.title}`,
      },
      'Vote cast successfully',
      201
    );
  } catch (error) {
    console.error('Cast vote error:', error);
    return errorResponse('Internal server error', 500);
  }
}