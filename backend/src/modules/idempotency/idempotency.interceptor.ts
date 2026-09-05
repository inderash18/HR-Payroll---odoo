import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { IdempotencyService } from './idempotency.service';
import { BadRequestError } from '@common/errors/app-error';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    const idempotencyKey = request.headers['idempotency-key'] as string;
    if (!idempotencyKey) {
      // If no header provided, continue normal pipeline
      return next.handle();
    }

    const organizationId =
      (request.headers['x-organization-id'] as string) ||
      (request as unknown as { user?: { organizationId?: string } }).user?.organizationId;

    if (!organizationId) {
      throw new BadRequestError('Organization context required when using Idempotency-Key');
    }

    const userId = (request as unknown as { user?: { id?: string } }).user?.id || null;
    const requestPath = request.url;
    const bodyHash = this.idempotencyService.hashPayload(request.body);

    const checkResult = await this.idempotencyService.acquireLockOrGetCached(
      idempotencyKey,
      organizationId,
      userId,
      requestPath,
      bodyHash,
    );

    if (checkResult.isCached && checkResult.statusCode) {
      reply.header('x-idempotent-replay', 'true');
      reply.status(checkResult.statusCode);
      return of(checkResult.responseBody);
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        const statusCode = reply.statusCode || 200;
        await this.idempotencyService.saveResponse(idempotencyKey, statusCode, responseBody);
      }),
    );
  }
}
