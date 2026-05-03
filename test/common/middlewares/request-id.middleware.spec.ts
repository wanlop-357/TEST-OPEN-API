import { Response } from 'express';
import { AppConfigService } from '../../../src/config/app-config.service';
import { RequestIdMiddleware } from '../../../src/common/middlewares/request-id.middleware';
import { RequestWithId } from '../../../src/common/interfaces/request-with-id.interface';
import { RequestContextService } from '../../../src/common/services/request-context.service';

describe('RequestIdMiddleware', () => {
  it('sets request id on request, response header, and context', () => {
    const appConfigService = {
      app: {
        requestIdHeader: 'x-request-id',
      },
    } as AppConfigService;
    const requestContextService = new RequestContextService();
    const middleware = new RequestIdMiddleware(appConfigService, requestContextService);
    const request = {
      header: (name: string): string | undefined =>
        name === 'x-request-id' ? 'req-123' : undefined,
    } as RequestWithId;
    const setHeader = jest.fn();
    const response = {
      setHeader,
    } as unknown as Response;
    const next = jest.fn(() => {
      expect(requestContextService.getRequestId()).toBe('req-123');
    });

    middleware.use(request, response, next);

    expect(request.requestId).toBe('req-123');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'req-123');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
