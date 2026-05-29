import { ApiProperty } from '@nestjs/swagger';
import {
  ContributionForm,
  ProcurementStatus,
  RequestStatus,
} from '../../../generated/prisma/enums';
import { CounterpartyResponse } from './counterparty.response';

export class LinkedRequestResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty({ enum: RequestStatus })
  status!: RequestStatus;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  lineCount!: number;
}

export class LinkedContributionResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty({ enum: ContributionForm })
  form!: ContributionForm;

  @ApiProperty({ required: false, nullable: true })
  purpose!: string | null;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  date!: string;
}

export class LinkedProcurementResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty({ enum: ProcurementStatus })
  status!: ProcurementStatus;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  lineCount!: number;
}

export class CounterpartyDetailResponse extends CounterpartyResponse {
  @ApiProperty({ type: LinkedRequestResponse, isArray: true })
  linkedRequests!: LinkedRequestResponse[];

  @ApiProperty({ type: LinkedContributionResponse, isArray: true })
  linkedContributions!: LinkedContributionResponse[];

  @ApiProperty({ type: LinkedProcurementResponse, isArray: true })
  linkedProcurements!: LinkedProcurementResponse[];
}
