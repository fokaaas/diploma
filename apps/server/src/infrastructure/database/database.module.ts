import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PlatformAdminRepository } from './repos/platform-admin.repo';
import { UserRepository } from './repos/user.repo';
import { InvitationRepository } from './repos/invitation.repo';
import { FoundationRepository } from './repos/foundation.repo';
import { RefreshTokenRepository } from './repos/refresh-token.repo';
import { PasswordResetRepository } from './repos/password-reset.repo';

const repositories = [
  PlatformAdminRepository,
  UserRepository,
  InvitationRepository,
  FoundationRepository,
  RefreshTokenRepository,
  PasswordResetRepository,
];

@Global()
@Module({
  providers: [PrismaService, ...repositories],
  exports: [PrismaService, ...repositories],
})
export class DatabaseModule {}
