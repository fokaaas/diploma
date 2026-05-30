import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from '../auth/password.service';
import { TokenService } from '../auth/token.service';
import { TotpService } from '../auth/totp.service';
import { TwoFactorTicketService } from '../auth/two-factor-ticket.service';
import type { AuthTokensResponse } from '../auth/responses/auth-tokens.response';
import type { TwoFactorChallengeResponse } from '../auth/responses/two-factor-challenge.response';
import type { TwoFactorDto } from '../auth/body/two-factor.dto';
import type { RefreshDto } from '../auth/body/refresh.dto';
import type { MessageResponse } from '../../common/data/message.response';
import { PlatformAdminRepository } from '../../infrastructure/database/repos/platform-admin.repo';
import type { PlatformLoginDto } from './body/platform-login.dto';
import type { PlatformAdminResponse } from './responses/platform-admin.response';
import type { PlatformSessionResponse } from './responses/platform-session.response';

@Injectable()
export class PlatformService {
  constructor(
    private readonly admins: PlatformAdminRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly totp: TotpService,
    private readonly ticket: TwoFactorTicketService,
  ) {}

  async login(dto: PlatformLoginDto): Promise<TwoFactorChallengeResponse> {
    const admin = await this.admins.findByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException('Невірний email або пароль');
    }
    const valid = await this.passwords.verify(dto.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Невірний email або пароль');
    }
    return this.buildChallenge(admin);
  }

  async setupTwoFactor(dto: TwoFactorDto): Promise<PlatformSessionResponse> {
    const payload = await this.ticket.verify(dto.ticket, 'SETUP', 'PLATFORM');
    if (
      !payload.secret ||
      !(await this.totp.verifyCode(payload.secret, dto.code))
    ) {
      throw new BadRequestException('Невірний код');
    }
    await this.admins.setTotp(payload.sub, payload.secret, new Date());
    return this.issueSession(payload.sub);
  }

  async verifyTwoFactor(dto: TwoFactorDto): Promise<PlatformSessionResponse> {
    const payload = await this.ticket.verify(dto.ticket, 'VERIFY', 'PLATFORM');
    const admin = await this.admins.findById(payload.sub);
    if (
      !admin?.totpSecret ||
      !(await this.totp.verifyCode(admin.totpSecret, dto.code))
    ) {
      throw new BadRequestException('Невірний код');
    }
    return this.issueSession(payload.sub);
  }

  private async buildChallenge(admin: {
    id: string;
    email: string;
    totpEnabledAt: Date | null;
  }): Promise<TwoFactorChallengeResponse> {
    const principal = { sub: admin.id, type: 'PLATFORM' as const };
    if (admin.totpEnabledAt) {
      return {
        stage: 'VERIFY',
        ticket: await this.ticket.signVerify(principal),
      };
    }
    const secret = this.totp.createSecret();
    const otpauthUri = this.totp.keyUri(admin.email, secret);
    return {
      stage: 'SETUP',
      ticket: await this.ticket.signSetup(principal, secret),
      secret,
      otpauthUri,
      qrDataUrl: await this.totp.qr(otpauthUri),
    };
  }

  private async issueSession(
    adminId: string,
  ): Promise<PlatformSessionResponse> {
    const admin = await this.admins.findById(adminId);
    if (!admin) {
      throw new UnauthorizedException();
    }
    const tokens = await this.tokens.issueForPlatform(admin);
    return { ...tokens, admin: this.toAdmin(admin) };
  }

  async getProfile(adminId: string): Promise<PlatformAdminResponse> {
    const admin = await this.admins.findById(adminId);
    if (!admin) {
      throw new UnauthorizedException();
    }
    return this.toAdmin(admin);
  }

  async refresh(dto: RefreshDto): Promise<AuthTokensResponse> {
    const owner = await this.tokens.consume(dto.refreshToken);
    if (!owner.platformAdminId) {
      throw new UnauthorizedException('Недійсний токен оновлення');
    }
    const admin = await this.admins.findById(owner.platformAdminId);
    if (!admin) {
      throw new UnauthorizedException();
    }
    return this.tokens.issueForPlatform(admin);
  }

  async logout(dto: RefreshDto): Promise<MessageResponse> {
    await this.tokens.revoke(dto.refreshToken);
    return { message: 'Вихід виконано' };
  }

  private toAdmin(admin: {
    id: string;
    name: string;
    email: string;
  }): PlatformAdminResponse {
    return { id: admin.id, name: admin.name, email: admin.email };
  }
}
