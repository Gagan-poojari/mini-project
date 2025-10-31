import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse('Not authenticated', 401);
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        fname: true,
        lname: true,
        midName: true,
        email: true,
        role: true,
        city: true,
        wardNo: true,
        houseNo: true,
        dob: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('Internal server error', 500);
  }
}