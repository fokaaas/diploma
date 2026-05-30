import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { appConfig } from '../../config/configuration';

// Accept a code from the adjacent 30s time step to tolerate clock skew.
const EPOCH_TOLERANCE_SECONDS = 30;

@Injectable()
export class TotpService {
  constructor(
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
  ) {}

  createSecret(): string {
    return generateSecret();
  }

  keyUri(accountEmail: string, secret: string): string {
    return generateURI({ issuer: this.app.name, label: accountEmail, secret });
  }

  async verifyCode(secret: string, code: string): Promise<boolean> {
    try {
      const result = await verify({
        token: code.trim(),
        secret,
        epochTolerance: EPOCH_TOLERANCE_SECONDS,
      });
      return result.valid;
    } catch {
      return false;
    }
  }

  qr(uri: string): Promise<string> {
    return QRCode.toDataURL(uri);
  }
}
