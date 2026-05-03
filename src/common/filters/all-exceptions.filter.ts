import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Response } from 'express';
import { ErrorDetailDto, ErrorResponseDto } from '../dto/error-response.dto';
import { RequestWithId } from '../interfaces/request-with-id.interface';
import { AppLoggerService } from '../services/app-logger.service';

interface HttpExceptionPayload {
  readonly error?: string;
  readonly message?: string | string[];
  readonly details?: ErrorDetailDto[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly fallbackLogger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly logger?: AppLoggerService) {}

  /**
   * ฟังก์ชันแปลง exception ทุกแบบให้อยู่ใน error response format มาตรฐาน
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithId>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = this.getPayload(exception);
    const message = this.getMessage(payload, exception, statusCode);
    const errorResponse: ErrorResponseDto = {
      success: false,
      requestId: request.requestId ?? 'unknown',
      statusCode,
      error: payload.error ?? HttpStatus[statusCode] ?? 'Internal Server Error',
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
      details: payload.details,
    };

    this.writeErrorLog(
      `${request.method} ${request.originalUrl} ${statusCode} ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (statusCode >= 500) {
      Sentry.captureException(exception);
    }

    response.status(statusCode).json(errorResponse);
  }

  /**
   * ฟังก์ชันดึง payload จาก HttpException อย่างปลอดภัย
   */
  private getPayload(exception: unknown): HttpExceptionPayload {
    if (!(exception instanceof HttpException)) {
      return {
        error: 'Internal Server Error',
        message: 'Internal server error',
      };
    }

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
   * ฟังก์ชันเลือกข้อความ error ที่เหมาะสมสำหรับส่งกลับ client
   */
  private getMessage(
    payload: HttpExceptionPayload,
    exception: unknown,
    statusCode: number,
  ): string {
    if (Array.isArray(payload.message)) {
      return payload.message.join(', ');
    }

    if (typeof payload.message === 'string') {
      return payload.message;
    }

    if (exception instanceof Error && statusCode < 500) {
      return exception.message;
    }

    return statusCode >= 500 ? 'Internal server error' : 'Request failed';
  }

  /**
   * ฟังก์ชันเขียน error log ผ่าน custom logger ถ้ามี DI พร้อมใช้งาน
   */
  private writeErrorLog(message: string, stack: string | undefined): void {
    if (this.logger !== undefined) {
      this.logger.error(message, stack, AllExceptionsFilter.name);
      return;
    }

    this.fallbackLogger.error(message, stack);
  }
}
