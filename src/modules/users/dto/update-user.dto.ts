import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO สำหรับแก้ไข user โดยทุก field เป็น optional
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
