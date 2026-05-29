import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateProcurementLineDto } from './create-procurement-line.dto';
import { FundingAllocationDto } from './funding-allocation.dto';

export class CreateProcurementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  requestId?: string;

  @ApiProperty({ example: '2026-05-26' })
  @IsDateString()
  orderedAt!: string;

  @ApiProperty({ type: CreateProcurementLineDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProcurementLineDto)
  lines!: CreateProcurementLineDto[];

  @ApiProperty({ type: FundingAllocationDto, isArray: true, required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundingAllocationDto)
  @IsOptional()
  funding?: FundingAllocationDto[];
}
