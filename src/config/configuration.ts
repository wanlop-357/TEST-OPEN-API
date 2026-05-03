export type NodeEnv = 'development' | 'test' | 'staging' | 'production';
export type AppLogLevel = 'fatal' | 'error' | 'warn' | 'log' | 'debug' | 'verbose';

export interface AppConfiguration {
  readonly nodeEnv: NodeEnv;
  readonly name: string;
  readonly host: string;
  readonly port: number;
  readonly version: string;
  readonly apiPrefix: string;
  readonly swaggerPath: string;
  readonly openApiJsonPath: string;
  readonly openApiYamlPath: string;
  readonly requestIdHeader: string;
  readonly logLevel: AppLogLevel;
  readonly requestTimeoutMs: number;
}

export interface SentryConfiguration {
  readonly dsn: string;
  readonly tracesSampleRate: number;
  readonly environment: NodeEnv;
}

export interface Configuration {
  readonly app: AppConfiguration;
  readonly sentry: SentryConfiguration;
}

/**
 * ฟังก์ชันแปลงค่า env เป็น number หลัง Joi validate แล้ว
 */
function numberFromEnv(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value.trim() === '') {
    return defaultValue;
  }

  return Number(value);
}

/**
 * ฟังก์ชันสร้าง config object แบบ type-safe สำหรับใช้ผ่าน ConfigService
 */
export function configuration(): Configuration {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as NodeEnv;

  return {
    app: {
      nodeEnv,
      name: process.env.APP_NAME ?? 'TEST Open API',
      host: process.env.APP_HOST ?? '0.0.0.0',
      port: numberFromEnv(process.env.APP_PORT, 3000),
      version: process.env.APP_VERSION ?? '0.1.0',
      apiPrefix: process.env.API_PREFIX ?? 'api/v1',
      swaggerPath: process.env.SWAGGER_PATH ?? 'docs',
      openApiJsonPath: process.env.OPENAPI_JSON_PATH ?? 'openapi.json',
      openApiYamlPath: process.env.OPENAPI_YAML_PATH ?? 'openapi.yaml',
      requestIdHeader: process.env.REQUEST_ID_HEADER ?? 'x-request-id',
      logLevel: (process.env.LOG_LEVEL ?? 'debug') as AppLogLevel,
      requestTimeoutMs: numberFromEnv(process.env.REQUEST_TIMEOUT_MS, 10000),
    },
    sentry: {
      dsn: process.env.SENTRY_DSN ?? '',
      tracesSampleRate: numberFromEnv(process.env.SENTRY_TRACES_SAMPLE_RATE, 1),
      environment: nodeEnv,
    },
  };
}
