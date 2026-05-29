import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFoundationDto {
  @ApiProperty({ example: 'Благодійний фонд «...»' })
  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @ApiProperty({ example: 'Назва фонду' })
  @IsString()
  @IsNotEmpty()
  shortName!: string;

  @ApiProperty({ example: '44XXXXXX' })
  @IsString()
  @IsNotEmpty()
  edrpou!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  website?: string;
}
