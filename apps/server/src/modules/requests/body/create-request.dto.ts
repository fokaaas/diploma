import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  CommunicationChannel,
  Priority,
} from '../../../generated/prisma/enums';
import { CreateRequestLineDto } from './create-request-line.dto';

export class CreateRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @ApiProperty({ example: 'м-р Лисенко О.' })
  @IsString()
  @IsNotEmpty()
  unitContactName!: string;

  @ApiProperty({ enum: Priority, required: false })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({ required: false, example: '2026-06-04' })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiProperty({ enum: CommunicationChannel, required: false })
  @IsEnum(CommunicationChannel)
  @IsOptional()
  channel?: CommunicationChannel;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ type: CreateRequestLineDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRequestLineDto)
  lines!: CreateRequestLineDto[];
}
