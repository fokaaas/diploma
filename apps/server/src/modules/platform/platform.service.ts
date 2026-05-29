import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordService } from '../auth/password.service';
import { TokenService } from '../auth/token.service';
import type { AuthTokensResponse } from '../auth/responses/auth-tokens.response';
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
  ) {}

  async login(dto: PlatformLoginDto): Promise<PlatformSessionResponse> {
    const admin = await this.admins.findByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException('Невірний email або пароль');
    }
    const valid = await this.passwords.verify(dto.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Невірний email або пароль');
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
