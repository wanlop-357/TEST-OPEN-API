import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';

export interface RequestContext {
  readonly requestId: string;
  readonly clientType?: string;
}

/**
 * Service สำหรับเก็บ request context ต่อ async chain เพื่อให้ logger อ่าน requestId ได้
 */
@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  /**
   * ฟังก์ชันครอบ callback ด้วย request context ปัจจุบัน
   */
  run(context: RequestContext, callback: () => void): void {
    this.storage.run(context, callback);
  }

  /**
   * ฟังก์ชันคืนค่า context ปัจจุบันของ request
   */
  getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  /**
   * ฟังก์ชันคืนค่า requestId ปัจจุบัน ถ้าอยู่นอก request จะคืน undefined
   */
  getRequestId(): string | undefined {
    return this.getContext()?.requestId;
  }
}
