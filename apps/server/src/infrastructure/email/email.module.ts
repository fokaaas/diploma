import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { mailConfig } from '../../config/configuration';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
