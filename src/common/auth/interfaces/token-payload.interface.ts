import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  organizationId: string;
  legalEntityId?: string | null;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId: string;
  legalEntityId?: string | null;
  role: Role;
}
