import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { AuthenticatedPrincipal } from '../data/authenticated-principal';

@Injectable()
export class PlatformGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedPrincipal }>();
    return !!user && user.type === 'PLATFORM';
  }
}
