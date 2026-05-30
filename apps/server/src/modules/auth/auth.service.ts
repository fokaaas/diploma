import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from '../../config/configuration';
import { generateToken, hashToken } from '../../common/crypto';
import { EmailService } from '../../infrastructure/email/email.service';
import {
  InvitationStatus,
  Role,
  UserStatus,
} from '../../generated/prisma/enums';
import { UserRepository } from '../../infrastructure/database/repos/user.repo';
import { InvitationRepository } from '../../infrastructure/database/repos/invitation.repo';
import { PasswordResetRepository } from '../../infrastructure/database/repos/password-reset.repo';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { TotpService } from './totp.service';
import { TwoFactorTicketService } from './two-factor-ticket.service';
import type { IssuedTokens } from './data/issued-tokens';
import type { AuthSessionResponse } from './responses/auth-session.response';
import type { TwoFactorChallengeResponse } from './responses/two-factor-challenge.response';
import type { TwoFactorDto } from './body/two-factor.dto';
import type { AuthTokensResponse } from './responses/auth-tokens.response';
import type { SessionUserResponse } from './responses/session-user.response';
import type { InvitationInfoResponse } from './responses/invitation-info.response';
import type { MessageResponse } from '../../common/data/message.response';
import type { LoginDto } from './body/login.dto';
import type { AcceptInvitationDto } from './body/accept-invitation.dto';
import type { ForgotPasswordDto } from './body/forgot-password.dto';
import type { ResetPasswordDto } from './body/reset-password.dto';
import type { ChangePasswordDto } from './body/change-password.dto';
import type { UpdateProfileDto } from './body/update-profile.dto';
import type { RefreshDto } from './body/refresh.dto';

const RESET_TTL_MS = 2 * 60 * 60 * 1000;

interface SessionSource {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  foundationId: string;
  foundationName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly invitations: InvitationRepository,
    private readonly passwordResets: PasswordResetRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly totp: TotpService,
    private readonly ticket: TwoFactorTicketService,
    private readonly email: EmailService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
  ) {}

  async login(dto: LoginDto): Promise<TwoFactorChallengeResponse> {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.passwordHash || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Невірний email або пароль');
    }
    const valid = await this.passwords.verify(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Невірний email або пароль');
    }
    return this.buildChallenge(user);
  }

  async getInvitation(token: string): Promise<InvitationInfoResponse> {
    const invitation = await this.invitations.findByToken(token);
    if (!invitation) {
      return { state: 'NOT_FOUND' };
    }
    if (invitation.status === InvitationStatus.ACCEPTED) {
      return { state: 'USED' };
    }
    if (
      invitation.status !== InvitationStatus.PENDING ||
      invitation.expiresAt < new Date()
    ) {
      return { state: 'EXPIRED' };
    }
    return {
      state: 'VALID',
      email: invitation.email,
      role: invitation.role,
      foundationName: invitation.foundation.name,
    };
  }

  async acceptInvitation(
    token: string,
    dto: AcceptInvitationDto,
  ): Promise<TwoFactorChallengeResponse> {
    const invitation = await this.invitations.findByToken(token);
    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Запрошення недійсне або вже використане');
    }
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Термін дії запрошення вичерпано');
    }
    const user = await this.users.findByEmail(invitation.email);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    const passwordHash = await this.passwords.hash(dto.password);
    await this.users.activate(user.id, passwordHash);
    await this.invitations.markAccepted(invitation.id);
    return this.buildChallenge(user);
  }

  async setupTwoFactor(dto: TwoFactorDto): Promise<AuthSessionResponse> {
    const payload = await this.ticket.verify(dto.ticket, 'SETUP', 'USER');
    if (
      !payload.secret ||
      !(await this.totp.verifyCode(payload.secret, dto.code))
    ) {
      throw new BadRequestException('Невірний код');
    }
    await this.users.setTotp(payload.sub, payload.secret, new Date());
    return this.issueSession(payload.sub);
  }

  async verifyTwoFactor(dto: TwoFactorDto): Promise<AuthSessionResponse> {
    const payload = await this.ticket.verify(dto.ticket, 'VERIFY', 'USER');
    const user = await this.users.findById(payload.sub);
    if (
      !user?.totpSecret ||
      !(await this.totp.verifyCode(user.totpSecret, dto.code))
    ) {
      throw new BadRequestException('Невірний код');
    }
    return this.issueSession(payload.sub);
  }

  private async buildChallenge(user: {
    id: string;
    email: string;
    totpEnabledAt: Date | null;
  }): Promise<TwoFactorChallengeResponse> {
    const principal = { sub: user.id, type: 'USER' as const };
    if (user.totpEnabledAt) {
      return {
        stage: 'VERIFY',
        ticket: await this.ticket.signVerify(principal),
      };
    }
    const secret = this.totp.createSecret();
    const otpauthUri = this.totp.keyUri(user.email, secret);
    return {
      stage: 'SETUP',
      ticket: await this.ticket.signSetup(principal, secret),
      secret,
      otpauthUri,
      qrDataUrl: await this.totp.qr(otpauthUri),
    };
  }

  private async issueSession(userId: string): Promise<AuthSessionResponse> {
    const user = await this.users.findById(userId);
    if (!user || user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException();
    }
    await this.users.touchLastSeen(user.id);
    const tokens = await this.tokens.issueForUser(user);
    return this.toSession(
      { ...user, foundationName: user.foundation.name },
      tokens,
    );
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponse> {
    const user = await this.users.findByEmail(dto.email);
    if (user && user.status === UserStatus.ACTIVE && user.passwordHash) {
      const raw = generateToken();
      await this.passwordResets.create({
        userId: user.id,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      });
      await this.email.sendPasswordReset(user.email, {
        recipientName: user.fullName,
        foundationName: user.foundation.name,
        resetUrl: `${this.app.webAppUrl}/reset-password?token=${raw}`,
      });
    }
    return { message: 'Якщо такий обліковий запис існує, лист надіслано' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<MessageResponse> {
    const record = await this.passwordResets.findByHash(hashToken(dto.token));
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Посилання недійсне або застаріле');
    }
    const passwordHash = await this.passwords.hash(dto.password);
    await this.users.setPassword(record.userId, passwordHash);
    await this.passwordResets.markUsed(record.id);
    return { message: 'Пароль оновлено' };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<MessageResponse> {
    const user = await this.users.findById(userId);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException();
    }
    const valid = await this.passwords.verify(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!valid) {
      throw new BadRequestException('Поточний пароль невірний');
    }
    await this.users.setPassword(
      user.id,
      await this.passwords.hash(dto.newPassword),
    );
    return { message: 'Пароль змінено' };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SessionUserResponse> {
    await this.users.setFullName(userId, dto.fullName.trim());
    return this.getSession(userId);
  }

  async getSession(userId: string): Promise<SessionUserResponse> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toSessionUser({
      ...user,
      foundationName: user.foundation.name,
    });
  }

  async refresh(dto: RefreshDto): Promise<AuthTokensResponse> {
    const owner = await this.tokens.consume(dto.refreshToken);
    if (!owner.userId) {
      throw new UnauthorizedException('Недійсний токен оновлення');
    }
    const user = await this.users.findById(owner.userId);
    if (!user || user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException();
    }
    return this.tokens.issueForUser(user);
  }

  async logout(dto: RefreshDto): Promise<MessageResponse> {
    await this.tokens.revoke(dto.refreshToken);
    return { message: 'Вихід виконано' };
  }

  private toSession(
    source: SessionSource,
    tokens: IssuedTokens,
  ): AuthSessionResponse {
    return { ...tokens, user: this.toSessionUser(source) };
  }

  private toSessionUser(source: SessionSource): SessionUserResponse {
    return {
      id: source.id,
      fullName: source.fullName,
      email: source.email,
      role: source.role,
      foundationId: source.foundationId,
      foundationName: source.foundationName,
    };
  }
}
