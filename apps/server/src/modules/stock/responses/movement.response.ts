import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '../../../generated/prisma/enums';

export class MovementResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty({ enum: MovementType })
  type!: MovementType;

  @ApiProperty()
  itemName!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  occurredAt!: string;

  @ApiProperty()
  warehouseName!: string;

  @ApiProperty()
  performedByName!: string;

  @ApiProperty({ required: false, nullable: true })
  sourceNumber!: string | null;
}
