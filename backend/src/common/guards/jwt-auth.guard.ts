import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../auth/token.service';
import { IS_PUBLIC_KEY } from '../auth/decorators/auth.decorator';
import { UnauthorizedError } from '../errors/app-error';
import { FastifyRequest } from 'fastify';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Check HttpOnly access token cookie
    if (!token && request.cookies) {
      const cookies = request.cookies as Record<string, string>;
      token = cookies['pp360_access_token'] || cookies['accessToken'] || cookies['access_token'];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required: Missing access token or session cookie');
    }

    try {
      const payload = this.tokenService.verifyAccessToken(token);

      (request as any).user = {
        id: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId,
        legalEntityId: payload.legalEntityId,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }
}
