import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { IssuancesController } from './issuances.controller';
import { IssuancesService } from './issuances.service';

@Module({
  controllers: [StockController, IssuancesController],
  providers: [StockService, IssuancesService],
})
export class StockModule {}
