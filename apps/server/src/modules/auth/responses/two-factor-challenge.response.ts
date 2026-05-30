import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorChallengeResponse {
  @ApiProperty({ enum: ['SETUP', 'VERIFY'] })
  stage!: 'SETUP' | 'VERIFY';

  @ApiProperty()
  ticket!: string;

  @ApiProperty({ required: false, nullable: true })
  secret?: string;

  @ApiProperty({ required: false, nullable: true })
  otpauthUri?: string;

  @ApiProperty({ required: false, nullable: true })
  qrDataUrl?: string;
}
