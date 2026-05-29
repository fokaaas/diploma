import { ApiProperty } from '@nestjs/swagger';
import { SessionUserResponse } from './session-user.response';

export class AuthSessionResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ type: SessionUserResponse })
  user!: SessionUserResponse;
}
