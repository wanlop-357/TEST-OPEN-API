import { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.interface';

/**
 * Interface ของ request ที่มีข้อมูลกลางซึ่ง middleware/interceptor ใช้ร่วมกัน
 */
export interface RequestWithId extends Request {
  readonly requestId?: string;
  readonly clientType?: string;
  readonly user?: AuthenticatedUser;
}
