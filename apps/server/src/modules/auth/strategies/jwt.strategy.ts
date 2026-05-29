import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../../config/configuration';
import type { AuthenticatedPrincipal } from '../../../common/data/authenticated-principal';
import type { JwtPayload } from '../data/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  validate(payload: JwtPayload): AuthenticatedPrincipal {
    if (payload.type === 'PLATFORM') {
      return { type: 'PLATFORM', sub: payload.sub };
    }
    return {
      type: 'USER',
      sub: payload.sub,
      foundationId: payload.foundationId as string,
      role: payload.role as NonNullable<JwtPayload['role']>,
    };
  }
}
