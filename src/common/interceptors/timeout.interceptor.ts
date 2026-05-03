import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { AppConfigService } from '../../config/app-config.service';

/**
 * Interceptor สำหรับตัด request ที่ใช้เวลานานเกินค่าที่กำหนด
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly appConfigService: AppConfigService) {}

  /**
   * ฟังก์ชันครอบ request stream ด้วย timeout policy
   */
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.appConfigService.app.requestTimeoutMs),
      catchError((error: unknown) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('Request timeout'));
        }

        return throwError(() => error);
      }),
    );
  }
}
