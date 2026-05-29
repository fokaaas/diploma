import { ApiProperty } from '@nestjs/swagger';

export class NavCountsResponse {
  @ApiProperty()
  requests!: number;

  @ApiProperty()
  procurements!: number;
}
