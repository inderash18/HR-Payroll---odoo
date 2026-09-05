import { describe, it, expect, vi } from 'vitest';
import { GlobalExceptionFilter } from './exception.filter';
import { NotFoundError } from './app-error';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  const createMockHost = (url = '/test') => {
    const statusFn = vi.fn().mockReturnThis();
    const sendFn = vi.fn().mockReturnThis();

    const mockReply = {
      status: statusFn,
      send: sendFn,
    } as unknown as FastifyReply;

    const mockRequest = {
      url,
      headers: { 'x-request-id': 'req-12345' },
    } as unknown as FastifyRequest;

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockReply,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    return { mockHost, statusFn, sendFn };
  };

  it('should format AppError correctly into standard response', () => {
    const { mockHost, statusFn, sendFn } = createMockHost('/employees/99');
    const error = new NotFoundError('Employee not found');

    filter.catch(error, mockHost);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(sendFn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: 'NOT_FOUND',
        message: 'Employee not found',
        path: '/employees/99',
        requestId: 'req-12345',
      }),
    );
  });

  it('should format NestJS HttpException properly', () => {
    const { mockHost, statusFn, sendFn } = createMockHost('/auth/login');
    const error = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);

    filter.catch(error, mockHost);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(sendFn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden resource',
      }),
    );
  });
});
