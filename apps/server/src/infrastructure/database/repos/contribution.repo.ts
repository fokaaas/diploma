import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { ContributionForm } from '../../../generated/prisma/enums';

export interface CreateContributionInput {
  foundationId: string;
  number: string;
  donorId: string;
  form: ContributionForm;
  amount: number;
  currency: string;
  purpose: string | null;
  baseDocumentLabel: string | null;
  itemName: string | null;
  itemQuantity: number | null;
  occurredAt: Date;
  registeredById: string;
}

export interface UpdateContributionInput {
  form?: ContributionForm;
  amount?: number;
  currency?: string;
  purpose?: string | null;
  baseDocumentLabel?: string | null;
  itemName?: string | null;
  itemQuantity?: number | null;
  occurredAt?: Date;
}

@Injectable()
export class ContributionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByFoundation(foundationId: string) {
    return this.prisma.contribution.findMany({
      where: { foundationId },
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        donor: { select: { name: true } },
        funding: { select: { allocatedAmount: true } },
      },
    });
  }

  findByIdFull(id: string) {
    return this.prisma.contribution.findUnique({
      where: { id },
      include: {
        donor: { select: { name: true, note: true } },
        registeredBy: { select: { fullName: true } },
        funding: {
          select: {
            allocatedAmount: true,
            procurement: {
              select: {
                id: true,
                number: true,
                status: true,
                totalAmount: true,
                supplier: { select: { name: true } },
                _count: { select: { lines: true } },
              },
            },
          },
        },
        files: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
            kind: true,
            createdAt: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.contribution.findUnique({ where: { id } });
  }

  findRefs(ids: string[]) {
    return this.prisma.contribution.findMany({
      where: { id: { in: ids } },
      select: { id: true, number: true },
    });
  }

  create(input: CreateContributionInput) {
    return this.prisma.contribution.create({ data: input });
  }

  updateBasics(id: string, data: UpdateContributionInput) {
    return this.prisma.contribution.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.contribution.delete({ where: { id } });
  }

  async findNumbers(foundationId: string): Promise<string[]> {
    const rows = await this.prisma.contribution.findMany({
      where: { foundationId },
      select: { number: true },
    });
    return rows.map((row) => row.number);
  }
}
