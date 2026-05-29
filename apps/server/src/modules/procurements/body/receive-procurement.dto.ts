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

export class ReceiveLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  procurementLineId!: string;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class ReceiveProcurementDto {
  @ApiProperty({ example: 'Основний склад' })
  @IsString()
  @IsNotEmpty()
  warehouseName!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ type: ReceiveLineDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiveLineDto)
  lines!: ReceiveLineDto[];
}
