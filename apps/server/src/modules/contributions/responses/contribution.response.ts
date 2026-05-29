import { ApiProperty } from '@nestjs/swagger';
import { ContributionForm } from '../../../generated/prisma/enums';

export class ContributionResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  donorId!: string;

  @ApiProperty()
  donorName!: string;

  @ApiProperty({ enum: ContributionForm })
  form!: ContributionForm;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ required: false, nullable: true })
  purpose!: string | null;

  @ApiProperty({ required: false, nullable: true })
  baseDocumentLabel!: string | null;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  procurementCount!: number;

  @ApiProperty()
  allocatedTotal!: number;
}
