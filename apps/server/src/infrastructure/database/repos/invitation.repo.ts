import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InvitationStatus, Role } from '../../../generated/prisma/enums';

interface CreateInvitationInput {
  foundationId: string;
  email: string;
  role: Role;
  token: string;
  expiresAt: Date;
  invitedById?: string;
  message?: string;
}

@Injectable()
export class InvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateInvitationInput) {
    return this.prisma.invitation.create({ data: input });
  }

  findByToken(token: string) {
    return this.prisma.invitation.findUnique({
      where: { token },
      include: { foundation: true },
    });
  }

  markAccepted(id: string) {
    return this.prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
    });
  }
}
