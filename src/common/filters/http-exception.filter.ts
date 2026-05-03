import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { RequestWithId } from '../interfaces/request-with-id.interface';
import { AppLoggerService } from '../services/app-logger.service';

interface HttpExceptionPayload {
  readonly error?: string;
  readonly message?: string | string[];
}

/**
 * Filter สำหรับจัดรูปแบบ HttpException ให้เป็น error response มาตรฐาน
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  constructor(private readonly logger: AppLoggerService) {}

  /**
   * ฟังก์ชันแปลง HttpException เป็น response format กลางของระบบ
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithId>();
    const statusCode = exception.getStatus();
    const payload = this.getPayload(exception);
    const errorResponse: ErrorResponseDto = {
      success: false,
      requestId: request.requestId ?? 'unknown',
      statusCode,
      error: payload.error ?? HttpStatus[statusCode] ?? 'Http Error',
      message: this.getMessage(payload),
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(
      `${request.method} ${request.originalUrl} ${statusCode}`,
      HttpExceptionFilter.name,
    );
    response.status(statusCode).json(errorResponse);
  }

  /**
   * ฟังก์ชันดึง payload จาก HttpException อย่างปลอดภัย
   */
  private getPayload(exception: HttpException): HttpExceptionPayload {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        error: exception.name,
        message: response,
      };
    }

    return response;
  }

  /**
   * ฟังก์ชันเลือก message สำหรับส่งกลับ client
   */
  private getMessage(payload: HttpExceptionPayload): string {
    if (Array.isArray(payload.message)) {
      return payload.message.join(', ');
    }

    return payload.message ?? 'Request failed';
  }
}
