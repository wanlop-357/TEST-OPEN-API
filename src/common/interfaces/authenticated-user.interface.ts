/**
 * Interface กลางของ user ที่ถูกแนบมากับ request หลังผ่าน authentication
 */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email?: string;
  readonly roles?: string[];
}
