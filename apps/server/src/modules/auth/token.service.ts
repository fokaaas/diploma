import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { jwtConfig } from '../../config/configuration';
import { generateToken, hashToken } from '../../common/crypto';
import type { Role } from '../../generated/prisma/enums';
import { RefreshTokenRepository } from '../../infrastructure/database/repos/refresh-token.repo';
import type { IssuedTokens, RefreshOwner } from './data/issued-tokens';
import type { JwtPayload } from './data/jwt-payload';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly refreshTokens: RefreshTokenRepository,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async issueForUser(user: {
    id: string;
    foundationId: string;
    role: Role;
  }): Promise<IssuedTokens> {
    const accessToken = await this.signAccess({
      sub: user.id,
      type: 'USER',
      foundationId: user.foundationId,
      role: user.role,
    });
    const refreshToken = await this.createRefresh({ userId: user.id });
    return { accessToken, refreshToken };
  }

  async issueForPlatform(admin: { id: string }): Promise<IssuedTokens> {
    const accessToken = await this.signAccess({
      sub: admin.id,
      type: 'PLATFORM',
    });
    const refreshToken = await this.createRefresh({
      platformAdminId: admin.id,
    });
    return { accessToken, refreshToken };
  }

  async consume(rawRefresh: string): Promise<RefreshOwner> {
    const record = await this.refreshTokens.findByHash(hashToken(rawRefresh));
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Недійсний токен оновлення');
    }
    await this.refreshTokens.revoke(record.id);
    return { userId: record.userId, platformAdminId: record.platformAdminId };
  }

  async revoke(rawRefresh: string): Promise<void> {
    const record = await this.refreshTokens.findByHash(hashToken(rawRefresh));
    if (record && !record.revokedAt) {
      await this.refreshTokens.revoke(record.id);
    }
  }

  private signAccess(payload: JwtPayload): Promise<string> {
    const options: JwtSignOptions = {
      expiresIn: this.config.accessTtl as JwtSignOptions['expiresIn'],
    };
    return this.jwt.signAsync(payload, options);
  }

  private async createRefresh(
    owner: { userId: string } | { platformAdminId: string },
  ): Promise<string> {
    const raw = generateToken();
    const expiresAt = new Date(
      Date.now() + this.config.refreshTtlDays * MS_PER_DAY,
    );
    await this.refreshTokens.create({
      tokenHash: hashToken(raw),
      expiresAt,
      ...owner,
    });
    return raw;
  }
}
