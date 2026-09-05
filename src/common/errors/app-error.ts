import { HttpStatus } from '@nestjs/common';

export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;
  public readonly details?: Record<string, unknown> | Array<unknown>;

  constructor(message: string, details?: Record<string, unknown> | Array<unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  public readonly statusCode = HttpStatus.NOT_FOUND;
  public readonly errorCode = 'NOT_FOUND';
}

export class BadRequestError extends AppError {
  public readonly statusCode = HttpStatus.BAD_REQUEST;
  public readonly errorCode = 'BAD_REQUEST';
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = HttpStatus.UNAUTHORIZED;
  public readonly errorCode = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  public readonly statusCode = HttpStatus.FORBIDDEN;
  public readonly errorCode = 'FORBIDDEN';
}

export class ConflictError extends AppError {
  public readonly statusCode = HttpStatus.CONFLICT;
  public readonly errorCode = 'CONFLICT';
}

export class ValidationError extends AppError {
  public readonly statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
  public readonly errorCode = 'VALIDATION_ERROR';
}

export class IdempotencyConflictError extends AppError {
  public readonly statusCode = HttpStatus.CONFLICT;
  public readonly errorCode = 'IDEMPOTENCY_CONFLICT';
}

export class DomainRuleError extends AppError {
  public readonly statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
  public readonly errorCode = 'DOMAIN_RULE_VIOLATION';
}
