// Standard API response format
export function apiResponse(success, data = null, message = '', statusCode = 200) {
  return Response.json(
    {
      success,
      data,
      message,
    },
    { status: statusCode }
  );
}

// Error response helper
export function errorResponse(message, statusCode = 400) {
  return apiResponse(false, null, message, statusCode);
}

// Success response helper
export function successResponse(data, message = 'Success', statusCode = 200) {
  return apiResponse(true, data, message, statusCode);
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength (minimum 6 characters)
export function isValidPassword(password) {
  return password && password.length >= 6;
}