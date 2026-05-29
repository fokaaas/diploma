import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateProcurementLineDto } from './create-procurement-line.dto';
import { FundingAllocationDto } from './funding-allocation.dto';

export class UpdateProcurementDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  requestId?: string;

  @ApiProperty({ required: false, example: '2026-05-26' })
  @IsDateString()
  @IsOptional()
  orderedAt?: string;

  @ApiProperty({
    type: CreateProcurementLineDto,
    isArray: true,
    required: false,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProcurementLineDto)
  @IsOptional()
  lines?: CreateProcurementLineDto[];

  @ApiProperty({ type: FundingAllocationDto, isArray: true, required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundingAllocationDto)
  @IsOptional()
  funding?: FundingAllocationDto[];
}
