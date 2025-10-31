import prisma from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const electionId = parseInt(params.id);

    // Get election details
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return errorResponse('Election not found', 404);
    }

    // Get all candidates with their vote counts
    const candidates = await prisma.candidate.findMany({
      where: { electionId },
      include: {
        party: true,
        _count: {
          select: { votes: true },
        },
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
    });

    // Get total vote count for this election
    const totalVotes = await prisma.vote.count({
      where: { electionId },
    });

    // Format results
    const results = candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      profession: candidate.profession,
      education: candidate.education,
      party: candidate.party,
      voteCount: candidate._count.votes,
      percentage: totalVotes > 0 
        ? ((candidate._count.votes / totalVotes) * 100).toFixed(2)
        : 0,
    }));

    return successResponse({
      election,
      results,
      totalVotes,
      totalCandidates: candidates.length,
    });
  } catch (error) {
    console.error('Get results error:', error);
    return errorResponse('Internal server error', 500);
  }
}