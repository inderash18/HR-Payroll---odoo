import { errorResponse } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  console.error(`❌ [Error] ${req.method} ${req.url}:`, err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` on field (${err.meta.target})` : '';
    return errorResponse(res, `A record with these details already exists${target}.`, 409, null, 'CONFLICT');
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return errorResponse(res, 'The requested record was not found.', 404, null, 'NOT_FOUND');
  }

  // Prisma foreign key constraint failure
  if (err.code === 'P2003') {
    return errorResponse(res, 'Referenced related record does not exist or cannot be modified.', 400, null, 'FOREIGN_KEY_VIOLATION');
  }

  // Contract overlap or custom domain error
  if (err.message && err.message.toLowerCase().includes('contract') && err.message.toLowerCase().includes('overlap')) {
    return errorResponse(res, err.message, 400, null, 'CONTRACT_OVERLAP');
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 401 ? 'UNAUTHENTICATED' : statusCode === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR');

  return errorResponse(res, message, statusCode, err.errors || null, errorCode);
}
