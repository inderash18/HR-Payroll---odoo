import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import { GlobalExceptionFilter } from '@common/errors/exception.filter';
import { TransformResponseInterceptor } from '@common/interceptors/transform-response.interceptor';
import fastifyCookie from '@fastify/cookie';
import { env } from '@common/config/env.config';

describe('Development-Only Fixed Authentication Fallback (e2e)', () => {
  let app: NestFastifyApplication;
  let devAdminToken: string;
  let devHrToken: string;
  let devEmployeeToken: string;
  let devRefreshCookie: string;

  beforeAll(async () => {
    // Enable Dev Fixed Auth for testing
    process.env.NODE_ENV = 'test';
    (env as any).DEV_FIXED_AUTH_ENABLED = true;
    (env as any).DEV_FIXED_AUTH_EMAIL = 'devadmin@peoplepay360.local';
    (env as any).DEV_FIXED_AUTH_PASSWORD = 'ChangeThisDevPassword';
    (env as any).DEV_FIXED_AUTH_ROLE = 'ADMIN';
    (env as any).DEV_FIXED_AUTH_NAME = 'Development Admin';

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
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // A. Fixed login enabled + correct credentials -> 200 + cookies + normal DTO
  it('A. POST /auth/login with fixed dev admin credentials should succeed and set HttpOnly cookies', async () => {
    (env as any).DEV_FIXED_AUTH_ENABLED = true;

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'devadmin@peoplepay360.local',
        password: 'ChangeThisDevPassword',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    expect(body.success).toBe(true);
    expect(body.accessToken).toBeDefined();
    expect(body.user.id).toBe('dev-fixed-admin');
    expect(body.user.email).toBe('devadmin@peoplepay360.local');
    expect(body.user.role).toBe('ADMIN');
    expect(body.user.organizationId).toBe('dev-local-org');

    devAdminToken = body.accessToken;

    const cookieHeader = response.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();
    const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader as string];
    const refreshCookie = cookies.find((c) => c.includes('pp360_refresh_token'));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
    devRefreshCookie = refreshCookie || cookies[0];
  });

  it('A2. POST /auth/login with simple "admin" and password "123" should succeed', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin',
        password: '123',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.user.role).toBe('ADMIN');
  });

  it('A3. POST /auth/login with simple "hr", "payroll", "emp" and password "123" should all succeed', async () => {
    const hrRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'hr', password: '123' },
    });
    expect(hrRes.statusCode).toBe(200);
    expect(JSON.parse(hrRes.payload).user.role).toBe('HR_MANAGER');

    const payrollRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'payroll', password: '123' },
    });
    expect(payrollRes.statusCode).toBe(200);
    expect(JSON.parse(payrollRes.payload).user.role).toBe('HR_PAYROLL_MANAGER');

    const empRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'emp', password: '123' },
    });
    expect(empRes.statusCode).toBe(200);
    expect(JSON.parse(empRes.payload).user.role).toBe('EMPLOYEE');
  });

  // B. Fixed login enabled + wrong password -> 401 Unauthorized
  it('B. POST /auth/login with fixed email but wrong password should return 401 Unauthorized', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'devadmin@peoplepay360.local',
        password: 'WrongDevPassword123!',
      },
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  // C. Fixed login disabled -> falls through to PostgreSQL database auth
  it('C. POST /auth/login when fixed auth is disabled should fall through to database auth', async () => {
    (env as any).DEV_FIXED_AUTH_ENABLED = false;

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'devadmin@peoplepay360.local',
        password: 'ChangeThisDevPassword',
      },
    });

    // Since devadmin does not exist in real DB, returns 401 from real DB auth
    expect(response.statusCode).toBe(401);

    // Restore enabled for remaining tests
    (env as any).DEV_FIXED_AUTH_ENABLED = true;
  });

  // D. Production Guard: Fixed auth must NOT work when NODE_ENV is production
  it('D. MANDATORY SAFETY: Fixed login must fail when NODE_ENV is production even if DEV_FIXED_AUTH_ENABLED is true', async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    (env as any).DEV_FIXED_AUTH_ENABLED = true;

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'devadmin@peoplepay360.local',
          password: 'ChangeThisDevPassword',
        },
      });

      // In production mode, fixed credentials bypass is completely deactivated and falls through to DB
      expect(response.statusCode).toBe(401);
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      (env as any).DEV_FIXED_AUTH_ENABLED = true;
    }
  });

  // E. Profile lookup: /auth/me and /users/me works for dev session
  it('E. GET /auth/me should return development user profile with organization details', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: `Bearer ${devAdminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    const userProfile = body.data || body;
    expect(userProfile.id).toBe('dev-fixed-admin');
    expect(userProfile.email).toBe('devadmin@peoplepay360.local');
    expect(userProfile.organization.name).toBe('Development Organization');
  });

  it('E2. GET /users/me should also return development user profile', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: {
        authorization: `Bearer ${devAdminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    const user = body.data || body;
    expect(user.id).toBe('dev-fixed-admin');
  });

  // F. Token refresh: /auth/refresh rotates dev session in memory
  it('F. POST /auth/refresh should rotate tokens using in-memory dev session and HttpOnly cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      headers: {
        cookie: devRefreshCookie,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.accessToken).toBeDefined();
    expect(body.user.email).toBe('devadmin@peoplepay360.local');

    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toBeDefined();
  });

  // G. Logout: /auth/logout clears dev session and cookies
  it('G. POST /auth/logout should clear active session and cookies', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: {
        cookie: devRefreshCookie,
      },
    });

    expect(response.statusCode).toBe(200);
    const cookieHeader = response.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();
  });

  // H. RBAC enforcement on dev users
  it('H. RBAC: Fixed HR user can log in but receives 403 Forbidden on Admin-only APIs', async () => {
    // 1. Log in as dev HR Manager
    const hrLogin = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'dev.hr@peoplepay360.local',
        password: 'ChangeThisDevPassword',
      },
    });

    expect(hrLogin.statusCode).toBe(200);
    const hrBody = JSON.parse(hrLogin.payload);
    expect(hrBody.user.role).toBe('HR_MANAGER');
    devHrToken = hrBody.accessToken;

    // 2. Attempt Admin-only route (POST /users)
    const adminAction = await app.inject({
      method: 'POST',
      url: '/users',
      headers: {
        authorization: `Bearer ${devHrToken}`,
      },
      payload: {
        email: 'newuser@peoplepay360.local',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        role: 'EMPLOYEE',
      },
    });

    expect(adminAction.statusCode).toBe(403);
    const adminActionBody = JSON.parse(adminAction.payload);
    expect(adminActionBody.errorCode).toBe('FORBIDDEN');
  });

  it('H2. RBAC: Fixed Employee receives 403 Forbidden on Legal Entities API', async () => {
    // 1. Log in as dev Employee
    const empLogin = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'dev.employee@peoplepay360.local',
        password: 'ChangeThisDevPassword',
      },
    });

    expect(empLogin.statusCode).toBe(200);
    const empBody = JSON.parse(empLogin.payload);
    expect(empBody.user.role).toBe('EMPLOYEE');
    devEmployeeToken = empBody.accessToken;

    // 2. Attempt Admin/HR-only route (POST /legal-entities)
    const empAction = await app.inject({
      method: 'POST',
      url: '/legal-entities',
      headers: {
        authorization: `Bearer ${devEmployeeToken}`,
      },
      payload: {
        name: 'Unauthorized LE',
        code: 'LE-UNAUTH',
        country: 'US',
        currency: 'USD',
      },
    });

    expect(empAction.statusCode).toBe(403);
    const empActionBody = JSON.parse(empAction.payload);
    expect(empActionBody.errorCode).toBe('FORBIDDEN');
  });
});

