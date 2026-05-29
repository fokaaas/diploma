import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreateAuditInput {
  foundationId: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
}

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateAuditInput) {
    return this.prisma.auditLog.create({ data: input });
  }

  findByTarget(foundationId: string, targetType: string, targetId: string) {
    return this.prisma.auditLog.findMany({
      where: { foundationId, targetType, targetId },
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { fullName: true } } },
    });
  }

  findManyByFoundation(foundationId: string, take = 1000) {
    return this.prisma.auditLog.findMany({
      where: { foundationId },
      orderBy: { createdAt: 'desc' },
      take,
      include: { actor: { select: { fullName: true } } },
    });
  }
}
