import forge from 'node-forge';
import { XenIssuing } from '../src';
import { SecureSession } from '../src/lib/secure-session';

describe('XenCrypt', () => {
  let xenCrypt: SecureSession;
  beforeAll(() => {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const pubKey = forge.pki.publicKeyToPem(keys.publicKey);
    xenCrypt = XenIssuing.createSecureSession(pubKey);
  });
  it("'generateSessionKey' should generate Session Key in base64 format", () => {
    // Arrange
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    // Act
    const sessionKey = SecureSession.generateSessionKey();

    // Assert
    expect(base64regex.test(sessionKey)).toBe(true);
  });

  it("'generateSessionId' should generate Session Id in base64 format", () => {
    // Arrange
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    // Act
    const sessionId = xenCrypt.encryptKey();

    // Assert
    expect(base64regex.test(sessionId)).toBe(true);
  });

  it('should decrypt plain text', () => {
    // Arrange
    const plain = 'test';
    const iv = xenCrypt.generateIV();
    const ivB64 = forge.util.encode64(iv);
    const encryptedPlain = xenCrypt.encrypt(plain, iv);

    // Act
    const decryptedPlain = xenCrypt.decryptCardData(ivB64, encryptedPlain);

    // Assert
    expect(decryptedPlain).toEqual(
      forge.util.createBuffer(plain, 'utf8').getBytes(),
    );
  });

  it('should not decrypt plain text if provided different iv then was provided during encryption', () => {
    // Arrange
    const plain = 'test';
    const iv = xenCrypt.generateIV();
    const secondIv = forge.random.getBytesSync(16);
    const ivB64 = forge.util.encode64(secondIv);
    const encryptedPlain = xenCrypt.encrypt(plain, iv);

    // Act
    const decryptedPlain = xenCrypt.decryptCardData(
      ivB64,
      encryptedPlain,
    );

    // Assert
    expect(decryptedPlain).not.toEqual(
      forge.util.encode64(forge.util.createBuffer(plain, 'utf8').getBytes()),
    );
  });

  it('should not decrypt plain text if the provided during decryption iv is not encoded', () => {
    // Arrange
    const plain = 'test';
    const iv = xenCrypt.generateIV();
    const encryptedPlain = xenCrypt.encrypt(plain, iv);

    // Act
    const decryptedPlain = xenCrypt.decryptCardData(iv, encryptedPlain);

    // Assert
    expect(decryptedPlain).not.toEqual(
      forge.util.encode64(forge.util.createBuffer(plain, 'utf8').getBytes()),
    );
  });
});
