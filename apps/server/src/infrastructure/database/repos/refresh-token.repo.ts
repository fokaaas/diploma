import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface CreateRefreshTokenInput {
  tokenHash: string;
  expiresAt: Date;
  userId?: string;
  platformAdminId?: string;
}

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateRefreshTokenInput) {
    return this.prisma.refreshToken.create({ data: input });
  }

  findByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  revoke(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
