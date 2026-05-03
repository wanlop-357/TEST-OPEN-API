import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../src/modules/health/health.controller';
import { HealthModule } from '../src/modules/health/health.module';

interface HealthResponseBody {
  readonly success: boolean;
  readonly status: string;
  readonly timestamp: string;
}

describe('HealthController (e2e)', () => {
  let controller: HealthController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    controller = moduleFixture.get<HealthController>(HealthController);
  });

  it('returns health status', () => {
    const body: HealthResponseBody = controller.getHealth();

    expect(body.success).toBe(true);
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
