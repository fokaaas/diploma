import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface CreateItemInput {
  foundationId: string;
  categoryId: string;
  sku: string;
  name: string;
  unit: string;
  minStock: number;
  lastPrice: number | null;
}

@Injectable()
export class ItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByFoundation(foundationId: string) {
    return this.prisma.item.findMany({
      where: { foundationId },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  create(input: CreateItemInput) {
    return this.prisma.item.create({ data: input });
  }

  findById(id: string) {
    return this.prisma.item.findUnique({ where: { id } });
  }

  delete(id: string) {
    return this.prisma.item.delete({ where: { id } });
  }
}
