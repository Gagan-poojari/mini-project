import prisma from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/utils';

// GET all candidates
export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
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

// POST - Create new candidate (for admin/seeding)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, party } = body;

    if (!name || !party) {
      return errorResponse('Name and party are required');
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        party,
      },
    });

    return successResponse(candidate, 'Candidate created', 201);
  } catch (error) {
    console.error('Create candidate error:', error);
    return errorResponse('Internal server error', 500);
  }
}