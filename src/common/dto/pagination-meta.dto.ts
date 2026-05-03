import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO สำหรับ metadata ของ pagination response
 */
export class PaginationMetaDto {
  @ApiProperty({
    example: 1,
    description: 'หน้าปัจจุบัน',
  })
  page!: number;

  @ApiProperty({
    example: 20,
    description: 'จำนวนรายการต่อหน้า',
  })
  limit!: number;

  @ApiProperty({
    example: 120,
    description: 'จำนวนรายการทั้งหมด',
  })
  total!: number;

  @ApiProperty({
    example: 6,
    description: 'จำนวนหน้าทั้งหมด',
  })
  totalPages!: number;
}
