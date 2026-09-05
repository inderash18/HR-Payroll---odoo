import { describe, it, expect, vi } from 'vitest';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const createMockContext = (user?: { role: Role }, requiredRoles?: Role[]) => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('should allow access when no roles are required', () => {
    const context = createMockContext({ role: Role.EMPLOYEE }, undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should always allow ADMIN regardless of required roles', () => {
    const context = createMockContext({ role: Role.ADMIN }, [Role.HR_PAYROLL_MANAGER]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow user with matching required role', () => {
    const context = createMockContext({ role: Role.HR_MANAGER }, [Role.HR_MANAGER, Role.ADMIN]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenError when user does not have required role', () => {
    const context = createMockContext({ role: Role.EMPLOYEE }, [Role.HR_MANAGER]);
    expect(() => guard.canActivate(context)).toThrowError(ForbiddenError);
  });

  it('should throw UnauthorizedError if user is not in request context', () => {
    const context = createMockContext(undefined, [Role.HR_MANAGER]);
    expect(() => guard.canActivate(context)).toThrowError(UnauthorizedError);
  });
});
