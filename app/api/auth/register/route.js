import prisma from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { errorResponse, successResponse, isValidEmail, isValidPassword } from '@/lib/utils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fname, 
      lname, 
      midName, 
      city, 
      dob, 
      wardNo, 
      houseNo, 
      email, 
      password 
    } = body;

    // Validation
    if (!fname || !lname || !city || !dob || !wardNo || !houseNo || !email || !password) {
      return errorResponse('All required fields must be filled');
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format');
    }

    if (!isValidPassword(password)) {
      return errorResponse('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        fname,
        lname,
        midName,
        city,
        dob: new Date(dob),
        wardNo: parseInt(wardNo),
        houseNo,
        email,
        password: hashedPassword,
        role: 'VOTER', // Default role
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        role: true,
        city: true,
        wardNo: true,
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.fname} ${user.lname}`,
    });

    // Set cookie
    await setAuthCookie(token);

    return successResponse(
      { user, token },
      'Registration successful',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Internal server error', 500);
  }
}