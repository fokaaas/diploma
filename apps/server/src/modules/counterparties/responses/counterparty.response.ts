import { ApiProperty } from '@nestjs/swagger';
import {
  CommunicationChannel,
  CounterpartyType,
  LegalForm,
} from '../../../generated/prisma/enums';

export class CounterpartyResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty({ enum: CounterpartyType })
  type!: CounterpartyType;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: LegalForm })
  legalForm!: LegalForm;

  @ApiProperty({ required: false, nullable: true })
  contactPerson!: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone!: string | null;

  @ApiProperty({ required: false, nullable: true })
  email!: string | null;

  @ApiProperty({ enum: CommunicationChannel, required: false, nullable: true })
  channel!: CommunicationChannel | null;

  @ApiProperty({ required: false, nullable: true })
  note!: string | null;

  @ApiProperty({ required: false, nullable: true })
  firstContactAt!: string | null;

  @ApiProperty()
  operationsCount!: number;

  @ApiProperty({ required: false, nullable: true })
  lastInteractionAt!: string | null;
}
