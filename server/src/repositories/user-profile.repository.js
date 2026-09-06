import { prisma } from '../config/prisma.js';
import fs from 'fs';
import path from 'path';

// Storage directory for uploaded user documents and avatars
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// In-memory / file metadata cache store for documents and user preferences
const PREFERENCES_FILE = path.join(UPLOAD_DIR, 'user_preferences.json');
const DOCUMENTS_FILE = path.join(UPLOAD_DIR, 'user_documents.json');
const AVATARS_FILE = path.join(UPLOAD_DIR, 'user_avatars.json');

function readJsonFile(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return fallback;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

export class UserProfileRepository {
  async getFullProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        employee: {
          include: {
            department: {
              include: {
                manager: {
                  select: { id: true, firstName: true, lastName: true, email: true, role: true },
                },
              },
            },
            jobPosition: true,
            workingSchedule: true,
            contracts: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
          },
        },
      },
    });

    let finalUser = user;
    if (!finalUser) {
      // Dev preset fallback
      const devUsers = [
        { id: 'user-superadmin-001', email: 'superadmin@odoo.local', firstName: 'Dev', lastName: 'Platform', role: 'SUPER_ADMIN' },
        { id: 'user-admin-002', email: 'admin@odoo.local', firstName: 'Aarav', lastName: 'Sharma', role: 'ORGANIZATION_ADMIN' },
        { id: 'user-hr-003', email: 'hr@odoo.local', firstName: 'Priya', lastName: 'Iyer', role: 'HR_MANAGER' },
        { id: 'user-payroll-004', email: 'payroll@odoo.local', firstName: 'Vikram', lastName: 'Mehta', role: 'PAYROLL_MANAGER' },
        { id: 'user-finance-005', email: 'finance@odoo.local', firstName: 'Ananya', lastName: 'Deshmukh', role: 'FINANCE_MANAGER' },
        { id: 'user-deptmgr-006', email: 'deptmgr@odoo.local', firstName: 'Rohan', lastName: 'Verma', role: 'DEPARTMENT_MANAGER' },
        { id: 'user-emp-007', email: 'employee@odoo.local', firstName: 'Sneha', lastName: 'Patel', role: 'EMPLOYEE' },
        { id: 'user-auditor-008', email: 'auditor@odoo.local', firstName: 'Karthik', lastName: 'Nair', role: 'AUDITOR' },
        { id: 'usr-dev-admin-fixed-uuid-101', email: 'admin@odoo.local', firstName: 'Indhu', lastName: 'Admin', role: 'ORGANIZATION_ADMIN' },
      ];
      const match = devUsers.find(u => u.id === userId);
      if (match) {
        finalUser = {
          ...match,
          isActive: true,
          organization: { id: 'org-odoo-ind', name: 'Odoo India Private Limited', code: 'ODOO-IND', currency: 'INR', timezone: 'Asia/Kolkata' },
          employee: null,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };
      }
    }

    if (!finalUser) return null;

    const avatars = readJsonFile(AVATARS_FILE, {});
    const preferences = readJsonFile(PREFERENCES_FILE, {});

    return {
      id: finalUser.id,
      email: finalUser.email,
      firstName: finalUser.firstName,
      lastName: finalUser.lastName,
      role: finalUser.role,
      isActive: finalUser.isActive,
      avatarUrl: avatars[finalUser.id] || null,
      preferences: preferences[finalUser.id] || {
        emailNotifications: true,
        payrollAlerts: true,
        leaveAlerts: true,
        securityAlerts: true,
        theme: 'light',
      },
      organization: finalUser.organization
        ? {
            id: finalUser.organization.id,
            name: finalUser.organization.name,
            code: finalUser.organization.code,
            currency: finalUser.organization.currency || 'USD',
            timezone: finalUser.organization.timezone || 'UTC',
          }
        : null,
      employee: finalUser.employee
        ? {
            id: finalUser.employee.id,
            employeeNum: finalUser.employee.employeeNum,
            workEmail: finalUser.employee.workEmail,
            personalEmail: finalUser.employee.personalEmail,
            phone: finalUser.employee.phone,
            bankName: finalUser.employee.bankName,
            bankAccountMasked: finalUser.employee.bankAccountMasked,
            joiningDate: finalUser.employee.joiningDate,
            department: finalUser.employee.department
              ? {
                  id: finalUser.employee.department.id,
                  name: finalUser.employee.department.name,
                  manager: finalUser.employee.department.manager || null,
                }
              : null,
            jobPosition: finalUser.employee.jobPosition ? { id: finalUser.employee.jobPosition.id, title: finalUser.employee.jobPosition.title } : null,
            workingSchedule: finalUser.employee.workingSchedule ? { id: finalUser.employee.workingSchedule.id, name: finalUser.employee.workingSchedule.name } : null,
            activeContract: finalUser.employee.contracts?.[0] || null,
          }
        : null,
      createdAt: finalUser.createdAt,
    };
  }

  async updateProfile(userId, updateData) {
    const { firstName, lastName, phone, personalEmail, bankName, bankAccountMasked } = updateData;

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
      },
      include: { employee: true },
    });

    // Update employee record if linked
    if (updatedUser.employee) {
      await prisma.employee.update({
        where: { id: updatedUser.employee.id },
        data: {
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(personalEmail !== undefined ? { personalEmail } : {}),
          ...(bankName !== undefined ? { bankName } : {}),
          ...(bankAccountMasked !== undefined ? { bankAccountMasked } : {}),
        },
      });
    }

    return this.getFullProfile(userId);
  }

  async saveAvatar(userId, avatarDataUrl) {
    const avatars = readJsonFile(AVATARS_FILE, {});
    avatars[userId] = avatarDataUrl;
    writeJsonFile(AVATARS_FILE, avatars);
    return { avatarUrl: avatarDataUrl };
  }

  async removeAvatar(userId) {
    const avatars = readJsonFile(AVATARS_FILE, {});
    delete avatars[userId];
    writeJsonFile(AVATARS_FILE, avatars);
    return { success: true };
  }

  async getPreferences(userId) {
    const preferences = readJsonFile(PREFERENCES_FILE, {});
    return preferences[userId] || {
      emailNotifications: true,
      payrollAlerts: true,
      leaveAlerts: true,
      securityAlerts: true,
      theme: 'light',
    };
  }

  async savePreferences(userId, prefs) {
    const preferences = readJsonFile(PREFERENCES_FILE, {});
    preferences[userId] = {
      ...(preferences[userId] || {}),
      ...prefs,
    };
    writeJsonFile(PREFERENCES_FILE, preferences);
    return preferences[userId];
  }

  async getUserDocuments(userId) {
    const docs = readJsonFile(DOCUMENTS_FILE, {});
    return docs[userId] || [];
  }

  async addDocument(userId, doc) {
    const docs = readJsonFile(DOCUMENTS_FILE, {});
    if (!docs[userId]) docs[userId] = [];

    const newDoc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: doc.name,
      category: doc.category || 'OTHER',
      fileData: doc.fileData,
      mimeType: doc.mimeType || 'application/pdf',
      fileSize: doc.fileSize || 0,
      createdAt: new Date().toISOString(),
    };

    docs[userId].unshift(newDoc);
    writeJsonFile(DOCUMENTS_FILE, docs);
    return newDoc;
  }

  async deleteDocument(userId, documentId) {
    const docs = readJsonFile(DOCUMENTS_FILE, {});
    if (!docs[userId]) return false;

    const initialLen = docs[userId].length;
    docs[userId] = docs[userId].filter((d) => d.id !== documentId);
    writeJsonFile(DOCUMENTS_FILE, docs);
    return docs[userId].length < initialLen;
  }
}

export const userProfileRepository = new UserProfileRepository();
