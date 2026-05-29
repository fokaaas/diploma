import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '../../../generated/prisma/enums';

export class UserResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  lastSeenAt!: Date | null;
}
