import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums';

export type InvitationState = 'VALID' | 'EXPIRED' | 'USED' | 'NOT_FOUND';

export class InvitationInfoResponse {
  @ApiProperty({ enum: ['VALID', 'EXPIRED', 'USED', 'NOT_FOUND'] })
  state!: InvitationState;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ enum: Role, required: false })
  role?: Role;

  @ApiProperty({ required: false })
  foundationName?: string;
}
