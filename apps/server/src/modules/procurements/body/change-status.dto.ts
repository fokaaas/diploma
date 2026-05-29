import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProcurementStatus } from '../../../generated/prisma/enums';

export class ChangeStatusDto {
  @ApiProperty({ enum: ProcurementStatus })
  @IsEnum(ProcurementStatus)
  status!: ProcurementStatus;
}
