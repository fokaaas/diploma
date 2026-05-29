import { ApiProperty } from '@nestjs/swagger';
import type { PublicSnapshot } from '../data/public-snapshot';

export class PublicReportResponse {
  @ApiProperty()
  foundationName!: string;

  @ApiProperty()
  periodStart!: string;

  @ApiProperty()
  periodEnd!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  snapshot!: PublicSnapshot;
}
