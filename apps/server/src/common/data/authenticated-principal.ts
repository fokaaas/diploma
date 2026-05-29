import type { Role } from '../../generated/prisma/enums';

export interface UserPrincipal {
  type: 'USER';
  sub: string;
  foundationId: string;
  role: Role;
}

export interface PlatformPrincipal {
  type: 'PLATFORM';
  sub: string;
}

export type AuthenticatedPrincipal = UserPrincipal | PlatformPrincipal;
