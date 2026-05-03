import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AppConfigService } from '../../config/app-config.service';
import { RequestWithId } from '../interfaces/request-with-id.interface';
import { RequestContextService } from '../services/request-context.service';

/**
 * Middleware สำหรับสร้างและแนบ requestId ให้ทุก request
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly requestContextService: RequestContextService,
  ) {}

  /**
   * ฟังก์ชันกำหนด requestId ลง request, response header และ async context
   */
  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const headerName = this.appConfigService.app.requestIdHeader;
    const requestId = request.header(headerName) ?? randomUUID();

    Object.assign(request, { requestId });
    response.setHeader(headerName, requestId);
    this.requestContextService.run(
      {
        requestId,
        clientType: request.clientType,
      },
      next,
    );
  }
}
