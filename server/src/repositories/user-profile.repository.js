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
            department: true,
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

    if (!user) return null;

    const avatars = readJsonFile(AVATARS_FILE, {});
    const preferences = readJsonFile(PREFERENCES_FILE, {});

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      avatarUrl: avatars[user.id] || null,
      preferences: preferences[user.id] || {
        emailNotifications: true,
        payrollAlerts: true,
        leaveAlerts: true,
        securityAlerts: true,
        theme: 'light',
      },
      organization: user.organization
        ? {
            id: user.organization.id,
            name: user.organization.name,
            code: user.organization.code,
            currency: user.organization.currency,
            timezone: user.organization.timezone,
          }
        : null,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeNum: user.employee.employeeNum,
            workEmail: user.employee.workEmail,
            personalEmail: user.employee.personalEmail,
            phone: user.employee.phone,
            bankName: user.employee.bankName,
            bankAccountMasked: user.employee.bankAccountMasked,
            joiningDate: user.employee.joiningDate,
            department: user.employee.department ? { id: user.employee.department.id, name: user.employee.department.name } : null,
            jobPosition: user.employee.jobPosition ? { id: user.employee.jobPosition.id, title: user.employee.jobPosition.title } : null,
            workingSchedule: user.employee.workingSchedule ? { id: user.employee.workingSchedule.id, name: user.employee.workingSchedule.name } : null,
            activeContract: user.employee.contracts?.[0] || null,
          }
        : null,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
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
