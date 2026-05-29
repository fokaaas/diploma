import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsIn } from 'class-validator';
import type { PublicSection } from '../data/public-snapshot';

const SECTIONS: PublicSection[] = ['funds', 'expenses', 'needs', 'donors'];

export class PublicReportDto {
  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  periodEnd!: string;

  @ApiProperty({ enum: SECTIONS, isArray: true })
  @IsArray()
  @IsIn(SECTIONS, { each: true })
  sections!: PublicSection[];
}
