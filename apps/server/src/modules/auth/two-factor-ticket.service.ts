import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { jwtConfig } from '../../config/configuration';

export type TicketStage = 'SETUP' | 'VERIFY';
export type PrincipalType = 'USER' | 'PLATFORM';

export interface TicketPayload {
  sub: string;
  type: PrincipalType;
  stage: TicketStage;
  secret?: string;
}

const TICKET_TTL = '10m';

@Injectable()
export class TwoFactorTicketService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  signSetup(
    principal: { sub: string; type: PrincipalType },
    totpSecret: string,
  ): Promise<string> {
    return this.sign({
      sub: principal.sub,
      type: principal.type,
      stage: 'SETUP',
      secret: totpSecret,
    });
  }

  signVerify(principal: { sub: string; type: PrincipalType }): Promise<string> {
    return this.sign({
      sub: principal.sub,
      type: principal.type,
      stage: 'VERIFY',
    });
  }

  async verify(
    ticket: string,
    stage: TicketStage,
    type: PrincipalType,
  ): Promise<TicketPayload> {
    let payload: TicketPayload;
    try {
      payload = await this.jwt.verifyAsync<TicketPayload>(ticket, {
        secret: this.ticketSecret,
      });
    } catch {
      throw new UnauthorizedException(
        'Сесію підтвердження завершено. Увійдіть знову',
      );
    }
    if (payload.stage !== stage || payload.type !== type) {
      throw new UnauthorizedException('Недійсний запит підтвердження');
    }
    return payload;
  }

  private get ticketSecret(): string {
    return `${this.config.secret}:2fa-ticket`;
  }

  private sign(payload: TicketPayload): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.ticketSecret,
      expiresIn: TICKET_TTL,
    };
    return this.jwt.signAsync(payload, options);
  }
}
