import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

async function requireAdmin() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return { error: errorResponse('Not authenticated', 401) };
  }
  
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
  });
  
  if (!user || user.role !== 'ADMIN') {
    return { error: errorResponse('Admin access required', 403) };
  }
  
  return { user };
}

// GET candidates (optionally filter by election)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    const where = electionId ? { electionId: parseInt(electionId) } : {};

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        party: true,
        election: true,
        _count: {
          select: { votes: true },
        },
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

// POST - Create new candidate (Admin only)
export async function POST(request) {
  const authCheck = await requireAdmin();
  if (authCheck.error) return authCheck.error;

  try {
    const body = await request.json();
    const { name, profession, education, partyId, electionId } = body;

    if (!name || !profession || !education || !partyId || !electionId) {
      return errorResponse('All fields are required');
    }

    // Verify party exists
    const party = await prisma.party.findUnique({
      where: { id: parseInt(partyId) },
    });

    if (!party) {
      return errorResponse('Party not found', 404);
    }

    // Verify election exists
    const election = await prisma.election.findUnique({
      where: { id: parseInt(electionId) },
    });

    if (!election) {
      return errorResponse('Election not found', 404);
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        profession,
        education,
        partyId: parseInt(partyId),
        electionId: parseInt(electionId),
      },
      include: {
        party: true,
        election: true,
      },
    });

    return successResponse(candidate, 'Candidate created successfully', 201);
  } catch (error) {
    console.error('Create candidate error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE candidate
export async function DELETE(request) {
  const authCheck = await requireAdmin();
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Candidate ID is required');
    }

    await prisma.candidate.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(null, 'Candidate deleted successfully');
  } catch (error) {
    console.error('Delete candidate error:', error);
    return errorResponse('Internal server error', 500);
  }
}