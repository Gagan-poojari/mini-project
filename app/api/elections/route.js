import prisma from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/utils';

// GET all elections (or active elections)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const now = new Date();
    
    const where = activeOnly
      ? {
          startDate: { lte: now },
          endDate: { gte: now },
        }
      : {};

    const elections = await prisma.election.findMany({
      where,
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return successResponse(elections);
  } catch (error) {
    console.error('Get elections error:', error);
    return errorResponse('Internal server error', 500);
  }
}