import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DepartmentsService } from './departments.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      department: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      runInTransaction: vi.fn((cb) => cb(mockPrisma)),
    };
    mockAudit = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    service = new DepartmentsService(mockPrisma, mockAudit);
  });

  it('should create a department successfully', async () => {
    mockPrisma.department.findUnique.mockResolvedValue(null);
    mockPrisma.department.create.mockResolvedValue({
      id: 'dept-1',
      name: 'Engineering',
      code: 'ENG',
      organizationId: 'org-1',
    });

    const result = await service.create('org-1', {
      name: 'Engineering',
      code: 'ENG',
    });

    expect(result.id).toBe('dept-1');
    expect(mockAudit.log).toHaveBeenCalled();
  });
});
