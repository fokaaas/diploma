import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StockLevelRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByFoundation(foundationId: string) {
    return this.prisma.stockLevel.findMany({
      where: { item: { foundationId } },
      orderBy: { item: { name: 'asc' } },
      include: {
        item: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
            minStock: true,
            lastPrice: true,
            category: { select: { name: true } },
          },
        },
        warehouse: { select: { id: true, name: true } },
      },
    });
  }

  findByItemWarehouse(itemId: string, warehouseId: string) {
    return this.prisma.stockLevel.findUnique({
      where: { itemId_warehouseId: { itemId, warehouseId } },
    });
  }

  increment(itemId: string, warehouseId: string, quantity: number) {
    return this.prisma.stockLevel.upsert({
      where: { itemId_warehouseId: { itemId, warehouseId } },
      create: { itemId, warehouseId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }

  decrement(itemId: string, warehouseId: string, quantity: number) {
    return this.prisma.stockLevel.update({
      where: { itemId_warehouseId: { itemId, warehouseId } },
      data: { quantity: { decrement: quantity } },
    });
  }
}
