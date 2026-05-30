import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  webAppUrl: process.env.WEB_APP_URL ?? 'http://localhost:5173',
  name: process.env.TOTP_ISSUER ?? 'Фонд-платформа',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30),
}));

export const uploadConfig = registerAs('upload', () => ({
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  maxFileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE ?? 26214400),
}));

export const mailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT ?? 587),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  fromAddress: process.env.MAIL_FROM_ADDRESS ?? 'no-reply@localhost',
}));
