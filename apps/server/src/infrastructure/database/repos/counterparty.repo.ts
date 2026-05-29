import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  CommunicationChannel,
  CounterpartyType,
  LegalForm,
} from '../../../generated/prisma/enums';

export interface CreateCounterpartyInput {
  foundationId: string;
  code: string;
  type: CounterpartyType;
  name: string;
  legalForm: LegalForm;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  channel: CommunicationChannel | null;
  note: string | null;
  firstContactAt: Date | null;
}

export interface UpdateCounterpartyInput {
  name?: string;
  legalForm?: LegalForm;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  channel?: CommunicationChannel | null;
  note?: string | null;
  firstContactAt?: Date | null;
}

const latestOf = {
  select: { createdAt: true },
  orderBy: { createdAt: 'desc' as const },
  take: 1,
};

@Injectable()
export class CounterpartyRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByFoundation(foundationId: string) {
    return this.prisma.counterparty.findMany({
      where: { foundationId },
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: {
            requestsAsUnit: true,
            contributionsAsDonor: true,
            procurementsAsSupplier: true,
          },
        },
        requestsAsUnit: latestOf,
        contributionsAsDonor: latestOf,
        procurementsAsSupplier: latestOf,
      },
    });
  }

  findByIdWithOperations(id: string) {
    return this.prisma.counterparty.findUnique({
      where: { id },
      include: {
        requestsAsUnit: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            number: true,
            status: true,
            createdAt: true,
            _count: { select: { lines: true } },
          },
        },
        contributionsAsDonor: {
          orderBy: { occurredAt: 'desc' },
          select: {
            id: true,
            number: true,
            form: true,
            purpose: true,
            amount: true,
            occurredAt: true,
          },
        },
        procurementsAsSupplier: {
          orderBy: { orderedAt: 'desc' },
          select: {
            id: true,
            number: true,
            status: true,
            totalAmount: true,
            orderedAt: true,
            _count: { select: { lines: true } },
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.counterparty.findUnique({ where: { id } });
  }

  search(foundationId: string, q: string, take: number) {
    return this.prisma.counterparty.findMany({
      where: {
        foundationId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { contactPerson: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { code: 'asc' },
      take,
      select: { id: true, code: true, name: true, type: true },
    });
  }

  create(input: CreateCounterpartyInput) {
    return this.prisma.counterparty.create({ data: input });
  }

  update(id: string, data: UpdateCounterpartyInput) {
    return this.prisma.counterparty.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.counterparty.delete({ where: { id } });
  }

  async findCodesByType(
    foundationId: string,
    type: CounterpartyType,
  ): Promise<string[]> {
    const rows = await this.prisma.counterparty.findMany({
      where: { foundationId, type },
      select: { code: true },
    });
    return rows.map((row) => row.code);
  }
}
