import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

/**
 * DTO มาตรฐานสำหรับ response แบบแบ่งหน้า
 */
export class PaginatedResponseDto<TData> {
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
    description: 'รายการข้อมูลของหน้าปัจจุบัน',
    isArray: true,
  })
  data!: TData[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'ข้อมูล pagination',
  })
  meta!: PaginationMetaDto;

  @ApiProperty({
    example: '2026-05-03T10:30:00.000Z',
    description: 'เวลาที่สร้าง response ในรูปแบบ ISO string',
  })
  timestamp!: string;
}
