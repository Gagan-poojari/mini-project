import prisma from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { errorResponse, successResponse, isValidEmail, isValidPassword } from '@/lib/utils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return errorResponse('All fields are required');
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format');
    }

    if (!isValidPassword(password)) {
      return errorResponse('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await prisma.voter.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const voter = await prisma.voter.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        hasVoted: true,
      },
    });

    // Generate token
    const token = generateToken({
      id: voter.id,
      email: voter.email,
      name: voter.name,
    });

    // Set cookie
    await setAuthCookie(token);

    return successResponse(
      { voter, token },
      'Registration successful',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Internal server error', 500);
  }
}