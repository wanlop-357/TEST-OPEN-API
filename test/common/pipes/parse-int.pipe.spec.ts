import { BadRequestException } from '@nestjs/common';
import { CustomParseIntPipe } from '../../../src/common/pipes/parse-int.pipe';

describe('CustomParseIntPipe', () => {
  const pipe = new CustomParseIntPipe();

  it('transforms numeric string to integer', () => {
    expect(pipe.transform('123')).toBe(123);
  });

  it('throws BadRequestException when value is not integer', () => {
    expect(() => pipe.transform('abc')).toThrow(BadRequestException);
  });
});
