import prisma from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const resolvedParams = await params;
    const electionId = parseInt(resolvedParams.id);

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