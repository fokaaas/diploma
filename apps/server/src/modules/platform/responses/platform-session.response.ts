import { ApiProperty } from '@nestjs/swagger';
import { PlatformAdminResponse } from './platform-admin.response';

export class PlatformSessionResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ type: PlatformAdminResponse })
  admin!: PlatformAdminResponse;
}
