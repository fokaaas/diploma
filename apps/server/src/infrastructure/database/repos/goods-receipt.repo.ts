import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreateGoodsReceiptLineInput {
  itemId: string;
  quantity: number;
  accepted: boolean;
}

export interface CreateGoodsReceiptInput {
  foundationId: string;
  procurementId: string;
  warehouseId: string;
  receivedById: string;
  note: string | null;
  lines: CreateGoodsReceiptLineInput[];
}

@Injectable()
export class GoodsReceiptRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateGoodsReceiptInput) {
    const { lines, ...rest } = input;
    return this.prisma.goodsReceipt.create({
      data: { ...rest, lines: { create: lines } },
    });
  }

  findManyByProcurement(procurementId: string) {
    return this.prisma.goodsReceipt.findMany({
      where: { procurementId },
      orderBy: { receivedAt: 'desc' },
      include: {
        warehouse: { select: { name: true } },
        lines: { include: { item: { select: { name: true } } } },
      },
    });
  }
}
