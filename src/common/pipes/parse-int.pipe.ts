import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/**
 * Pipe สำหรับแปลงค่า string/number เป็น integer พร้อม error message มาตรฐาน
 */
@Injectable()
export class CustomParseIntPipe implements PipeTransform<string | number, number> {
  /**
   * ฟังก์ชันแปลง input เป็น integer และ throw error เมื่อค่าไม่ถูกต้อง
   */
  transform(value: string | number): number {
    const parsedValue = typeof value === 'number' ? value : Number(value);

    if (!Number.isInteger(parsedValue)) {
      throw new BadRequestException('Validation failed. Numeric integer is expected.');
    }

    return parsedValue;
  }
}
