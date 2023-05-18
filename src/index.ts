import { SecureSession } from './lib/secure-session';

export class XenIssuing {
  public static createSecureSession(publicKey: string, sessionKey?: string): SecureSession {
    return new SecureSession(publicKey, sessionKey);
  }
}
