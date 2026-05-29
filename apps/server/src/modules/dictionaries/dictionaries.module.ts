import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  controllers: [CategoriesController, ItemsController],
  providers: [CategoriesService, ItemsService],
})
export class DictionariesModule {}
