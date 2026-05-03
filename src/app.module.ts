import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { initSentry } from './config/sentry.config';
import { configuration } from './config/configuration';
import { envValidationSchema } from './config/env.schema';
import { CommonModule } from './common/common.module';
import { ClientTypeMiddleware } from './common/middlewares/client-type.middleware';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';

initSentry();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    CommonModule,
    HealthModule,
    UsersModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * ฟังก์ชันผูก middleware client type และ request id ให้ทำงานกับทุก request
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ClientTypeMiddleware, RequestIdMiddleware).forRoutes('*');
  }
}
