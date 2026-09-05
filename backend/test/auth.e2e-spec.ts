import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import { GlobalExceptionFilter } from '@common/errors/exception.filter';
import fastifyCookie from '@fastify/cookie';
import { env } from '@common/config/env.config';

describe('Auth & RBAC Flow (e2e)', () => {
  let app: NestFastifyApplication;
  let adminToken: string;
  let employeeToken: string;
  let refreshCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.register(fastifyCookie as any, {
      secret: env.COOKIE_SECRET,
    });

    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /auth/login should authenticate Admin and set refresh cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        organizationCode: 'DEMO-ORG',
        email: 'admin@peoplepay360.local',
        password: 'Admin@123456',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.accessToken).toBeDefined();
    expect(body.user.role).toBe('ADMIN');

    adminToken = body.accessToken;

    const cookieHeader = response.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();
    const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader as string];
    const foundRefresh = cookies.find((c) => c.includes('pp360_refresh_token'));
    refreshCookie = foundRefresh || cookies[0];
    expect(refreshCookie).toContain('pp360_refresh_token');
  });

  it('GET /users/me should return authenticated admin profile', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.email).toBe('admin@peoplepay360.local');
    expect(body.role).toBe('ADMIN');
  });

  it('POST /legal-entities should succeed for ADMIN', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/legal-entities',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        name: 'Demo Legal Entity Inc',
        code: `LE-${Date.now()}`.slice(0, 15),
        country: 'US',
        currency: 'USD',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body.id).toBeDefined();
  });

  it('POST /auth/login should authenticate Employee', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        organizationCode: 'DEMO-ORG',
        email: 'employee@peoplepay360.local',
        password: 'Admin@123456',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.user.role).toBe('EMPLOYEE');
    employeeToken = body.accessToken;
  });

  it('POST /legal-entities should return 403 Forbidden for EMPLOYEE', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/legal-entities',
      headers: {
        authorization: `Bearer ${employeeToken}`,
      },
      payload: {
        name: 'Unauthorized Entity',
        code: 'UNAUTH',
        country: 'US',
        currency: 'USD',
      },
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.payload);
    expect(body.errorCode).toBe('FORBIDDEN');
  });

  it('POST /auth/refresh should rotate tokens using HTTP-only cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      headers: {
        cookie: refreshCookie,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.accessToken).toBeDefined();
    expect(typeof body.accessToken).toBe('string');
    expect(body.user.email).toBe('admin@peoplepay360.local');
    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toBeDefined();
  });

  it('POST /auth/logout should clear cookie and return success', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: {
        cookie: refreshCookie,
      },
    });

    expect(response.statusCode).toBe(200);
    const cookieHeader = response.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();
  });

  it('GET /auth/sessions should return active sessions list for authenticated user', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/sessions',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const sessions = JSON.parse(response.payload);
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].device).toBeDefined();
  });

  it('POST /auth/logout-all should revoke all sessions for authenticated user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/logout-all',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
  });
});
