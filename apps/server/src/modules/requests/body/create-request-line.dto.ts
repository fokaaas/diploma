import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateRequestLineDto {
  @ApiProperty({ example: 'FPV-дрон 7"' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ required: false, example: 'DRN-FPV-7' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'шт' })
  @IsString()
  @IsNotEmpty()
  unit!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  techSpec?: string;
}
