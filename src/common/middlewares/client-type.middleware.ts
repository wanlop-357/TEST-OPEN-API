import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { RequestWithId } from '../interfaces/request-with-id.interface';

type ClientType = 'web' | 'app' | 'unknown';

/**
 * Middleware สำหรับระบุ client type จาก header x-client-type
 */
@Injectable()
export class ClientTypeMiddleware implements NestMiddleware {
  /**
   * ฟังก์ชันอ่าน client type จาก request header และเก็บไว้ใน request
   */
  use(request: RequestWithId, _response: Response, next: NextFunction): void {
    const headerValue = request.header('x-client-type');
    const clientType = this.normalizeClientType(headerValue);

    Object.assign(request, { clientType });
    next();
  }

  /**
   * ฟังก์ชัน normalize client type ให้เป็นค่าที่ระบบรองรับ
   */
  private normalizeClientType(value: string | undefined): ClientType {
    if (value === 'web' || value === 'app') {
      return value;
    }

    return 'unknown';
  }
}
