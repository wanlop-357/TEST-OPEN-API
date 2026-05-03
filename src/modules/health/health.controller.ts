import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  /**
   * ฟังก์ชันตรวจสถานะพื้นฐานของ API service
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'ตรวจสถานะ API',
    description: 'ใช้ตรวจว่า API service พร้อมรับ request หรือไม่',
  })
  @ApiOkResponse({
    type: HealthResponseDto,
    description: 'API service ทำงานปกติ',
  })
  @ApiStandardErrorResponses()
  getHealth(): HealthResponseDto {
    return {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
