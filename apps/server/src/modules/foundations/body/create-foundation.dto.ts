import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateFoundationDto {
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

  @ApiProperty({ example: 'Ім’я Прізвище' })
  @IsString()
  @IsNotEmpty()
  adminFullName!: string;

  @ApiProperty({ example: 'admin@example.org' })
  @IsEmail()
  adminEmail!: string;
}
