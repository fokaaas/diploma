import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  webAppUrl: process.env.WEB_APP_URL ?? 'http://localhost:5173',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30),
}));

export const mailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT ?? 587),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  fromAddress: process.env.MAIL_FROM_ADDRESS ?? 'no-reply@localhost',
}));
