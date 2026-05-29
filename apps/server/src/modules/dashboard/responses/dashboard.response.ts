import { ApiProperty } from '@nestjs/swagger';
import {
  ContributionForm,
  RequestStatus,
} from '../../../generated/prisma/enums';
import { AuditEntryResponse } from '../../audit/responses/audit-entry.response';

export class MonthlyPoint {
  @ApiProperty()
  month!: string;

  @ApiProperty()
  total!: number;
}

export class RecentRequest {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  unitName!: string;

  @ApiProperty({ enum: RequestStatus })
  status!: RequestStatus;

  @ApiProperty()
  occurredAt!: string;
}

export class RecentContribution {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  donorName!: string;

  @ApiProperty({ enum: ContributionForm })
  form!: ContributionForm;

  @ApiProperty()
  amount!: number;
}

export class LowStockItem {
  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  minStock!: number;

  @ApiProperty()
  unit!: string;

  @ApiProperty()
  warehouseName!: string;
}

export class DashboardResponse {
  @ApiProperty()
  openRequests!: number;

  @ApiProperty()
  openRequestsWeekDelta!: number;

  @ApiProperty()
  inProgress!: number;

  @ApiProperty()
  inProgressCritical!: number;

  @ApiProperty()
  procurementsInProgress!: number;

  @ApiProperty()
  procurementsAmount!: number;

  @ApiProperty()
  lowStockCount!: number;

  @ApiProperty()
  contributionsMonth!: number;

  @ApiProperty({ required: false, nullable: true })
  contributionsDeltaPct!: number | null;

  @ApiProperty()
  auditCount!: number;

  @ApiProperty({ type: MonthlyPoint, isArray: true })
  trend!: MonthlyPoint[];

  @ApiProperty({ type: RecentRequest, isArray: true })
  recentRequests!: RecentRequest[];

  @ApiProperty({ type: RecentContribution, isArray: true })
  recentContributions!: RecentContribution[];

  @ApiProperty({ type: LowStockItem, isArray: true })
  lowStockItems!: LowStockItem[];

  @ApiProperty({ type: AuditEntryResponse, isArray: true })
  activity!: AuditEntryResponse[];
}
