import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO สำหรับสร้าง users หลายรายการใน request เดียว
 */
export class BulkCreateUsersDto {
  @ApiProperty({
    description: 'รายการ users ที่ต้องการสร้าง',
    type: [CreateUserDto],
    minItems: 1,
    maxItems: 50,
  })
  @ArrayMinSize(1, { message: 'Users must contain at least 1 item' })
  @ArrayMaxSize(50, { message: 'Users must not exceed 50 items' })
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users!: CreateUserDto[];
}
