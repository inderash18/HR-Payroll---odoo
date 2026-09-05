import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    const existingId = request.headers['x-request-id'] as string;
    const requestId = existingId || uuidv4();

    request.headers['x-request-id'] = requestId;
    reply.header('x-request-id', requestId);

    return next.handle();
  }
}
