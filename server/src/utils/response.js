/**
 * Standard API Success Envelope Response
 */
export function successResponse(res, data = null, message = 'Success', statusCode = 200, pagination = null) {
  const response = {
    success: true,
    message,
    ...(data !== null && data !== undefined ? { data } : {}),
    ...(pagination ? { pagination } : {}),
  };
  return res.status(statusCode).json(response);
}

/**
 * Standard API Error Envelope Response
 */
export function errorResponse(res, message = 'An error occurred', statusCode = 400, errors = null, errorCode = 'ERROR') {
  const response = {
    success: false,
    message,
    errorCode,
    statusCode,
    ...(errors ? { errors } : {}),
  };
  return res.status(statusCode).json(response);
}
