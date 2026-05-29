import { ApiProperty } from '@nestjs/swagger';

export class StockLevelResponse {
  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  categoryName!: string;

  @ApiProperty()
  unit!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty()
  warehouseName!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  minStock!: number;

  @ApiProperty({ required: false, nullable: true })
  lastPrice!: number | null;
}
