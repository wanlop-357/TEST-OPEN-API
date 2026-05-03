import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO มาตรฐานสำหรับ success response ของทุก endpoint
 */
export class BaseResponseDto<TData> {
  @ApiProperty({
    example: true,
    description: 'สถานะสำเร็จของ response',
  })
  success!: true;

  @ApiProperty({
    example: '6ddf0ab4-555c-4035-a02f-7ed627b89b529',
    description: 'Request ID สำหรับ trace log',
  })
  requestId!: string;

  @ApiProperty({
    description: 'ข้อมูล response',
  })
  data!: TData;

  @ApiProperty({
    example: '2026-05-03T10:30:00.000Z',
    description: 'เวลาที่สร้าง response ในรูปแบบ ISO string',
  })
  timestamp!: string;
}
