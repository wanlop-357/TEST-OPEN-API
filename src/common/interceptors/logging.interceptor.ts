import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestWithId } from '../interfaces/request-with-id.interface';
import { AppLoggerService } from '../services/app-logger.service';

/**
 * Interceptor สำหรับ log ทุก request หลัง response สำเร็จ
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly fallbackLogger = new Logger(LoggingInterceptor.name);

  constructor(private readonly logger?: AppLoggerService) {}

  /**
   * ฟังก์ชัน log request/response พร้อม request id และเวลาที่ใช้
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const request = context.switchToHttp().getRequest<RequestWithId>();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        const metadata = {
          method: request.method,
          path: request.originalUrl,
          requestId: request.requestId ?? 'unknown',
          clientType: request.clientType ?? 'unknown',
          durationMs,
        };

        if (this.logger !== undefined) {
          this.logger.logRequest(metadata);
          return;
        }

        this.fallbackLogger.log(JSON.stringify(metadata));
      }),
    );
  }
}
