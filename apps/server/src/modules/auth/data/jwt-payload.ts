import type { Role } from '../../../generated/prisma/enums';

export interface JwtPayload {
  sub: string;
  type: 'USER' | 'PLATFORM';
  foundationId?: string;
  role?: Role;
}
