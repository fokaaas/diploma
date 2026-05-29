import { ApiProperty } from '@nestjs/swagger';

export class SearchHit {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  subtitle!: string;
}

export class SearchResultsResponse {
  @ApiProperty({ type: SearchHit, isArray: true })
  requests!: SearchHit[];

  @ApiProperty({ type: SearchHit, isArray: true })
  counterparties!: SearchHit[];

  @ApiProperty({ type: SearchHit, isArray: true })
  contributions!: SearchHit[];

  @ApiProperty({ type: SearchHit, isArray: true })
  procurements!: SearchHit[];
}
