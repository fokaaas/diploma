import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ContributionForm } from '../../../generated/prisma/enums';

export class UpdateContributionDto {
  @ApiProperty({ enum: ContributionForm, required: false })
  @IsEnum(ContributionForm)
  @IsOptional()
  form?: ContributionForm;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  baseDocumentLabel?: string;

  @ApiProperty({ required: false, example: '2026-05-25' })
  @IsDateString()
  @IsOptional()
  occurredAt?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  itemName?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  itemQuantity?: number;
}
