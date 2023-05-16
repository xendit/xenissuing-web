/* eslint-disable class-methods-use-this */
import forge from 'node-forge';
import {
  DecryptionError,
  EncryptionError,
  GenerateSessionIdError,
} from './errors';

/**
 * This class is responsible for encrypting messages using a public key.
 * @param {Buffer} publicKey - the public key to use for encryption
 */
export class SecureSession {
  private publicKey: string;

  private sessionKeyB64: string = SecureSession.generateSessionKey();

  constructor(publicKey: string, sessionKeyB64?: string) {
    this.publicKey = publicKey;
    this.sessionKeyB64 = sessionKeyB64 || this.sessionKeyB64;
  }

  public getSessionKeyB64() {
    return this.sessionKeyB64;
  }

  /**
     * Returns a randomised 24 Bytes session key encoded in base64 format.
     */
  public static generateSessionKey(): string {
    return forge.util.encode64(forge.random.getBytesSync(24));
  }

  /**
     * Function used to generate a random 16 bytes initialization vector.
     *
     * @returns {string} random initialization vector in bytes.
     */
  public generateIV(): string {
    return forge.random.getBytesSync(16);
  }

  /**
     * Returns encrypted Session key using the public key provided by Xendit.
     * @return {string} base64 encoded encrypted Session key.
     */
  public encryptKey() {
    try {
      const publicKey = forge.pki.publicKeyFromPem(this.publicKey);
      const buffer = forge.util.createBuffer(this.sessionKeyB64);
      const binaryString = buffer.getBytes();

      const encrypted = publicKey.encrypt(binaryString, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
      });

      return forge.util.encode64(encrypted);
    } catch (err) {
      throw new GenerateSessionIdError(err.message);
    }
  }

  /**
     * Returns encrypted Session key using the public key provided by Xendit.
     * @return {string} encoded URI of base64 encoded Session ID.
     */
  public getKey() {
    return encodeURIComponent(this.encryptKey());
  }

  /**
     * Returns encrypted secret in base64.
     * @param {string} plain secret to encrypt.
     * @param {string} iv initialization vector in bytes.
     * @return {string} base64 encoded decrypted secret.
     */
  public encrypt(plain: string, iv: string): string {
    try {
      const cipher = forge.cipher.createCipher(
        'AES-GCM',
        Buffer.from(this.sessionKeyB64, 'base64').toString('binary'),
      );
      cipher.start({ iv });
      cipher.update(forge.util.createBuffer(plain));
      cipher.finish();
      const tag = cipher.mode.tag.data;
      const encoded = cipher.output.data;
      return forge.util.encode64(encoded + tag);
    } catch (err) {
      throw new EncryptionError(err.message);
    }
  }

  /**
     * Returns decrypted secret in base64.
     * @param {string} iv base64 encoded initialization vector used during encryption.
     * @param {string} secret base64 encoded secret.
     * @return {string} base64 encoded decrypted secret.
     */
  public decryptCardData(
    iv: string,
    secret: string,
  ): string {
    try {
      const sessionKey = forge.util.decode64(this.sessionKeyB64);
      const ivBytes = forge.util
        .createBuffer(forge.util.decode64(iv))
        .getBytes();

      const encryptedWithTag = forge.util.decode64(secret);
      const encrypted = encryptedWithTag.substr(
        0,
        encryptedWithTag.length - 16,
      );
      const tag = encryptedWithTag.substr(
        encryptedWithTag.length - 16,
        encryptedWithTag.length,
      );

      const decipher = forge.cipher.createDecipher('AES-GCM', sessionKey);
      const tagBuffer = forge.util.createBuffer(tag);
      decipher.start({
        iv: ivBytes,
        tag: tagBuffer,
      });
      decipher.update(forge.util.createBuffer(encrypted));
      decipher.finish();
      const decryptedBytes = decipher.output.getBytes();
      const decrypted = decryptedBytes.substr(
        0,
        decryptedBytes.length > 16
          ? decryptedBytes.length - 16
          : decryptedBytes.length,
      );
      return decrypted;
    } catch (err) {
      throw new DecryptionError(err.message);
    }
  }
}
