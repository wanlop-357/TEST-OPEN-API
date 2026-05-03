import { Response } from 'express';
import { ClientTypeMiddleware } from '../../../src/common/middlewares/client-type.middleware';
import { RequestWithId } from '../../../src/common/interfaces/request-with-id.interface';

describe('ClientTypeMiddleware', () => {
  const middleware = new ClientTypeMiddleware();

  it('sets client type from x-client-type header', () => {
    const request = {
      header: (name: string): string | undefined => (name === 'x-client-type' ? 'web' : undefined),
    } as RequestWithId;
    const response = {} as Response;
    const next = jest.fn();

    middleware.use(request, response, next);

    expect(request.clientType).toBe('web');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
