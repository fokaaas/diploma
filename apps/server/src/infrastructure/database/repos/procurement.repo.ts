import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { ProcurementStatus } from '../../../generated/prisma/enums';

export interface CreateProcurementLineInput {
  itemId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface FundingInput {
  contributionId: string;
  allocatedAmount: number;
}

export interface CreateProcurementInput {
  foundationId: string;
  number: string;
  supplierId: string;
  requestId: string | null;
  status: ProcurementStatus;
  totalAmount: number;
  orderedAt: Date;
  createdById: string;
  lines: CreateProcurementLineInput[];
  funding: FundingInput[];
}

export interface UpdateProcurementInput {
  requestId?: string | null;
  orderedAt?: Date;
  totalAmount?: number;
}

@Injectable()
export class ProcurementRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByFoundation(foundationId: string) {
    return this.prisma.procurement.findMany({
      where: { foundationId },
      orderBy: [{ orderedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        supplier: { select: { name: true } },
        request: { select: { number: true } },
        funding: { select: { contribution: { select: { number: true } } } },
        lines: { select: { name: true, quantity: true } },
      },
    });
  }

  findByIdFull(id: string) {
    return this.prisma.procurement.findUnique({
      where: { id },
      include: {
        supplier: { select: { name: true } },
        request: { select: { number: true, unit: { select: { name: true } } } },
        createdBy: { select: { fullName: true } },
        lines: { orderBy: { id: 'asc' } },
        funding: {
          select: {
            allocatedAmount: true,
            contribution: {
              select: {
                id: true,
                number: true,
                donor: { select: { name: true } },
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
        goodsReceipts: {
          orderBy: { receivedAt: 'desc' },
          include: {
            warehouse: { select: { name: true } },
            lines: { include: { item: { select: { name: true } } } },
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.procurement.findUnique({ where: { id } });
  }

  create(input: CreateProcurementInput) {
    const { lines, funding, ...rest } = input;
    return this.prisma.procurement.create({
      data: { ...rest, lines: { create: lines }, funding: { create: funding } },
    });
  }

  updateBasics(id: string, data: UpdateProcurementInput) {
    return this.prisma.procurement.update({ where: { id }, data });
  }

  replaceLines(procurementId: string, lines: CreateProcurementLineInput[]) {
    return this.prisma.$transaction([
      this.prisma.procurementLine.deleteMany({ where: { procurementId } }),
      this.prisma.procurementLine.createMany({
        data: lines.map((line) => ({ ...line, procurementId })),
      }),
    ]);
  }

  replaceFunding(procurementId: string, funding: FundingInput[]) {
    return this.prisma.$transaction([
      this.prisma.procurementFunding.deleteMany({ where: { procurementId } }),
      this.prisma.procurementFunding.createMany({
        data: funding.map((f) => ({ ...f, procurementId })),
      }),
    ]);
  }

  setStatus(id: string, status: ProcurementStatus) {
    return this.prisma.procurement.update({ where: { id }, data: { status } });
  }

  delete(id: string) {
    return this.prisma.procurement.delete({ where: { id } });
  }

  async findNumbers(foundationId: string): Promise<string[]> {
    const rows = await this.prisma.procurement.findMany({
      where: { foundationId },
      select: { number: true },
    });
    return rows.map((row) => row.number);
  }

  async sumFundingForContribution(
    contributionId: string,
    excludeProcurementId?: string,
  ): Promise<number> {
    const result = await this.prisma.procurementFunding.aggregate({
      where: {
        contributionId,
        ...(excludeProcurementId
          ? { procurementId: { not: excludeProcurementId } }
          : {}),
      },
      _sum: { allocatedAmount: true },
    });
    return Number(result._sum.allocatedAmount ?? 0);
  }
}
