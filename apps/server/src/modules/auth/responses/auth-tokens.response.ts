import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;
}
