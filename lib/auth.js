import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/* 🔹 Hash password before saving */
export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    console.error("Error hashing password:", err);
    throw new Error("Password hashing failed");
  }
}

/* 🔹 Compare plaintext password with hashed password */
export async function comparePassword(plainPassword, hashedPassword) {
  try {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("🔍 comparePassword result:", result);
    return result;
  } catch (err) {
    console.error("comparePassword error:", err);
    return false;
  }
}

/* 🔹 Generate JWT token with 7-day expiry */
export function generateToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  } catch (err) {
    console.error("generateToken error:", err);
    return null;
  }
}

/* 🔹 Verify JWT token safely */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("verifyToken error:", err);
    return null;
  }
}

/* 🔹 Get current user in server components (Next 15 compatible) */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies(); // ✅ must await
    const token = (await cookieStore).get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

/* 🔹 Set JWT cookie (auth) */
export async function setAuthCookie(token) {
  try {
    const cookieStore = await cookies(); // ✅ must await
    ;(await cookieStore).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  } catch (err) {
    console.error("setAuthCookie error:", err);
  }
}

/* 🔹 Clear cookie on logout */
export async function clearAuthCookie() {
  try {
    const cookieStore = await cookies(); // ✅ must await
    ;(await cookieStore).delete('token');
  } catch (err) {
    console.error("clearAuthCookie error:", err);
  }
}

/* 🔹 Verify auth inside API routes */
export async function verifyAuth(request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    // Parse all cookies manually and look for exact key `token`
    const cookiesArray = cookieHeader.split(";").map(c => c.trim());
    const tokenCookie = cookiesArray.find(c => c.startsWith("token="));
    if (!tokenCookie) return null;

    let token = decodeURIComponent(tokenCookie.split("=")[1]);
    if (!token) return null;

    // Clean up if somehow prefixed with "Bearer "
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (err) {
    console.error("verifyAuth error:", err);
    return null;
  }
}

