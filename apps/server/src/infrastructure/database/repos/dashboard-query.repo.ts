import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  ProcurementStatus,
  RequestStatus,
} from '../../../generated/prisma/enums';

@Injectable()
export class DashboardQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  countRequests(foundationId: string, statuses: RequestStatus[]) {
    return this.prisma.request.count({
      where: { foundationId, status: { in: statuses } },
    });
  }

  countRequestsCreatedSince(foundationId: string, since: Date) {
    return this.prisma.request.count({
      where: { foundationId, createdAt: { gte: since } },
    });
  }

  countCriticalRequests(foundationId: string, statuses: RequestStatus[]) {
    return this.prisma.request.count({
      where: { foundationId, status: { in: statuses }, priority: 'HIGH' },
    });
  }

  aggregateProcurements(foundationId: string, statuses: ProcurementStatus[]) {
    return this.prisma.procurement.aggregate({
      where: { foundationId, status: { in: statuses } },
      _count: true,
      _sum: { totalAmount: true },
    });
  }

  async sumMonetary(
    foundationId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const result = await this.prisma.contribution.aggregate({
      where: {
        foundationId,
        form: 'MONETARY',
        occurredAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  monetaryInRange(foundationId: string, start: Date, end: Date) {
    return this.prisma.contribution.findMany({
      where: {
        foundationId,
        form: 'MONETARY',
        occurredAt: { gte: start, lte: end },
      },
      select: { occurredAt: true, amount: true },
    });
  }

  countAudit(foundationId: string, start: Date, end: Date) {
    return this.prisma.auditLog.count({
      where: { foundationId, createdAt: { gte: start, lte: end } },
    });
  }

  recentRequests(foundationId: string, take: number) {
    return this.prisma.request.findMany({
      where: { foundationId },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        number: true,
        status: true,
        createdAt: true,
        unit: { select: { name: true } },
      },
    });
  }

  recentContributions(foundationId: string, take: number) {
    return this.prisma.contribution.findMany({
      where: { foundationId },
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
      take,
      select: {
        id: true,
        number: true,
        form: true,
        amount: true,
        donor: { select: { name: true } },
      },
    });
  }
}
