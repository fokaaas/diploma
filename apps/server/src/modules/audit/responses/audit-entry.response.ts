import { ApiProperty } from '@nestjs/swagger';

export class AuditEntryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  occurredAt!: string;

  @ApiProperty()
  actorName!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  targetType!: string;

  @ApiProperty()
  targetId!: string;

  @ApiProperty({ required: false, nullable: true })
  targetRef!: string | null;

  @ApiProperty()
  summary!: string;
}
