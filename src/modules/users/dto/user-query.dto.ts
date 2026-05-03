import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * DTO สำหรับ query users รองรับ pagination, filter, sort และ search
 */
export class UserQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'ค้นหาจาก email หรือชื่อ',
    example: 'somchai',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Search must not exceed 120 characters' })
  search?: string;

  @ApiPropertyOptional({
    description: 'กรองด้วย email แบบตรงตัว',
    example: 'user@example.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({
    description: 'กรอง users ที่มี role นี้',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'Role must not exceed 60 characters' })
  role?: string;

  @ApiPropertyOptional({
    description: 'field ที่ใช้ sort',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'email', 'fullName'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'email', 'fullName'])
  override sort?: 'createdAt' | 'updatedAt' | 'email' | 'fullName';

  @ApiPropertyOptional({
    description: 'รวมรายการที่ถูก soft delete แล้วหรือไม่',
    example: false,
  })
  @IsOptional()
  @Transform(
    ({ value }: { value: string | boolean | undefined }) => value === true || value === 'true',
  )
  @IsBoolean()
  includeDeleted?: boolean;
}
