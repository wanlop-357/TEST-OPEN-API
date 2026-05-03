import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * ฟังก์ชัน decorator รวม error response มาตรฐานที่ endpoint ส่วนใหญ่ต้องใช้
 */
export function ApiStandardErrorResponses(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      description: 'ข้อมูล request ไม่ถูกต้อง',
    }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description: 'ไม่ได้รับอนุญาตหรือ token ไม่ถูกต้อง',
    }),
    ApiInternalServerErrorResponse({
      type: ErrorResponseDto,
      description: 'เกิดข้อผิดพลาดภายในระบบ',
    }),
  );
}
