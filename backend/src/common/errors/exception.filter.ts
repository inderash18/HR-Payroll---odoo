import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './app-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const requestId = (request.headers?.['x-request-id'] as string) || 'unknown';
    const timestamp = new Date().toISOString();
    const path = request.url || 'unknown';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal server error occurred.';
    let fields: Record<string, string> | undefined = undefined;
    let details: unknown = undefined;

    // 1. Domain / Application Custom Errors
    if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      errorCode = exception.errorCode;
      message = exception.message;

      // Format validation errors into standard fields dictionary
      if (Array.isArray(exception.details)) {
        fields = {};
        for (const item of exception.details as any[]) {
          if (item && item.path && item.message) {
            fields[item.path] = item.message;
          }
        }
        if (Object.keys(fields).length === 0) {
          fields = undefined;
        }
      } else if (exception.details && typeof exception.details === 'object') {
        details = exception.details;
      }

      // Check for specialized error codes based on context
      if (message.toLowerCase().includes('contract') && message.toLowerCase().includes('overlap')) {
        errorCode = 'CONTRACT_OVERLAP';
      }
    }
    // 2. NestJS Standard HttpExceptions
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (statusCode === HttpStatus.UNAUTHORIZED) {
        errorCode = 'UNAUTHENTICATED';
      } else if (statusCode === HttpStatus.FORBIDDEN) {
        errorCode = 'FORBIDDEN';
      } else if (statusCode === HttpStatus.NOT_FOUND) {
        errorCode = 'NOT_FOUND';
      } else if (statusCode === HttpStatus.CONFLICT) {
        errorCode = 'CONFLICT';
      } else if (statusCode === HttpStatus.TOO_MANY_REQUESTS) {
        errorCode = 'RATE_LIMIT_EXCEEDED';
        message = 'Too many requests. Please try again later.';
      } else if (statusCode === HttpStatus.BAD_REQUEST) {
        errorCode = 'BAD_REQUEST';
      } else if (statusCode === HttpStatus.UNPROCESSABLE_ENTITY) {
        errorCode = 'VALIDATION_ERROR';
      }

      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, any>;
        message = obj.message || exception.message;
        if (obj.error && typeof obj.error === 'string') {
          errorCode = obj.error.toUpperCase().replace(/\s+/g, '_');
        }

        if (Array.isArray(obj.message)) {
          fields = {};
          for (const msg of obj.message) {
            fields['request'] = String(msg);
          }
          message = 'Request validation failed.';
        }
      } else if (typeof res === 'string') {
        message = res;
      }
    }
    // 3. Prisma Database Errors
    else if (exception && typeof exception === 'object' && 'code' in exception) {
      const prismaErr = exception as { code: string; message: string; meta?: any };

      switch (prismaErr.code) {
        case 'P2002':
          statusCode = HttpStatus.CONFLICT;
          errorCode = 'CONFLICT';
          const target = prismaErr.meta?.target ? ` on field (${prismaErr.meta.target})` : '';
          message = `A record with these details already exists${target}.`;
          break;
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = 'NOT_FOUND';
          message = 'The requested record was not found.';
          break;
        case 'P2003':
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = 'FOREIGN_KEY_VIOLATION';
          message = 'Referenced related record does not exist or cannot be modified.';
          break;
        case 'P1000':
        case 'P1001':
        case 'P1002':
        case 'P1003':
        case 'P1017':
          statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          errorCode = 'DATABASE_UNAVAILABLE';
          message = 'The local development database is unavailable.';
          break;
        default:
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = `DB_${prismaErr.code}`;
          message = 'Database operation failed.';
      }
    }
    // 4. Fastify & JSON Body Parser Errors
    else if (exception && typeof exception === 'object' && 'code' in exception && String((exception as any).code).startsWith('FST_ERR_')) {
      const fastifyErr = exception as { code: string; message: string; statusCode?: number };

      if (fastifyErr.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
        statusCode = HttpStatus.PAYLOAD_TOO_LARGE;
        errorCode = 'PAYLOAD_TOO_LARGE';
        message = 'Request body exceeds the allowed size.';
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        errorCode = 'INVALID_JSON';
        message = 'Request body contains invalid JSON.';
      }
    }
    // 5. Database Connection / Initialization Errors
    else if (
      exception instanceof Error &&
      (exception.name === 'PrismaClientInitializationError' ||
        exception.name === 'PrismaClientRustPanicError' ||
        exception.message.includes("Can't reach database server") ||
        exception.message.includes('ECONNREFUSED'))
    ) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      errorCode = 'DATABASE_UNAVAILABLE';
      message = 'The local development database is unavailable.';
    }
    // 6. JWT Authentication Errors
    else if (exception instanceof Error && exception.name === 'TokenExpiredError') {
      statusCode = HttpStatus.UNAUTHORIZED;
      errorCode = 'ACCESS_TOKEN_EXPIRED';
      message = 'Access token has expired.';
    } else if (exception instanceof Error && exception.name === 'JsonWebTokenError') {
      statusCode = HttpStatus.UNAUTHORIZED;
      errorCode = 'INVALID_ACCESS_TOKEN';
      message = 'Authentication token is invalid.';
    }
    // 7. Generic Unexpected Errors
    else if (exception instanceof Error) {
      message = exception.message || 'An unexpected internal server error occurred.';
      this.logger.error(`Unhandled Exception at ${request.method} ${request.url}: ${exception.message}`, exception.stack);
    }

    const payload = {
      success: false,
      statusCode,
      errorCode,
      message,
      timestamp,
      path,
      requestId,
      error: {
        code: errorCode,
        message,
        ...(fields ? { fields } : {}),
        ...(details ? { details } : {}),
      },
    };

    if (typeof (response as any).header === 'function') {
      (response as any).header('Content-Type', 'application/json; charset=utf-8');
    }

    response.status(statusCode).send(payload);
  }
}
