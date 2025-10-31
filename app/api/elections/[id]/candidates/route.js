import prisma from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const electionId = parseInt(params.id);

    const candidates = await prisma.candidate.findMany({
      where: { electionId },
      include: {
        party: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    return errorResponse('Internal server error', 500);
  }
}