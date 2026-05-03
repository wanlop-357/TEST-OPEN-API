import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupOpenApi } from './openapi/setup-openapi';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfigService } from './config/app-config.service';
import { AppLoggerService } from './common/services/app-logger.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { TrimPipe } from './common/pipes/trim.pipe';

/**
 * ฟังก์ชันเริ่มต้นแอป NestJS และตั้งค่า middleware หลักของระบบ
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const appConfigService = app.get(AppConfigService);
  const logger = app.get(AppLoggerService);

  app.useLogger(logger);
  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix(appConfigService.app.apiPrefix);
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(
    app.get(TimeoutInterceptor),
    new TransformInterceptor(),
    new LoggingInterceptor(logger),
  );

  setupOpenApi(app, appConfigService);

  await app.listen(appConfigService.app.port, appConfigService.app.host);
}

void bootstrap();
