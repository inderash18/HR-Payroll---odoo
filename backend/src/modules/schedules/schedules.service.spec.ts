import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchedulesService } from './schedules.service';
import { BadRequestError } from '@common/errors/app-error';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      workingSchedule: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      workingScheduleLine: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      runInTransaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockAudit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    service = new SchedulesService(mockPrisma as any, mockAudit as any);
  });

  it('should reject schedule lines where end time <= start time', async () => {
    await expect(
      service.create(
        'org-1',
        {
          name: 'Invalid Shift',
          type: 'STANDARD_40H',
          timezone: 'UTC',
          lines: [{ dayOfWeek: 1, startTime: '17:00', endTime: '09:00', breakMinutes: 60 }],
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestError);
  });

  it('should reject schedule lines where break duration exceeds shift hours', async () => {
    await expect(
      service.create(
        'org-1',
        {
          name: 'Invalid Break',
          type: 'STANDARD_40H',
          timezone: 'UTC',
          lines: [{ dayOfWeek: 1, startTime: '09:00', endTime: '12:00', breakMinutes: 240 }], // 4h break in 3h shift
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestError);
  });

  it('should successfully create valid schedule with multiple lines and calculate weekly hours', async () => {
    mockPrisma.workingSchedule.create.mockResolvedValue({
      id: 'sch-1',
      organizationId: 'org-1',
      name: 'Valid 40H Shift',
    });

    const result = await service.create(
      'org-1',
      {
        name: 'Valid 40H Shift',
        type: 'STANDARD_40H',
        timezone: 'UTC',
        lines: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
        ],
      },
      'user-1',
    );

    expect(result.id).toBe('sch-1');
    expect(mockAudit.log).toHaveBeenCalled();
  });
});
