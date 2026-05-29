import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type {
  AuthenticatedPrincipal,
  UserPrincipal,
} from '../data/authenticated-principal';

export const CurrentFoundationUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPrincipal => {
    const { user } = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedPrincipal }>();
    if (!user || user.type !== 'USER') {
      throw new ForbiddenException('Доступно лише користувачам фонду');
    }
    return user;
  },
);
