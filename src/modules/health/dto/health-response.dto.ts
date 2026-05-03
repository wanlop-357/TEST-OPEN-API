import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: true,
    description: 'สถานะสำเร็จของ response',
  })
  success!: true;

  @ApiProperty({
    example: 'ok',
    description: 'สถานะ health check',
  })
  status!: string;

  @ApiProperty({
    example: '2026-05-02T10:30:00.000Z',
    description: 'เวลาปัจจุบันของ server ในรูปแบบ ISO string',
  })
  timestamp!: string;
}
