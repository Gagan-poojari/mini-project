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
export function errorResponse(message = "Error", status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
    }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

// Success response helper
export function successResponse(data = {}, message = "Success", status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message,
    }),
    { status, headers: { "Content-Type": "application/json" } }
  );
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