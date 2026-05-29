import { ApiProperty } from '@nestjs/swagger';
import { Priority, RequestStatus } from '../../../generated/prisma/enums';

export class RequestResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  unitId!: string;

  @ApiProperty()
  unitName!: string;

  @ApiProperty()
  unitContactName!: string;

  @ApiProperty({ enum: Priority })
  priority!: Priority;

  @ApiProperty({ enum: RequestStatus })
  status!: RequestStatus;

  @ApiProperty({ required: false, nullable: true })
  deadline!: string | null;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  itemsSummary!: string;

  @ApiProperty()
  lineCount!: number;

  @ApiProperty()
  estimatedValue!: number;
}
