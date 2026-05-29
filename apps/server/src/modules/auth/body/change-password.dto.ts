import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty({ minLength: 10, example: 'NewStrongPass123' })
  @IsString()
  @MinLength(10)
  @Matches(/\d/, { message: 'Пароль повинен містити цифру' })
  @Matches(/[A-Za-zА-Яа-яҐЄІЇґєії]/, {
    message: 'Пароль повинен містити літеру',
  })
  newPassword!: string;
}
