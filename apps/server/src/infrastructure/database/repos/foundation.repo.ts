import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  InvitationStatus,
  Role,
  UserStatus,
} from '../../../generated/prisma/enums';

interface CreateFoundationInput {
  foundation: {
    name: string;
    shortName: string;
    legalName: string;
    edrpou: string;
  };
  admin: {
    fullName: string;
    email: string;
  };
  invitation: {
    token: string;
    expiresAt: Date;
  };
}

interface UpdateFoundationInput {
  name: string;
  shortName: string;
  legalName: string;
  edrpou: string;
  taxId: string | null;
  address: string | null;
  website: string | null;
}

@Injectable()
export class FoundationRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWithFirstAdmin(input: CreateFoundationInput) {
    return this.prisma.$transaction(async (tx) => {
      const foundation = await tx.foundation.create({ data: input.foundation });
      const admin = await tx.user.create({
        data: {
          foundationId: foundation.id,
          fullName: input.admin.fullName,
          email: input.admin.email,
          role: Role.ADMIN,
          status: UserStatus.INVITED,
        },
      });
      const invitation = await tx.invitation.create({
        data: {
          foundationId: foundation.id,
          email: input.admin.email,
          role: Role.ADMIN,
          token: input.invitation.token,
          status: InvitationStatus.PENDING,
          expiresAt: input.invitation.expiresAt,
        },
      });
      return { foundation, admin, invitation };
    });
  }

  findById(id: string) {
    return this.prisma.foundation.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateFoundationInput) {
    return this.prisma.foundation.update({ where: { id }, data });
  }

  listSummaries() {
    return this.prisma.foundation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true } },
        users: {
          where: { role: Role.ADMIN },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
  }
}
