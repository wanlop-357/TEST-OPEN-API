import 'reflect-metadata';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dump, load } from 'js-yaml';
import SwaggerParser from '@apidevtools/swagger-parser';
import chokidar from 'chokidar';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import { AppConfigService } from '../config/app-config.service';
import { createOpenApiDocument } from '../openapi/openapi.config';

type Command = 'generate' | 'json' | 'yaml' | 'validate' | 'diff' | 'watch';

interface OpenApiStats {
  readonly endpoints: number;
  readonly models: number;
}

interface GeneratedOpenApi {
  readonly app: INestApplication;
  readonly document: OpenAPIObject;
  readonly jsonPath: string;
  readonly yamlPath: string;
}

/**
 * ฟังก์ชันอ่าน command จาก CLI arguments
 */
function getCommand(value: string | undefined): Command {
  if (
    value === 'generate' ||
    value === 'json' ||
    value === 'yaml' ||
    value === 'validate' ||
    value === 'diff' ||
    value === 'watch'
  ) {
    return value;
  }

  return 'generate';
}

/**
 * ฟังก์ชันสร้าง Nest app แบบไม่เปิด network listener เพื่อ generate OpenAPI
 */
async function createGeneratedOpenApi(): Promise<GeneratedOpenApi> {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  const appConfig = app.get(AppConfigService).app;
  const document = createOpenApiDocument(app, app.get(AppConfigService));

  return {
    app,
    document,
    jsonPath: appConfig.openApiJsonPath,
    yamlPath: appConfig.openApiYamlPath,
  };
}

/**
 * ฟังก์ชันนับจำนวน endpoints และ models จาก OpenAPI document
 */
function getStats(document: OpenAPIObject): OpenApiStats {
  const endpoints = Object.values(document.paths).reduce((total, pathItem) => {
    const operations = Object.keys(pathItem).filter((key) =>
      ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(key),
    );

    return total + operations.length;
  }, 0);
  const models = Object.keys(document.components?.schemas ?? {}).length;

  return {
    endpoints,
    models,
  };
}

/**
 * ฟังก์ชัน validate OpenAPI syntax และ project rules ก่อน save
 */
async function validateDocument(document: OpenAPIObject): Promise<void> {
  await validateWithSwaggerParser(document);
  validateProjectRules(document);
}

/**
 * ฟังก์ชัน normalize OpenAPI object ก่อนส่งให้ swagger-parser เพื่อลดปัญหา type mismatch ระหว่าง library
 */
async function validateWithSwaggerParser(document: unknown): Promise<void> {
  const normalizedDocument = JSON.parse(JSON.stringify(document)) as Parameters<
    typeof SwaggerParser.validate
  >[0];

  await SwaggerParser.validate(normalizedDocument);
}

/**
 * ฟังก์ชัน validate rules เฉพาะ project เช่น ApiOperation, ApiResponse และ Bearer auth
 */
function validateProjectRules(document: OpenAPIObject): void {
  const errors: string[] = [];
  const publicOperationIds = new Set(['HealthController_getHealth']);

  Object.entries(document.paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) {
        return;
      }

      const operationObject = operation as {
        readonly operationId?: string;
        readonly summary?: string;
        readonly responses?: Record<string, unknown>;
        readonly security?: Array<Record<string, string[]>>;
      };
      const operationName = `${method.toUpperCase()} ${path}`;
      const responseStatuses = Object.keys(operationObject.responses ?? {});
      const successResponse = responseStatuses.some((status) => /^[23][0-9][0-9]$/.test(status));
      const errorResponse = responseStatuses.some((status) => /^[45][0-9][0-9]$/.test(status));
      const isPublic = operationObject.operationId
        ? publicOperationIds.has(operationObject.operationId)
        : false;
      const hasBearerAuth = (operationObject.security ?? []).some((security) =>
        Object.prototype.hasOwnProperty.call(security, 'JWT-auth'),
      );

      if (operationObject.summary === undefined || operationObject.summary.trim() === '') {
        errors.push(`${operationName} must have @ApiOperation summary.`);
      }

      if (!successResponse) {
        errors.push(`${operationName} must have success @ApiResponse.`);
      }

      if (!errorResponse) {
        errors.push(`${operationName} must have error @ApiResponse.`);
      }

      if (!isPublic && !hasBearerAuth) {
        errors.push(`${operationName} must have @ApiBearerAuth('JWT-auth').`);
      }
    });
  });

  Object.entries(document.components?.schemas ?? {}).forEach(([schemaName, schema]) => {
    const schemaObject = schema as { readonly properties?: Record<string, unknown> };

    if (
      schemaObject.properties === undefined ||
      Object.keys(schemaObject.properties).length === 0
    ) {
      errors.push(`${schemaName} must have @ApiProperty on DTO fields.`);
    }
  });

  if (errors.length > 0) {
    throw new Error(
      `OpenAPI validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
  }
}

/**
 * ฟังก์ชันเขียน OpenAPI JSON และ YAML ลงไฟล์
 */
async function saveDocument(
  document: OpenAPIObject,
  jsonPath: string,
  yamlPath: string,
): Promise<void> {
  await validateDocument(document);
  writeFileSync(jsonPath, `${JSON.stringify(document, null, 2)}\n`);
  writeFileSync(yamlPath, dump(document, { noRefs: true, lineWidth: 120 }));
}

/**
 * ฟังก์ชัน hash object หลัง stringify แบบ stable สำหรับ diff แบบเร็ว
 */
function hashDocument(document: unknown): string {
  return createHash('sha256').update(JSON.stringify(document)).digest('hex');
}

/**
 * ฟังก์ชันอ่าน OpenAPI JSON/YAML เดิมจาก disk เพื่อเทียบกับ generated version
 */
function readExistingDocument(jsonPath: string, yamlPath: string): unknown {
  if (existsSync(jsonPath)) {
    return JSON.parse(readFileSync(jsonPath, 'utf8')) as unknown;
  }

  if (existsSync(yamlPath)) {
    return load(readFileSync(yamlPath, 'utf8'));
  }

  return undefined;
}

/**
 * ฟังก์ชันแสดง stats ของ OpenAPI document
 */
function printStats(document: OpenAPIObject): void {
  const stats = getStats(document);

  process.stdout.write(`OpenAPI stats: ${stats.endpoints} endpoints, ${stats.models} models\n`);
}

/**
 * ฟังก์ชัน generate OpenAPI แล้ว save ทั้ง JSON และ YAML
 */
async function generate(): Promise<void> {
  const generated = await createGeneratedOpenApi();

  try {
    await saveDocument(generated.document, generated.jsonPath, generated.yamlPath);
    printStats(generated.document);
    process.stdout.write(`Saved ${generated.yamlPath} and ${generated.jsonPath}\n`);
  } finally {
    await generated.app.close();
  }
}

/**
 * ฟังก์ชัน validate OpenAPI ที่มีอยู่บน disk
 */
async function validateExisting(): Promise<void> {
  const generated = await createGeneratedOpenApi();

  try {
    const existingDocument = readExistingDocument(generated.jsonPath, generated.yamlPath);

    if (existingDocument === undefined) {
      throw new Error('OpenAPI file not found. Run npm run openapi:generate first.');
    }

    await validateWithSwaggerParser(existingDocument);
    validateProjectRules(generated.document);
    printStats(generated.document);
    process.stdout.write('OpenAPI validation passed\n');
  } finally {
    await generated.app.close();
  }
}

/**
 * ฟังก์ชันเทียบ OpenAPI บน disk กับ version ที่ generate จาก code ปัจจุบัน
 */
async function diff(): Promise<void> {
  const generated = await createGeneratedOpenApi();

  try {
    await validateDocument(generated.document);
    const existingDocument = readExistingDocument(generated.jsonPath, generated.yamlPath);

    if (existingDocument === undefined) {
      throw new Error('OpenAPI file not found. Run npm run openapi:generate first.');
    }

    if (hashDocument(existingDocument) !== hashDocument(generated.document)) {
      throw new Error('OpenAPI diff detected. Run npm run openapi:generate and commit the result.');
    }

    printStats(generated.document);
    process.stdout.write('No OpenAPI diff detected\n');
  } finally {
    await generated.app.close();
  }
}

/**
 * ฟังก์ชัน watch source files และ regenerate OpenAPI เมื่อ controller หรือ DTO เปลี่ยน
 */
function watch(): void {
  const watcher = chokidar.watch(['src/**/*.controller.ts', 'src/**/*.dto.ts'], {
    ignoreInitial: false,
  });

  watcher.on('all', (_eventName: string, path: string) => {
    process.stdout.write(`OpenAPI watch detected change: ${path}\n`);
    void generate().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown OpenAPI watch error';
      process.stderr.write(`${message}\n`);
    });
  });
}

/**
 * ฟังก์ชัน entrypoint ของ OpenAPI generator CLI
 */
async function main(): Promise<void> {
  const command = getCommand(process.argv[2]);

  if (command === 'watch') {
    watch();
    return;
  }

  if (command === 'validate') {
    await validateExisting();
    return;
  }

  if (command === 'diff') {
    await diff();
    return;
  }

  await generate();
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown OpenAPI generator error';

  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
