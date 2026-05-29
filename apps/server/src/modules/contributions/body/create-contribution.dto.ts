import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ContributionForm } from '../../../generated/prisma/enums';

export class CreateContributionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  donorId!: string;

  @ApiProperty({ enum: ContributionForm })
  @IsEnum(ContributionForm)
  form!: ContributionForm;

  @ApiProperty({ example: 245000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ required: false, default: 'UAH' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty({ required: false, example: 'Платіжне доручення №412' })
  @IsString()
  @IsOptional()
  baseDocumentLabel?: string;

  @ApiProperty({ example: '2026-05-25' })
  @IsDateString()
  occurredAt!: string;

  @ApiProperty({ required: false, example: 'Аптечка IFAK' })
  @IsString()
  @IsOptional()
  itemName?: string;

  @ApiProperty({ required: false, example: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  itemQuantity?: number;
}
