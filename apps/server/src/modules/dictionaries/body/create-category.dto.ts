import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'БПЛА' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
