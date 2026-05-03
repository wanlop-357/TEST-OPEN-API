import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO สำหรับรายละเอียด error ราย field
 */
export class ErrorDetailDto {
  @ApiProperty({
    example: 'email',
    description: 'ชื่อ field หรือ path ที่เกิด error',
  })
  field!: string;

  @ApiProperty({
    example: 'email must be an email',
    description: 'รายละเอียด error ของ field นั้น',
  })
  message!: string;
}

/**
 * DTO มาตรฐานสำหรับ error response ของทุก endpoint
 */
export class ErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'สถานะสำเร็จของ response',
  })
  success!: false;

  @ApiProperty({
    example: 'req_01hzz6qk4vx8b9n2',
    description: 'Request ID สำหรับ trace log และ Sentry',
  })
  requestId!: string;

  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'ประเภทของ error',
  })
  error!: string;

  @ApiProperty({
    example: 'Validation failed',
    description: 'ข้อความ error สำหรับ client',
  })
  message!: string;

  @ApiProperty({
    example: '/api/v1/users',
    description: 'Path ที่เกิด error',
  })
  path!: string;

  @ApiProperty({
    example: '2026-05-02T10:30:00.000Z',
    description: 'เวลาที่เกิด error ในรูปแบบ ISO string',
  })
  timestamp!: string;

  @ApiProperty({
    type: [ErrorDetailDto],
    required: false,
    description: 'รายละเอียด error ราย field',
  })
  details?: ErrorDetailDto[];
}
