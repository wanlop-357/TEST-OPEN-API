import Joi from 'joi';

/**
 * Schema สำหรับตรวจสอบ environment variables ก่อนเริ่มต้นแอป
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  APP_NAME: Joi.string().trim().min(1).default('TEST Open API'),
  APP_HOST: Joi.string().trim().min(1).default('0.0.0.0'),
  APP_PORT: Joi.number().port().default(3000),
  APP_VERSION: Joi.string().trim().min(1).default('0.1.0'),
  API_PREFIX: Joi.string().trim().min(1).default('api/v1'),
  SWAGGER_PATH: Joi.string().trim().min(1).default('docs'),
  OPENAPI_JSON_PATH: Joi.string().trim().min(1).default('openapi.json'),
  OPENAPI_YAML_PATH: Joi.string().trim().min(1).default('openapi.yaml'),
  REQUEST_ID_HEADER: Joi.string().trim().min(1).default('x-request-id'),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'log', 'debug', 'verbose')
    .default('debug'),
  SENTRY_DSN: Joi.string().allow('').default(''),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(1),
  REQUEST_TIMEOUT_MS: Joi.number().integer().min(1).default(10000),
});
