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

// GET all parties
export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      include: {
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(parties);
  } catch (error) {
    console.error('Get parties error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create new party (Admin only)
export async function POST(request) {
  const authCheck = await requireAdmin();
  if (authCheck.error) return authCheck.error;

  try {
    const body = await request.json();
    const { name, shortName, logo } = body;

    if (!name) {
      return errorResponse('Party name is required');
    }

    const party = await prisma.party.create({
      data: {
        name,
        shortName,
        logo,
      },
    });

    return successResponse(party, 'Party created successfully', 201);
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse('Party name already exists', 409);
    }
    console.error('Create party error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE party
export async function DELETE(request) {
  const authCheck = await requireAdmin();
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Party ID is required');
    }

    await prisma.party.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(null, 'Party deleted successfully');
  } catch (error) {
    console.error('Delete party error:', error);
    return errorResponse('Internal server error', 500);
  }
}