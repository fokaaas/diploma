import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  CommunicationChannel,
  Priority,
  RequestStatus,
} from '../../../generated/prisma/enums';

export interface CreateRequestLineInput {
  itemId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  unit: string;
  techSpec: string | null;
}

export interface CreateRequestInput {
  foundationId: string;
  number: string;
  unitId: string;
  unitContactName: string;
  priority: Priority;
  status: RequestStatus;
  deadline: Date | null;
  channel: CommunicationChannel | null;
  registeredById: string;
  assigneeId: string | null;
  lines: CreateRequestLineInput[];
}

export interface UpdateRequestInput {
  unitContactName?: string;
  priority?: Priority;
  deadline?: Date | null;
  channel?: CommunicationChannel | null;
  assigneeId?: string | null;
}

@Injectable()
export class RequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByFoundation(foundationId: string) {
    return this.prisma.request.findMany({
      where: { foundationId },
      orderBy: { createdAt: 'desc' },
      include: {
        unit: { select: { name: true } },
        lines: {
          select: {
            name: true,
            quantity: true,
            item: { select: { lastPrice: true } },
          },
        },
      },
    });
  }

  findByIdFull(id: string) {
    return this.prisma.request.findUnique({
      where: { id },
      include: {
        unit: {
          select: { name: true, note: true, phone: true, channel: true },
        },
        registeredBy: { select: { fullName: true } },
        assignee: { select: { fullName: true } },
        lines: {
          orderBy: { id: 'asc' },
          include: { item: { select: { lastPrice: true } } },
        },
        procurements: {
          orderBy: { orderedAt: 'desc' },
          select: {
            id: true,
            number: true,
            status: true,
            totalAmount: true,
            supplier: { select: { name: true } },
            _count: { select: { lines: true } },
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
    return this.prisma.request.findUnique({ where: { id } });
  }

  create(input: CreateRequestInput) {
    const { lines, ...rest } = input;
    return this.prisma.request.create({
      data: { ...rest, lines: { create: lines } },
    });
  }

  updateBasics(id: string, data: UpdateRequestInput) {
    return this.prisma.request.update({ where: { id }, data });
  }

  replaceLines(requestId: string, lines: CreateRequestLineInput[]) {
    return this.prisma.$transaction([
      this.prisma.requestLine.deleteMany({ where: { requestId } }),
      this.prisma.requestLine.createMany({
        data: lines.map((line) => ({ ...line, requestId })),
      }),
    ]);
  }

  setStatus(id: string, status: RequestStatus) {
    return this.prisma.request.update({ where: { id }, data: { status } });
  }

  delete(id: string) {
    return this.prisma.request.delete({ where: { id } });
  }

  async findNumbers(foundationId: string): Promise<string[]> {
    const rows = await this.prisma.request.findMany({
      where: { foundationId },
      select: { number: true },
    });
    return rows.map((row) => row.number);
  }
}
