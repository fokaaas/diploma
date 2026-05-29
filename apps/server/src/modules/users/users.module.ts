import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '../../config/configuration';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
