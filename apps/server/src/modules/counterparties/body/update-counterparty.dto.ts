import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CommunicationChannel,
  LegalForm,
} from '../../../generated/prisma/enums';

export class UpdateCounterpartyDto {
  @ApiProperty({ required: false, example: '93 ОМБр «Холодний Яр»' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: LegalForm, required: false })
  @IsEnum(LegalForm)
  @IsOptional()
  legalForm?: LegalForm;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: CommunicationChannel, required: false })
  @IsEnum(CommunicationChannel)
  @IsOptional()
  channel?: CommunicationChannel;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ required: false, example: '2024-11-14' })
  @IsDateString()
  @IsOptional()
  firstContactAt?: string;
}
