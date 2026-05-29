import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { MovementType } from '../../../generated/prisma/enums';

export interface CreateMovementInput {
  foundationId: string;
  number: string;
  type: MovementType;
  itemId: string;
  warehouseId: string;
  quantity: number;
  performedById: string;
  goodsReceiptId?: string | null;
  issuanceId?: string | null;
}

function maxSuffix(numbers: string[]): number {
  let max = 0;
  for (const number of numbers) {
    const match = /-(\d+)$/.exec(number);
    const value = match ? Number(match[1]) : NaN;
    if (!Number.isNaN(value) && value > max) max = value;
  }
  return max;
}

@Injectable()
export class StockMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateMovementInput) {
    return this.prisma.stockMovement.create({ data: input });
  }

  findManyByFoundation(foundationId: string) {
    return this.prisma.stockMovement.findMany({
      where: { foundationId },
      orderBy: { occurredAt: 'desc' },
      include: {
        item: { select: { name: true } },
        warehouse: { select: { name: true } },
        performedBy: { select: { fullName: true } },
        goodsReceipt: {
          select: { procurement: { select: { number: true } } },
        },
        issuance: { select: { request: { select: { number: true } } } },
      },
    });
  }

  async nextNumbers(foundationId: string, count: number): Promise<string[]> {
    const rows = await this.prisma.stockMovement.findMany({
      where: { foundationId },
      select: { number: true },
    });
    const start = maxSuffix(rows.map((row) => row.number)) + 1;
    return Array.from(
      { length: count },
      (_, i) => `M-${String(start + i).padStart(4, '0')}`,
    );
  }
}
