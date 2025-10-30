import prisma from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
  try {
    // Get all candidates with their vote counts
    const candidates = await prisma.candidate.findMany({
      include: {
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

    // Get total vote count
    const totalVotes = await prisma.vote.count();

    // Format results
    const results = candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      voteCount: candidate._count.votes,
      percentage: totalVotes > 0 
        ? ((candidate._count.votes / totalVotes) * 100).toFixed(2)
        : 0,
    }));

    return successResponse({
      results,
      totalVotes,
      totalCandidates: candidates.length,
    });
  } catch (error) {
    console.error('Get results error:', error);
    return errorResponse('Internal server error', 500);
  }
}