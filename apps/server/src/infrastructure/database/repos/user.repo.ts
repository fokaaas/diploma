import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, UserStatus } from '../../../generated/prisma/enums';

interface CreateUserInput {
  foundationId: string;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateUserInput) {
    return this.prisma.user.create({ data: input });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { foundation: true },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { foundation: true },
    });
  }

  findManyByFoundation(foundationId: string) {
    return this.prisma.user.findMany({
      where: { foundationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  activate(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, status: UserStatus.ACTIVE, lastSeenAt: new Date() },
    });
  }

  setPassword(id: string, passwordHash: string) {
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  setStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  setRole(id: string, role: Role) {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  setFullName(id: string, fullName: string) {
    return this.prisma.user.update({ where: { id }, data: { fullName } });
  }

  setTotp(id: string, totpSecret: string, totpEnabledAt: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { totpSecret, totpEnabledAt },
    });
  }

  touchLastSeen(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
  }

  findRefs(ids: string[]) {
    return this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, fullName: true },
    });
  }
}
