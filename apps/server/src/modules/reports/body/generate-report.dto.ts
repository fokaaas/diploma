import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsIn } from 'class-validator';
import type { Dimension, ReportType } from '../data/report-table';
import type { ExportFormat } from '../report-writers/write-report';

const TYPES: ReportType[] = [
  'EXPENSES',
  'CONTRIBUTIONS',
  'REQUESTS',
  'MOVEMENTS',
  'BALANCE',
];
const DIMENSIONS: Dimension[] = [
  'UNIT',
  'DONOR',
  'CATEGORY',
  'SUPPLIER',
  'COORDINATOR',
];
const FORMATS: ExportFormat[] = ['XLSX', 'PDF', 'CSV'];

export class GenerateReportDto {
  @ApiProperty({ enum: TYPES })
  @IsIn(TYPES)
  type!: ReportType;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  periodEnd!: string;

  @ApiProperty({ enum: DIMENSIONS, isArray: true })
  @IsArray()
  @IsIn(DIMENSIONS, { each: true })
  dimensions!: Dimension[];

  @ApiProperty({ enum: FORMATS })
  @IsIn(FORMATS)
  format!: ExportFormat;
}
