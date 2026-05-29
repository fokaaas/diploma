import { ApiProperty } from '@nestjs/swagger';
import { ProcurementStatus } from '../../../generated/prisma/enums';
import { FileResponse } from '../../files/responses/file.response';
import { ContributionResponse } from './contribution.response';

export class FundedProcurementResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  supplierName!: string;

  @ApiProperty({ enum: ProcurementStatus })
  status!: ProcurementStatus;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  lineCount!: number;
}

export class ContributionDetailResponse extends ContributionResponse {
  @ApiProperty({ required: false, nullable: true })
  itemName!: string | null;

  @ApiProperty({ required: false, nullable: true })
  itemQuantity!: number | null;

  @ApiProperty({ required: false, nullable: true })
  donorNote!: string | null;

  @ApiProperty()
  registeredByName!: string;

  @ApiProperty()
  unspent!: number;

  @ApiProperty({ type: FundedProcurementResponse, isArray: true })
  linkedProcurements!: FundedProcurementResponse[];

  @ApiProperty({ type: FileResponse, isArray: true })
  files!: FileResponse[];
}
