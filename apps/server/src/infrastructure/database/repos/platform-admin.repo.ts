import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlatformAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.platformAdmin.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.platformAdmin.findUnique({ where: { id } });
  }

  setTotp(id: string, totpSecret: string, totpEnabledAt: Date) {
    return this.prisma.platformAdmin.update({
      where: { id },
      data: { totpSecret, totpEnabledAt },
    });
  }
}
