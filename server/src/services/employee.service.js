import { employeeRepository } from '../repositories/employee.repository.js';
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';

const generateCredentials = async (firstName, lastName, employeeNum, organizationId) => {
  const cleanStr = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  const fName = cleanStr(firstName);
  const lName = cleanStr(lastName);
  
  let baseEmail = `${fName}.${lName}@peoplepay360.in`;
  if (!fName || !lName) {
    baseEmail = `${fName || lName}.employee@peoplepay360.in`;
  }
  
  let workEmail = baseEmail;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.user.findFirst({
      where: { email: workEmail, organizationId }
    });
    const existingEmp = await prisma.employee.findFirst({
      where: { workEmail, organizationId }
    });
    
    if (!existing && !existingEmp) break;
    
    workEmail = `${baseEmail.split('@')[0]}${counter}@peoplepay360.in`;
    counter++;
  }

  const fNamePrefix = fName.substring(0, 4);
  const lNamePrefix = lName.substring(0, 4);
  const tempPassword = `${fNamePrefix}${lNamePrefix}${employeeNum}`;
  
  return { workEmail, tempPassword };
};

export const employeeService = {
  async list(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await employeeRepository.findMany(organizationId, {
      skip,
      take: limit,
      departmentId: query.departmentId,
      search: query.search,
      isActive: query.isActive !== undefined ? query.isActive === 'true' || query.isActive === true : undefined,
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

  async findById(organizationId, id) {
    const employee = await employeeRepository.findById(organizationId, id);
    if (!employee) throw new Error('Employee not found');
    return employee;
  },

  async findByUserId(organizationId, userId) {
    return employeeRepository.findByUserId(organizationId, userId);
  },

  async create(organizationId, dto) {
    const existingNum = await prisma.employee.findFirst({
      where: { organizationId, employeeNum: dto.employeeNum },
    });

    if (existingNum) {
      throw new Error('An employee with this Employee ID already exists');
    }
    
    const { workEmail, tempPassword } = await generateCredentials(dto.firstName, dto.lastName, dto.employeeNum, organizationId);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const newUser = await tx.user.create({
        data: {
          email: workEmail,
          passwordHash: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'EMPLOYEE',
          organizationId,
          mustChangePassword: true,
          isActive: true
        }
      });

      // 2. Create Employee
      const joiningDate = dto.joiningDate ? new Date(dto.joiningDate) : new Date();
      const newEmployee = await tx.employee.create({
        data: {
          organizationId,
          ...dto,
          workEmail,
          userId: newUser.id,
          joiningDate
        }
      });

      return newEmployee;
    });

    // Return the result with plain-text credentials attached for the frontend
    return {
      ...result,
      _generatedCredentials: {
        email: workEmail,
        password: tempPassword
      }
    };
  },

  async update(organizationId, id, dto) {
    await employeeService.findById(organizationId, id);
    return employeeRepository.update(organizationId, id, {
      ...dto,
      ...(dto.joiningDate ? { joiningDate: new Date(dto.joiningDate) } : {}),
    });
  },

  async delete(organizationId, id) {
    await employeeService.findById(organizationId, id);
    return employeeRepository.delete(organizationId, id);
  },
};
