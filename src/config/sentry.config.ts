import * as Sentry from '@sentry/nestjs';

/**
 * ฟังก์ชันเริ่มต้น Sentry เมื่อมีการตั้งค่า SENTRY_DSN
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (dsn === undefined || dsn.trim() === '') {
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 1),
    environment: process.env.NODE_ENV ?? 'development',
  });
}
