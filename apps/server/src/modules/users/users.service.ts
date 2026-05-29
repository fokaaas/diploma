import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from '../../config/configuration';
import { generateToken } from '../../common/crypto';
import { ROLE_LABELS } from '../../common/role-labels';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { EmailService } from '../../infrastructure/email/email.service';
import { UserStatus } from '../../generated/prisma/enums';
import { UserRepository } from '../../infrastructure/database/repos/user.repo';
import { InvitationRepository } from '../../infrastructure/database/repos/invitation.repo';
import type { InviteUserDto } from './body/invite-user.dto';
import type { ChangeRoleDto } from './body/change-role.dto';
import type { UserResponse } from './responses/user.response';
import type { InvitationResponse } from './responses/invitation.response';
import type { MemberResponse } from './responses/member.response';

const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

type UserRecord = Awaited<ReturnType<UserRepository['create']>>;
type InvitationRecord = Awaited<ReturnType<InvitationRepository['create']>>;

@Injectable()
export class UsersService {
  constructor(
    private readonly users: UserRepository,
    private readonly invitations: InvitationRepository,
    private readonly email: EmailService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
  ) {}

  async invite(
    actor: UserPrincipal,
    dto: InviteUserDto,
  ): Promise<InvitationResponse> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Користувач з таким email вже існує');
    }
    const inviter = await this.users.findById(actor.sub);
    if (!inviter) {
      throw new UnauthorizedException();
    }

    await this.users.create({
      foundationId: actor.foundationId,
      fullName: dto.fullName,
      email: dto.email,
      role: dto.role,
      status: UserStatus.INVITED,
    });

    const token = generateToken();
    const invitation = await this.invitations.create({
      foundationId: actor.foundationId,
      email: dto.email,
      role: dto.role,
      token,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      invitedById: actor.sub,
      message: dto.message,
    });

    await this.email.sendInvitation(dto.email, {
      recipientName: dto.fullName,
      foundationName: inviter.foundation.name,
      roleLabel: ROLE_LABELS[dto.role],
      inviterName: inviter.fullName,
      email: dto.email,
      acceptUrl: `${this.app.webAppUrl}/invite?token=${token}`,
    });

    return this.toInvitation(invitation);
  }

  async list(actor: UserPrincipal): Promise<UserResponse[]> {
    const users = await this.users.findManyByFoundation(actor.foundationId);
    return users.map((user) => this.toUser(user));
  }

  async listMembers(actor: UserPrincipal): Promise<MemberResponse[]> {
    const users = await this.users.findManyByFoundation(actor.foundationId);
    return users
      .filter((user) => user.status === UserStatus.ACTIVE)
      .map((user) => ({
        id: user.id,
        fullName: user.fullName,
        role: user.role,
      }));
  }

  async setBlocked(
    actor: UserPrincipal,
    userId: string,
    blocked: boolean,
  ): Promise<UserResponse> {
    if (userId === actor.sub) {
      throw new BadRequestException('Не можна змінити власний статус');
    }
    const target = await this.users.findById(userId);
    if (!target || target.foundationId !== actor.foundationId) {
      throw new NotFoundException('Користувача не знайдено');
    }
    const updated = await this.users.setStatus(
      userId,
      blocked ? UserStatus.BLOCKED : UserStatus.ACTIVE,
    );
    return this.toUser(updated);
  }

  async changeRole(
    actor: UserPrincipal,
    userId: string,
    dto: ChangeRoleDto,
  ): Promise<UserResponse> {
    if (userId === actor.sub) {
      throw new BadRequestException('Не можна змінити власну роль');
    }
    const target = await this.users.findById(userId);
    if (!target || target.foundationId !== actor.foundationId) {
      throw new NotFoundException('Користувача не знайдено');
    }
    const updated = await this.users.setRole(userId, dto.role);
    return this.toUser(updated);
  }

  async resendInvitation(
    actor: UserPrincipal,
    userId: string,
  ): Promise<InvitationResponse> {
    const target = await this.users.findById(userId);
    if (!target || target.foundationId !== actor.foundationId) {
      throw new NotFoundException('Користувача не знайдено');
    }
    if (target.status !== UserStatus.INVITED) {
      throw new BadRequestException(
        'Повторно надіслати запрошення можна лише запрошеному користувачу',
      );
    }
    await this.invitations.revokePendingForEmail(
      actor.foundationId,
      target.email,
    );
    const token = generateToken();
    const invitation = await this.invitations.create({
      foundationId: actor.foundationId,
      email: target.email,
      role: target.role,
      token,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      invitedById: actor.sub,
    });
    await this.email.sendInvitation(target.email, {
      recipientName: target.fullName,
      foundationName: target.foundation.name,
      roleLabel: ROLE_LABELS[target.role],
      inviterName: target.foundation.name,
      email: target.email,
      acceptUrl: `${this.app.webAppUrl}/invite?token=${token}`,
    });
    return this.toInvitation(invitation);
  }

  private toUser(user: UserRecord): UserResponse {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      lastSeenAt: user.lastSeenAt,
    };
  }

  private toInvitation(invitation: InvitationRecord): InvitationResponse {
    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };
  }
}
