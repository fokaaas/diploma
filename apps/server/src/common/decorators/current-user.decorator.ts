import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedPrincipal } from '../data/authenticated-principal';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedPrincipal =>
    ctx.switchToHttp().getRequest<{ user: AuthenticatedPrincipal }>().user,
);
