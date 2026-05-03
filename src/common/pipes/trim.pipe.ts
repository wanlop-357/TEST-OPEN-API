import { Injectable, PipeTransform } from '@nestjs/common';

type JsonLikeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonLikeValue[]
  | { readonly [key: string]: JsonLikeValue };

/**
 * Pipe สำหรับ trim string input ทั้งระดับ root และ object nested
 */
@Injectable()
export class TrimPipe implements PipeTransform<JsonLikeValue, JsonLikeValue> {
  /**
   * ฟังก์ชัน trim ค่า string ใน request body/query/param
   */
  transform(value: JsonLikeValue): JsonLikeValue {
    return this.trimValue(value);
  }

  /**
   * ฟังก์ชัน trim ค่าแบบ recursive โดยไม่เปลี่ยน type หลักของ input
   */
  private trimValue(value: JsonLikeValue): JsonLikeValue {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.trimValue(item));
    }

    if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.trimValue(item)]),
      );
    }

    return value;
  }
}
