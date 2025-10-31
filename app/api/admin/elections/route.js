import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

// Middleware to check admin role
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

// GET all elections
export async function GET() {
  try {
    const elections = await prisma.election.findMany({
      include: {
        _count: {
          select: { 
            candidates: true,
            votes: true 
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(elections);
  } catch (error) {
    console.error('Get elections error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create new election (Admin only)
export async function POST(request) {
  const authCheck = await requireAdmin();
  if (authCheck.error) return authCheck.error;

  try {
    const body = await request.json();
    const { title, description, startDate, endDate } = body;

    if (!title || !startDate || !endDate) {
      return errorResponse('Title, start date, and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return errorResponse('End date must be after start date');
    }

    const election = await prisma.election.create({
      data: {
        title,
        description,
        startDate: start,
        endDate: end,
      },
    });

    return successResponse(election, 'Election created successfully', 201);
  } catch (error) {
    console.error('Create election error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE election
export async function DELETE(request) {
  const authCheck = await requireAdmin();
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Election ID is required');
    }

    await prisma.election.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(null, 'Election deleted successfully');
  } catch (error) {
    console.error('Delete election error:', error);
    return errorResponse('Internal server error', 500);
  }
}