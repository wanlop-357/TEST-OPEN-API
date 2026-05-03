import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { BaseResponseDto } from '../dto/base-response.dto';
import { RequestWithId } from '../interfaces/request-with-id.interface';

/**
 * Interceptor สำหรับ wrap success response ให้อยู่ใน format มาตรฐาน
 */
@Injectable()
export class TransformInterceptor<TData> implements NestInterceptor<
  TData,
  BaseResponseDto<TData> | TData
> {
  /**
   * ฟังก์ชันแปลง response เป็น BaseResponseDto ถ้ายังไม่ได้ wrap มาก่อน
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<TData>,
  ): Observable<BaseResponseDto<TData> | TData> {
    const request = context.switchToHttp().getRequest<RequestWithId>();

    return next.handle().pipe(
      map((data: TData) => {
        if (this.isAlreadyWrapped(data)) {
          return data;
        }

        return {
          success: true,
          requestId: request.requestId ?? 'unknown',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  /**
   * ฟังก์ชันตรวจว่า response ถูก wrap มาแล้วหรือยัง
   */
  private isAlreadyWrapped(data: TData): data is TData {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    return 'success' in data && 'timestamp' in data;
  }
}
