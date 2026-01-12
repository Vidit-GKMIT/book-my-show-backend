import { SetMetadata } from '@nestjs/common';
export enum Role {
  ADMIN = 'Admin',
  THEATRE_OWNER = 'Theatre Owner',
  CUSTOMER = 'Customer',
}

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
