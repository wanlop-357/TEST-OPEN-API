import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { UserResponseDto } from './user-response.dto';

/**
 * DTO สำหรับ response รายการ users แบบแบ่งหน้า
 */
export class UserListResponseDto {
  @ApiProperty({
    description: 'รายการ users ในหน้าปัจจุบัน',
    type: [UserResponseDto],
  })
  items!: UserResponseDto[];

  @ApiProperty({
    description: 'ข้อมูล pagination',
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;
}
