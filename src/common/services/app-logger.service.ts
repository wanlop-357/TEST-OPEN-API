import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { RequestContextService } from './request-context.service';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

interface StructuredLog {
  readonly level: LogLevel;
  readonly message: string;
  readonly context?: string;
  readonly requestId?: string;
  readonly timestamp: string;
  readonly stack?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Logger กลางของระบบที่เขียน log แบบ JSON และแนบ requestId อัตโนมัติ
 */
@Injectable()
export class AppLoggerService extends ConsoleLogger implements LoggerService {
  constructor(private readonly requestContextService: RequestContextService) {
    super();
  }

  /**
   * ฟังก์ชันบันทึก log ระดับ info
   */
  override log(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.write('log', message, context, undefined, metadata);
  }

  /**
   * ฟังก์ชันบันทึก log ระดับ error และส่ง exception เข้า Sentry เมื่อมี stack
   */
  override error(
    message: string,
    stack?: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.write('error', message, context, stack, metadata);

    if (stack !== undefined) {
      Sentry.captureException(new Error(message));
    }
  }

  /**
   * ฟังก์ชันบันทึก log ระดับ warning
   */
  override warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.write('warn', message, context, undefined, metadata);
  }

  /**
   * ฟังก์ชันบันทึก log ระดับ debug
   */
  override debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.write('debug', message, context, undefined, metadata);
  }

  /**
   * ฟังก์ชันบันทึก log ระดับ verbose
   */
  override verbose(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.write('verbose', message, context, undefined, metadata);
  }

  /**
   * ฟังก์ชันบันทึก request log แบบมี metadata มาตรฐาน
   */
  logRequest(metadata: Record<string, unknown>): void {
    this.log('HTTP request completed', AppLoggerService.name, metadata);
  }

  /**
   * ฟังก์ชันเขียน log เป็น JSON ลง stdout/stderr
   */
  private write(
    level: LogLevel,
    message: string,
    context?: string,
    stack?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const payload: StructuredLog = {
      level,
      message,
      context,
      requestId: this.requestContextService.getRequestId(),
      timestamp: new Date().toISOString(),
      stack,
      metadata,
    };
    const serialized = JSON.stringify(payload);

    if (level === 'error') {
      process.stderr.write(`${serialized}\n`);
      return;
    }

    process.stdout.write(`${serialized}\n`);
  }
}
