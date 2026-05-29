import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { appConfig, jwtConfig, mailConfig } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { DatabaseModule } from './infrastructure/database/database.module';
import { EmailModule } from './infrastructure/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlatformModule } from './modules/platform/platform.module';
import { FoundationsModule } from './modules/foundations/foundations.module';
import { UsersModule } from './modules/users/users.module';
import { DictionariesModule } from './modules/dictionaries/dictionaries.module';
import { CounterpartiesModule } from './modules/counterparties/counterparties.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, mailConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    EmailModule,
    AuthModule,
    PlatformModule,
    FoundationsModule,
    UsersModule,
    DictionariesModule,
    CounterpartiesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
