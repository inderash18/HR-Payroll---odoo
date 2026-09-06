import { attendanceRepository } from '../repositories/attendance.repository.js';
import { employeeRepository } from '../repositories/employee.repository.js';

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

    // Fixed time logic: 9:00 AM limit
    const limitTime = new Date(today);
    limitTime.setHours(9, 0, 0, 0);
    const status = checkInTime > limitTime ? 'LATE' : 'PRESENT';

    return attendanceRepository.create({
      organizationId,
      employeeId,
      date: today,
      checkIn: checkInTime,
      status,
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

    // Fixed time logic: 5:00 PM limit for early departure
    const endOfDay = new Date(today);
    endOfDay.setHours(17, 0, 0, 0);
    let newStatus = existing.status;
    if (checkOutTime < endOfDay && existing.status !== 'LATE') {
      newStatus = 'EARLY_LEAVE';
    }

    return attendanceRepository.update(existing.id, {
      checkOut: checkOutTime,
      workedHours,
      status: newStatus,
    });
  },
};
