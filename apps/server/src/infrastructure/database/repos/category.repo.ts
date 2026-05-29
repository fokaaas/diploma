import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByFoundation(foundationId: string) {
    return this.prisma.category.findMany({
      where: { foundationId },
      orderBy: { name: 'asc' },
    });
  }

  create(input: { foundationId: string; name: string }) {
    return this.prisma.category.create({ data: input });
  }

  findById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
