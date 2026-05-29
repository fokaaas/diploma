import { Injectable } from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import type {
  ProcurementStatus,
  RequestStatus,
} from '../../generated/prisma/enums';
import { DashboardQueryRepository } from '../../infrastructure/database/repos/dashboard-query.repo';
import { StockLevelRepository } from '../../infrastructure/database/repos/stock-level.repo';
import { AuditService } from '../audit/audit.service';
import {
  DashboardResponse,
  LowStockItem,
  MonthlyPoint,
  RecentContribution,
  RecentRequest,
} from './responses/dashboard.response';

const OPEN_STATUSES: RequestStatus[] = ['NEW', 'CONFIRMED'];
const PROGRESS_STATUSES: RequestStatus[] = [
  'IN_PROGRESS',
  'PARTIALLY_FULFILLED',
];
const PROCUREMENT_ACTIVE: ProcurementStatus[] = ['ORDERED', 'PAID'];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TREND_MONTHS = 12;
const RECENT_TAKE = 5;
const ACTIVITY_TAKE = 6;

interface Range {
  start: Date;
  end: Date;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function ymKey(year: number, month0: number): string {
  const date = new Date(Date.UTC(year, month0, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly query: DashboardQueryRepository,
    private readonly stockLevels: StockLevelRepository,
    private readonly audit: AuditService,
  ) {}

  async overview(
    actor: UserPrincipal,
    month?: string,
  ): Promise<DashboardResponse> {
    const fid = actor.foundationId;
    const start = this.monthStart(month);
    const range = this.rangeFrom(start);
    const prev = this.rangeFrom(
      new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1)),
    );

    const [
      snapshot,
      period,
      trend,
      recentRequests,
      recentContributions,
      activity,
    ] = await Promise.all([
      this.snapshot(fid),
      this.period(fid, range, prev),
      this.buildTrend(fid, start, range.end),
      this.recentRequests(fid),
      this.recentContributions(fid),
      this.audit.recent(actor, ACTIVITY_TAKE),
    ]);

    return {
      ...snapshot,
      ...period,
      trend,
      recentRequests,
      recentContributions,
      activity,
    };
  }

  private monthStart(month?: string): Date {
    if (month) {
      const [year, m] = month.split('-').map(Number);
      return new Date(Date.UTC(year, m - 1, 1));
    }
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  private rangeFrom(start: Date): Range {
    const end = new Date(
      Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );
    return { start, end };
  }

  private async snapshot(fid: string) {
    const since = new Date(Date.now() - WEEK_MS);
    const [
      openRequests,
      openRequestsWeekDelta,
      inProgress,
      inProgressCritical,
      procurements,
      lowStockItems,
    ] = await Promise.all([
      this.query.countRequests(fid, OPEN_STATUSES),
      this.query.countRequestsCreatedSince(fid, since),
      this.query.countRequests(fid, PROGRESS_STATUSES),
      this.query.countCriticalRequests(fid, PROGRESS_STATUSES),
      this.query.aggregateProcurements(fid, PROCUREMENT_ACTIVE),
      this.lowStock(fid),
    ]);
    return {
      openRequests,
      openRequestsWeekDelta,
      inProgress,
      inProgressCritical,
      procurementsInProgress: procurements._count,
      procurementsAmount: Number(procurements._sum.totalAmount ?? 0),
      lowStockCount: lowStockItems.length,
      lowStockItems,
    };
  }

  private async period(fid: string, range: Range, prev: Range) {
    const [contributionsMonth, prevMonth, auditCount] = await Promise.all([
      this.query.sumMonetary(fid, range.start, range.end),
      this.query.sumMonetary(fid, prev.start, prev.end),
      this.query.countAudit(fid, range.start, range.end),
    ]);
    return {
      contributionsMonth,
      contributionsDeltaPct:
        prevMonth > 0
          ? Math.round(((contributionsMonth - prevMonth) / prevMonth) * 100)
          : null,
      auditCount,
    };
  }

  private async lowStock(fid: string): Promise<LowStockItem[]> {
    const levels = await this.stockLevels.findManyByFoundation(fid);
    return levels
      .filter((level) => level.quantity < level.item.minStock)
      .map((level) => ({
        itemId: level.item.id,
        name: level.item.name,
        quantity: level.quantity,
        minStock: level.item.minStock,
        unit: level.item.unit,
        warehouseName: level.warehouse.name,
      }));
  }

  private async buildTrend(
    fid: string,
    monthStart: Date,
    end: Date,
  ): Promise<MonthlyPoint[]> {
    const trendStart = new Date(
      Date.UTC(
        monthStart.getUTCFullYear(),
        monthStart.getUTCMonth() - (TREND_MONTHS - 1),
        1,
      ),
    );
    const rows = await this.query.monetaryInRange(fid, trendStart, end);
    const totals = new Map<string, number>();
    rows.forEach((row) => {
      const key = ymKey(
        row.occurredAt.getUTCFullYear(),
        row.occurredAt.getUTCMonth(),
      );
      totals.set(key, (totals.get(key) ?? 0) + Number(row.amount));
    });
    return Array.from({ length: TREND_MONTHS }, (_, index) => {
      const key = ymKey(
        trendStart.getUTCFullYear(),
        trendStart.getUTCMonth() + index,
      );
      return { month: key, total: totals.get(key) ?? 0 };
    });
  }

  private async recentRequests(fid: string): Promise<RecentRequest[]> {
    const rows = await this.query.recentRequests(fid, RECENT_TAKE);
    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      unitName: row.unit.name,
      status: row.status,
      occurredAt: row.createdAt.toISOString(),
    }));
  }

  private async recentContributions(
    fid: string,
  ): Promise<RecentContribution[]> {
    const rows = await this.query.recentContributions(fid, RECENT_TAKE);
    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      donorName: row.donor.name,
      form: row.form,
      amount: Number(row.amount),
    }));
  }
}
