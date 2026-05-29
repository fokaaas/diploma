import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [FilesModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
