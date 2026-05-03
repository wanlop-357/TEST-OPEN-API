import { Global, Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { AppLoggerService } from './services/app-logger.service';
import { RequestContextService } from './services/request-context.service';

/**
 * Module กลางสำหรับ provider ที่ทุก module ใช้ร่วมกัน
 */
@Global()
@Module({
  providers: [AppConfigService, AppLoggerService, RequestContextService, TimeoutInterceptor],
  exports: [AppConfigService, AppLoggerService, RequestContextService, TimeoutInterceptor],
})
export class CommonModule {}
