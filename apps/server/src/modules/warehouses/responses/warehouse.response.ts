import { ApiProperty } from '@nestjs/swagger';

export class WarehouseResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}
