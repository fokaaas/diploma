import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { ReportFormat, ReportKind } from '../../../generated/prisma/enums';

export interface CreateReportInput {
  foundationId: string;
  title: string;
  kind: ReportKind;
  format: ReportFormat;
  periodStart: Date;
  periodEnd: Date;
  generatedById: string;
  isPublished: boolean;
  publishedAt: Date | null;
  publicSlug: string | null;
  snapshot: object;
}

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateReportInput) {
    return this.prisma.report.create({
      data: { ...input, snapshot: input.snapshot },
    });
  }

  findManyByFoundation(foundationId: string) {
    return this.prisma.report.findMany({
      where: { foundationId },
      orderBy: { createdAt: 'desc' },
      include: {
        generatedBy: { select: { fullName: true } },
        files: { select: { id: true, sizeBytes: true } },
      },
    });
  }

  findByIdWithMeta(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        generatedBy: { select: { fullName: true } },
        files: { select: { id: true, sizeBytes: true } },
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.report.findUnique({
      where: { publicSlug: slug },
      include: { foundation: { select: { name: true } } },
    });
  }
}
