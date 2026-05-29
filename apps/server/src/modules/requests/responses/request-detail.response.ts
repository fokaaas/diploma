import { ApiProperty } from '@nestjs/swagger';
import {
  CommunicationChannel,
  ProcurementStatus,
} from '../../../generated/prisma/enums';
import { FileResponse } from '../../files/responses/file.response';
import { RequestResponse } from './request.response';

export class RequestLineResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  sku!: string | null;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unit!: string;

  @ApiProperty({ required: false, nullable: true })
  techSpec!: string | null;

  @ApiProperty()
  receivedQuantity!: number;

  @ApiProperty({ required: false, nullable: true })
  lineTotal!: number | null;
}

export class LinkedProcurementResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  supplierName!: string;

  @ApiProperty({ enum: ProcurementStatus })
  status!: ProcurementStatus;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  lineCount!: number;
}

export class HistoryEntryResponse {
  @ApiProperty()
  action!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty()
  actorName!: string;

  @ApiProperty()
  createdAt!: string;
}

export class RequestDetailResponse extends RequestResponse {
  @ApiProperty({ enum: CommunicationChannel, required: false, nullable: true })
  channel!: CommunicationChannel | null;

  @ApiProperty({ required: false, nullable: true })
  unitNote!: string | null;

  @ApiProperty({ required: false, nullable: true })
  unitPhone!: string | null;

  @ApiProperty()
  registeredByName!: string;

  @ApiProperty({ required: false, nullable: true })
  assigneeName!: string | null;

  @ApiProperty({ type: RequestLineResponse, isArray: true })
  lines!: RequestLineResponse[];

  @ApiProperty({ type: FileResponse, isArray: true })
  files!: FileResponse[];

  @ApiProperty({ type: LinkedProcurementResponse, isArray: true })
  linkedProcurements!: LinkedProcurementResponse[];

  @ApiProperty({ type: HistoryEntryResponse, isArray: true })
  history!: HistoryEntryResponse[];
}
