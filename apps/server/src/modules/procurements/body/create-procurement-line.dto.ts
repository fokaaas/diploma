import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProcurementLineDto {
  @ApiProperty({ example: 'FPV-дрон 7"' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 14800 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
