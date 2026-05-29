import { ApiProperty } from '@nestjs/swagger';
import { ReportFormat, ReportKind } from '../../../generated/prisma/enums';

export class ReportResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ReportKind })
  kind!: ReportKind;

  @ApiProperty({ enum: ReportFormat })
  format!: ReportFormat;

  @ApiProperty()
  periodStart!: string;

  @ApiProperty()
  periodEnd!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  generatedByName!: string;

  @ApiProperty()
  sizeBytes!: number;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty({ required: false, nullable: true })
  fileId!: string | null;

  @ApiProperty({ required: false, nullable: true })
  publicSlug!: string | null;
}
