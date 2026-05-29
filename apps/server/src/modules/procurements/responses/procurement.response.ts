import { ApiProperty } from '@nestjs/swagger';
import { ProcurementStatus } from '../../../generated/prisma/enums';

export class ProcurementResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  supplierName!: string;

  @ApiProperty()
  itemsSummary!: string;

  @ApiProperty()
  lineCount!: number;

  @ApiProperty({ required: false, nullable: true })
  requestNumber!: string | null;

  @ApiProperty({ type: String, isArray: true })
  fundingNumbers!: string[];

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  date!: string;

  @ApiProperty({ enum: ProcurementStatus })
  status!: ProcurementStatus;
}
