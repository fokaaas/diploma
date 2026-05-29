import { ApiProperty } from '@nestjs/swagger';
import { FileResponse } from '../../files/responses/file.response';
import { ProcurementResponse } from './procurement.response';

export class ProcurementLineResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false, nullable: true })
  itemId!: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  sku!: string | null;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  lineTotal!: number;
}

export class FundingSourceResponse {
  @ApiProperty()
  contributionId!: string;

  @ApiProperty()
  contributionNumber!: string;

  @ApiProperty()
  donorName!: string;

  @ApiProperty()
  allocatedAmount!: number;
}

export class GoodsReceiptLineResponse {
  @ApiProperty()
  itemName!: string;

  @ApiProperty()
  quantity!: number;
}

export class GoodsReceiptResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  warehouseName!: string;

  @ApiProperty()
  receivedAt!: string;

  @ApiProperty({ required: false, nullable: true })
  note!: string | null;

  @ApiProperty({ type: GoodsReceiptLineResponse, isArray: true })
  lines!: GoodsReceiptLineResponse[];
}

export class ProcHistoryEntryResponse {
  @ApiProperty()
  action!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty()
  actorName!: string;

  @ApiProperty()
  createdAt!: string;
}

export class ProcurementDetailResponse extends ProcurementResponse {
  @ApiProperty()
  supplierId!: string;

  @ApiProperty({ required: false, nullable: true })
  requestId!: string | null;

  @ApiProperty({ required: false, nullable: true })
  requestUnitName!: string | null;

  @ApiProperty()
  createdByName!: string;

  @ApiProperty()
  fundedTotal!: number;

  @ApiProperty({ type: ProcurementLineResponse, isArray: true })
  lines!: ProcurementLineResponse[];

  @ApiProperty({ type: FundingSourceResponse, isArray: true })
  funding!: FundingSourceResponse[];

  @ApiProperty({ type: GoodsReceiptResponse, isArray: true })
  goodsReceipts!: GoodsReceiptResponse[];

  @ApiProperty({ type: FileResponse, isArray: true })
  files!: FileResponse[];

  @ApiProperty({ type: ProcHistoryEntryResponse, isArray: true })
  history!: ProcHistoryEntryResponse[];
}
