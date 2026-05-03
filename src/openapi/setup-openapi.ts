import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from '../config/app-config.service';
import { createOpenApiDocument, getSwaggerCustomCss } from './openapi.config';

/**
 * ฟังก์ชันตั้งค่า Swagger UI และ OpenAPI document สำหรับ publish เข้า apidoc.io
 */
export function setupOpenApi(app: INestApplication, appConfigService: AppConfigService): void {
  const appConfig = appConfigService.app;
  const document = createOpenApiDocument(app, appConfigService);

  SwaggerModule.setup(appConfig.swaggerPath, app, document, {
    jsonDocumentUrl: appConfig.openApiJsonPath,
    yamlDocumentUrl: appConfig.openApiYamlPath,
    customSiteTitle: `${appConfig.name} Docs`,
    customCss: getSwaggerCustomCss(),
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
