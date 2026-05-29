import { ApiProperty } from '@nestjs/swagger';

export class FoundationResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  shortName!: string;

  @ApiProperty()
  legalName!: string;

  @ApiProperty()
  edrpou!: string;

  @ApiProperty({ required: false, nullable: true })
  taxId!: string | null;

  @ApiProperty({ required: false, nullable: true })
  address!: string | null;

  @ApiProperty({ required: false, nullable: true })
  website!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
