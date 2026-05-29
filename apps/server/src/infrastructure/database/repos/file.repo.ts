import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { FileKind } from '../../../generated/prisma/enums';

export interface CreateFileInput {
  foundationId: string;
  originalName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  kind: FileKind;
  uploadedById: string;
  requestId?: string | null;
  contributionId?: string | null;
  procurementId?: string | null;
}

@Injectable()
export class FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateFileInput) {
    return this.prisma.file.create({ data: input });
  }

  findById(id: string) {
    return this.prisma.file.findUnique({ where: { id } });
  }

  findManyByRequest(requestId: string) {
    return this.prisma.file.findMany({ where: { requestId } });
  }

  findManyByContribution(contributionId: string) {
    return this.prisma.file.findMany({ where: { contributionId } });
  }

  findManyByProcurement(procurementId: string) {
    return this.prisma.file.findMany({ where: { procurementId } });
  }

  delete(id: string) {
    return this.prisma.file.delete({ where: { id } });
  }
}
