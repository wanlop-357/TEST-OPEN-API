import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration, Configuration, SentryConfiguration } from './configuration';

/**
 * Service สำหรับอ่านค่า config แบบ type-safe แทนการอ่าน process.env ตรง ๆ
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<Configuration, true>) {}

  /**
   * ฟังก์ชันคืนค่า app config ทั้งชุด
   */
  get app(): AppConfiguration {
    return this.configService.get<AppConfiguration>('app');
  }

  /**
   * ฟังก์ชันคืนค่า Sentry config ทั้งชุด
   */
  get sentry(): SentryConfiguration {
    return this.configService.get<SentryConfiguration>('sentry');
  }
}
