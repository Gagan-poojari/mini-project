import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }
console.log("USER FOUND:", user);
console.log("LOGIN DEBUG - Entered Password:", password);
console.log("LOGIN DEBUG - Stored Hash:", user.password);



    // Compare password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }
    console.log("LOGIN DEBUG - Compare Result:", isValidPassword);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.fname} ${user.lname}`,
    });

    // Set cookie
    await setAuthCookie(token);

    // Exclude password
    const { password: _, ...userData } = user;

    // Determine redirect based on role
    const redirect =
      user.role === "ADMIN" ? "/admin" : "/elections";

    return successResponse(
      {
        user: userData,
        token,
        redirect,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}
