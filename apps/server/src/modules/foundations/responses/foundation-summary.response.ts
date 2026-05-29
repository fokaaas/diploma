import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../generated/prisma/enums';

export class FoundationSummaryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  userCount!: number;

  @ApiProperty({ required: false })
  adminName?: string;

  @ApiProperty({ required: false })
  adminEmail?: string;

  @ApiProperty({ enum: UserStatus, required: false })
  adminStatus?: UserStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
