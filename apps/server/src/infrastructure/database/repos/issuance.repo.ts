import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreateIssuanceLineInput {
  itemId: string;
  warehouseId: string;
  quantity: number;
}

export interface CreateIssuanceInput {
  foundationId: string;
  requestId: string;
  recipientName: string;
  deliveryMethod: string | null;
  issuedById: string;
  lines: CreateIssuanceLineInput[];
}

@Injectable()
export class IssuanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateIssuanceInput) {
    const { lines, ...rest } = input;
    return this.prisma.issuance.create({
      data: { ...rest, lines: { create: lines } },
    });
  }
}
