import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { ProcurementsController } from './procurements.controller';
import { ProcurementsService } from './procurements.service';
import { GoodsReceiptService } from './goods-receipt.service';

@Module({
  imports: [FilesModule],
  controllers: [ProcurementsController],
  providers: [ProcurementsService, GoodsReceiptService],
})
export class ProcurementsModule {}
