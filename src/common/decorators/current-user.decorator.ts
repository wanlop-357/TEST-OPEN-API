import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { RequestWithId } from '../interfaces/request-with-id.interface';

/**
 * Decorator สำหรับดึง user ปัจจุบันจาก request หลังผ่าน authentication
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithId>();

    return request.user;
  },
);
