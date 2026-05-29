import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'DRN-FPV-7' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: 'FPV-дрон 7", аналогова система' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'шт' })
  @IsString()
  @IsNotEmpty()
  unit!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lastPrice?: number;
}
