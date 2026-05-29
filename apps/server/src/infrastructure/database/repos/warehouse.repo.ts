import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WarehouseRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByFoundation(foundationId: string) {
    return this.prisma.warehouse.findMany({
      where: { foundationId },
      orderBy: { name: 'asc' },
    });
  }

  findByName(foundationId: string, name: string) {
    return this.prisma.warehouse.findUnique({
      where: { foundationId_name: { foundationId, name } },
    });
  }

  create(input: { foundationId: string; name: string }) {
    return this.prisma.warehouse.create({ data: input });
  }
}
