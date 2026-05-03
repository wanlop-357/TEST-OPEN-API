import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PaginationMetaDto } from '../dto/pagination-meta.dto';

/**
 * Decorator สำหรับสร้าง Swagger schema ของ response แบบ pagination
 */
export function ApiPaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, PaginationMetaDto, model),
    ApiOkResponse({
      description: 'Paginated response',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
}
