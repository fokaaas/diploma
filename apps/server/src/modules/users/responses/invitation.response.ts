import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus, Role } from '../../../generated/prisma/enums';

export class InvitationResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty({ enum: InvitationStatus })
  status!: InvitationStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  expiresAt!: Date;
}
