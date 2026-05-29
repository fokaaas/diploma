import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Іван Дорошенко' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;
}
