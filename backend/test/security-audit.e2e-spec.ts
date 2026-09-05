import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/errors/exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { ZodValidationPipe } from '../src/common/validation/zod-validation.pipe';
import { TokenService } from '../src/common/auth/token.service';
import { Role } from '@prisma/client';

describe('Enterprise Security & Defensive Attack-Surface Audit Suite (E2E)', () => {
  let app: NestFastifyApplication;
  let tokenService: TokenService;

  const ORG_A = 'org-tenant-alpha-001';
  const ORG_B = 'org-tenant-beta-002';

  const USER_ADMIN_A = 'usr-admin-a-01';
  const USER_EMPLOYEE_A = 'usr-emp-a-02';
  const USER_HR_A = 'usr-hr-a-03';
  const USER_PAYROLL_USER_A = 'usr-payuser-a-04';
  const USER_ADMIN_B = 'usr-admin-b-01';

  let tokenAdminA: string;
  let tokenEmployeeA: string;
  let tokenHrA: string;
  let tokenPayrollUserA: string;
  let tokenAdminB: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    tokenService = moduleRef.get<TokenService>(TokenService);

    tokenAdminA = tokenService.signAccessToken({
      sub: USER_ADMIN_A,
      email: 'admin@tenant-alpha.local',
      organizationId: ORG_A,
      role: Role.ADMIN,
      legalEntityId: null,
    });

    tokenEmployeeA = tokenService.signAccessToken({
      sub: USER_EMPLOYEE_A,
      email: 'employee@tenant-alpha.local',
      organizationId: ORG_A,
      role: Role.EMPLOYEE,
      legalEntityId: null,
    });

    tokenHrA = tokenService.signAccessToken({
      sub: USER_HR_A,
      email: 'hr@tenant-alpha.local',
      organizationId: ORG_A,
      role: Role.HR_MANAGER,
      legalEntityId: null,
    });

    tokenPayrollUserA = tokenService.signAccessToken({
      sub: USER_PAYROLL_USER_A,
      email: 'payroll.user@tenant-alpha.local',
      organizationId: ORG_A,
      role: Role.HR_PAYROLL_USER,
      legalEntityId: null,
    });

    tokenAdminB = tokenService.signAccessToken({
      sub: USER_ADMIN_B,
      email: 'admin@tenant-beta.local',
      organizationId: ORG_B,
      role: Role.ADMIN,
      legalEntityId: null,
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // ----------------------------------------------------
  // 1. RBAC & PRIVILEGE ESCALATION DEFENSE
  // ----------------------------------------------------
  describe('RBAC & Privilege Escalation Defenses', () => {
    it('Sec-01: EMPLOYEE role must be blocked (403) from accessing admin users API', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users',
        headers: { Authorization: `Bearer ${tokenEmployeeA}` },
      });

      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('Sec-02: EMPLOYEE role must be blocked (403) from creating salary structures', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/payroll/structures',
        headers: { Authorization: `Bearer ${tokenEmployeeA}` },
        payload: { name: 'Rogue Structure', code: 'ROGUE-01' },
      });

      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('Sec-03: HR_MANAGER role must be blocked (403) from creating salary rules', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/payroll/rules',
        headers: { Authorization: `Bearer ${tokenHrA}` },
        payload: {
          structureId: 'str-01',
          name: 'Unauthorized Rule',
          code: 'UNAUTH_RULE',
          category: 'BASIC',
          amountType: 'FIXED',
          amount: 5000,
        },
      });

      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('Sec-04: HR_PAYROLL_USER role must be blocked (403) from validating or paying payruns', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/payroll/payruns/dummy-payrun-id/validate',
        headers: { Authorization: `Bearer ${tokenPayrollUserA}` },
      });

      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FORBIDDEN');
    });
  });

  // ----------------------------------------------------
  // 2. TENANT ISOLATION & IDOR DEFENSE
  // ----------------------------------------------------
  describe('Multi-Tenant Isolation & IDOR Defenses', () => {
    it('Sec-05: Non-existent or foreign tenant employee lookup must return 404 JSON, not leak data', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/employees/foreign-tenant-emp-id-999',
        headers: { Authorization: `Bearer ${tokenAdminA}` },
      });

      expect(res.statusCode).toBe(404);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('Sec-06: Non-existent or foreign tenant contract lookup must return 404 JSON', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/contracts/foreign-tenant-contract-999',
        headers: { Authorization: `Bearer ${tokenAdminA}` },
      });

      expect(res.statusCode).toBe(404);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  // ----------------------------------------------------
  // 3. API SANITIZATION & PROTOCOL HARDENING
  // ----------------------------------------------------
  describe('Input Sanitization & Safe Response Format', () => {
    it('Sec-07: Unauthenticated request must return 401 JSON envelope', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/overview',
      });

      expect(res.statusCode).toBe(401);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('Sec-08: Malformed JSON body must be caught by global filter returning 400 JSON', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: { 'Content-Type': 'application/json' },
        payload: '{ broken_json_payload: ',
      });

      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('BAD_REQUEST');
    });

    it('Sec-09: Non-existent route under /api/v1/* must return standard 404 JSON', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/completely-unknown-route',
      });

      expect(res.statusCode).toBe(404);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });
});
