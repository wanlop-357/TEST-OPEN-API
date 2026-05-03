import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from '../../../src/common/interceptors/transform.interceptor';
import { RequestWithId } from '../../../src/common/interfaces/request-with-id.interface';

describe('TransformInterceptor', () => {
  it('wraps response with BaseResponseDto shape', (done) => {
    const interceptor = new TransformInterceptor<{ readonly name: string }>();
    const request: Partial<RequestWithId> = {
      requestId: 'req-123',
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
    const next = {
      handle: () => of({ name: 'Alice' }),
    };

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toMatchObject({
        success: true,
        requestId: 'req-123',
        data: { name: 'Alice' },
      });
      done();
    });
  });
});
