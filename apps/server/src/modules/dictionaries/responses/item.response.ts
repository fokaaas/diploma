import { ApiProperty } from '@nestjs/swagger';

export class ItemResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  unit!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  categoryName!: string;

  @ApiProperty()
  minStock!: number;

  @ApiProperty({ required: false, nullable: true })
  lastPrice!: number | null;
}
