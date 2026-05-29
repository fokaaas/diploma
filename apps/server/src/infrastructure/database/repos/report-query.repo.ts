import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  expenseLines(foundationId: string, start: Date, end: Date) {
    return this.prisma.procurementLine.findMany({
      where: {
        procurement: { foundationId, orderedAt: { gte: start, lte: end } },
      },
      select: {
        lineTotal: true,
        item: { select: { category: { select: { name: true } } } },
        procurement: {
          select: {
            supplier: { select: { name: true } },
            createdBy: { select: { fullName: true } },
            request: { select: { unit: { select: { name: true } } } },
          },
        },
      },
    });
  }

  procurements(foundationId: string, start: Date, end: Date) {
    return this.prisma.procurement.findMany({
      where: { foundationId, orderedAt: { gte: start, lte: end } },
      select: { totalAmount: true },
    });
  }

  contributions(foundationId: string, start: Date, end: Date) {
    return this.prisma.contribution.findMany({
      where: { foundationId, occurredAt: { gte: start, lte: end } },
      select: { amount: true, donor: { select: { name: true } } },
    });
  }

  requests(foundationId: string, start: Date, end: Date) {
    return this.prisma.request.findMany({
      where: { foundationId, createdAt: { gte: start, lte: end } },
      select: {
        status: true,
        unit: { select: { name: true, note: true } },
        registeredBy: { select: { fullName: true } },
        lines: {
          select: {
            name: true,
            quantity: true,
            receivedQuantity: true,
            item: { select: { lastPrice: true } },
          },
        },
      },
    });
  }

  movements(foundationId: string, start: Date, end: Date) {
    return this.prisma.stockMovement.findMany({
      where: { foundationId, occurredAt: { gte: start, lte: end } },
      select: {
        type: true,
        quantity: true,
        item: { select: { category: { select: { name: true } } } },
      },
    });
  }
}
