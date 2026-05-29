import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '../../config/configuration';
import { FoundationsController } from './foundations.controller';
import { FoundationProfileController } from './foundation-profile.controller';
import { FoundationsService } from './foundations.service';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  controllers: [FoundationsController, FoundationProfileController],
  providers: [FoundationsService],
})
export class FoundationsModule {}
