import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class InviteUserDto {
  @ApiProperty({ example: 'Іван Дорошенко' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'colleague@example.org' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  message?: string;
}
