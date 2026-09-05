import { scheduleRepository } from '../repositories/schedule.repository.js';
import { attendanceRepository } from '../repositories/attendance.repository.js';
import { employeeRepository } from '../repositories/employee.repository.js';

export const scheduleService = {
  async list(organizationId) {
    return scheduleRepository.findMany(organizationId);
  },

  async findById(organizationId, id) {
    const schedule = await scheduleRepository.findById(organizationId, id);
    if (!schedule) throw new Error('Working schedule not found');
    return schedule;
  },

  async create(organizationId, dto) {
    const { lines, ...data } = dto;
    return scheduleRepository.create({ organizationId, ...data }, lines);
  },

  async update(organizationId, id, dto) {
    await scheduleService.findById(organizationId, id);
    const { lines, ...data } = dto;
    return scheduleRepository.update(organizationId, id, data, lines);
  },
};

export const attendanceService = {
  async list(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await attendanceRepository.findMany(organizationId, {
      skip,
      take: limit,
      employeeId: query.employeeId,
      startDate: query.startDate,
      endDate: query.endDate,
      status: query.status,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async clockIn(organizationId, dto, userId) {
    let employeeId = dto.employeeId;
    if (!employeeId) {
      const emp = await employeeRepository.findByUserId(organizationId, userId);
      if (!emp) throw new Error('No employee profile associated with current user');
      employeeId = emp.id;
    }

    const today = dto.date ? new Date(dto.date) : new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await attendanceRepository.findByDate(organizationId, employeeId, today);
    if (existing) {
      throw new Error('Employee has already clocked in for this date');
    }

    const checkInTime = dto.checkIn ? new Date(dto.checkIn) : new Date();

    return attendanceRepository.create({
      organizationId,
      employeeId,
      date: today,
      checkIn: checkInTime,
      status: 'PRESENT',
    });
  },

  async clockOut(organizationId, dto, userId) {
    let employeeId = dto.employeeId;
    if (!employeeId) {
      const emp = await employeeRepository.findByUserId(organizationId, userId);
      if (!emp) throw new Error('No employee profile associated with current user');
      employeeId = emp.id;
    }

    const today = dto.date ? new Date(dto.date) : new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await attendanceRepository.findByDate(organizationId, employeeId, today);
    if (!existing) {
      throw new Error('Cannot clock out: No clock-in record found for today');
    }

    const checkOutTime = dto.checkOut ? new Date(dto.checkOut) : new Date();
    const durationMs = checkOutTime - new Date(existing.checkIn);
    const workedHours = Math.max(0, parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2)));

    return attendanceRepository.update(existing.id, {
      checkOut: checkOutTime,
      workedHours,
    });
  },
};
