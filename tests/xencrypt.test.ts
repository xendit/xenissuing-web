import crypto from 'crypto';
import forge from 'node-forge';
import { XenIssuing } from '../src';
import { DecryptionError, EncryptionError } from '../src/lib/errors';

describe('XenCrypt', () => {
  let xenCrypt;
  beforeAll(() => {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    xenCrypt = new XenIssuing(
      forge.pki.publicKeyToPem(keys.publicKey),
    );
  });
  it("'generateSessionKey' should generate Session Key in base64 format", () => {
    // Arrange
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    // Act
    const sessionKey = xenCrypt.generateSessionKey();

    // Assert
    expect(base64regex.test(sessionKey)).toBe(true);
  });

  it("'generateSessionId' should generate Session Id in base64 format", () => {
    // Arrange
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    const sessionKey = xenCrypt.generateSessionKey();

    // Act
    const sessionId = xenCrypt.generateSessionId(sessionKey);

    // Assert
    expect(base64regex.test(sessionId)).toBe(true);
  });

  it('should decrypt plain text', () => {
    // Arrange
    const plain = 'test';
    const sessionKey = xenCrypt.generateSessionKey();
    const iv = xenCrypt.generateIV();
    const ivB64 = forge.util.encode64(iv);
    const encryptedPlain = xenCrypt.encrypt(plain, sessionKey, iv);

    // Act
    const decryptedPlain = xenCrypt.decrypt(ivB64, encryptedPlain, sessionKey);

    // Assert
    expect(decryptedPlain).toEqual(
      forge.util.encode64(forge.util.createBuffer(plain, 'utf8').getBytes()),
    );
  });

  it('should not decrypt plain text if provided different session key then was provided during encryption', () => {
    // Arrange
    const plain = 'test';
    const sessionKeyForEncryption = xenCrypt.generateSessionKey();
    const sessionKeyForDecryption = xenCrypt.generateSessionKey();
    const iv = xenCrypt.generateIV();
    const ivB64 = forge.util.encode64(iv);
    const encryptedPlain = xenCrypt.encrypt(plain, sessionKeyForEncryption, iv);

    // Act
    const decryptedPlain = xenCrypt.decrypt(ivB64, encryptedPlain, sessionKeyForDecryption);

    // Assert
    expect(decryptedPlain).not.toEqual(
      forge.util.encode64(forge.util.createBuffer(plain, 'utf8').getBytes()),
    );
  });

  it('should not decrypt plain text if provided different iv then was provided during encryption', () => {
    // Arrange
    const plain = 'test';
    const sessionKeyForEncryption = xenCrypt.generateSessionKey();
    const iv = xenCrypt.generateIV();
    const secondIv = forge.random.getBytesSync(16);
    const ivB64 = forge.util.encode64(secondIv);
    const encryptedPlain = xenCrypt.encrypt(plain, sessionKeyForEncryption, iv);

    // Act
    const decryptedPlain = xenCrypt.decrypt(
      ivB64,
      encryptedPlain,
      sessionKeyForEncryption,
    );

    // Assert
    expect(decryptedPlain).not.toEqual(
      forge.util.encode64(forge.util.createBuffer(plain, 'utf8').getBytes()),
    );
  });

  it('should throw an error during encryption if the provided session key is more than 32 bytes', () => {
    // Arrange
    const plain = 'test';
    const iv = xenCrypt.generateIV();
    const mockedSessionKey = Buffer.from(crypto.randomBytes(64)).toString('base64');

    // Act/Assert
    expect(() => {
      xenCrypt.encrypt(plain, mockedSessionKey, iv);
    }).toThrow(EncryptionError);
  });

  it('should throw an error during decryption if the provided session key is more than 32 bytes', () => {
    // Arrange
    const plain = 'test';
    const iv = xenCrypt.generateIV();
    const ivB64 = forge.util.encode64(iv);
    const mockedSessionKey = Buffer.from(crypto.randomBytes(64)).toString('base64');

    // Act/Assert
    expect(() => {
      xenCrypt.decrypt(ivB64, plain, mockedSessionKey);
    }).toThrow(DecryptionError);
  });

  it('should not decrypt plain text if the provided during decryption iv is not encoded', () => {
    // Arrange
    const plain = 'test';
    const sessionKey = xenCrypt.generateSessionKey();
    const iv = xenCrypt.generateIV();
    const encryptedPlain = xenCrypt.encrypt(plain, sessionKey, iv);

    // Act
    const decryptedPlain = xenCrypt.decrypt(iv, encryptedPlain, sessionKey);

    // Assert
    expect(decryptedPlain).not.toEqual(
      forge.util.encode64(forge.util.createBuffer(plain, 'utf8').getBytes()),
    );
  });
});
