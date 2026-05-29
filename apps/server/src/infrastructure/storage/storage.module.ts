import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { uploadConfig } from '../../config/configuration';
import { LocalStorageService } from './storage.service';

@Module({
  imports: [ConfigModule.forFeature(uploadConfig)],
  providers: [LocalStorageService],
  exports: [LocalStorageService],
})
export class StorageModule {}
