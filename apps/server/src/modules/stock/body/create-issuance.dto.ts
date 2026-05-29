import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class IssuanceLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateIssuanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @ApiProperty({ example: 'ст. с-т Дорош М.' })
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  deliveryMethod?: string;

  @ApiProperty({ example: 'Основний склад' })
  @IsString()
  @IsNotEmpty()
  warehouseName!: string;

  @ApiProperty({ type: IssuanceLineDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => IssuanceLineDto)
  lines!: IssuanceLineDto[];
}
