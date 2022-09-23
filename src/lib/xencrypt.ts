import forge from 'node-forge';
import {
  DecryptionError, EncryptionError, GenerateSessionIdError,
} from './errors';

export class Xencrypt {
  /**
   * Returns a randomised 24 Bytes session key encoded in base64 format.
   */
  public generateSessionKey(): string {
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
   * Returns generated Session ID using the key provided by Xendit.
   * @param {string} key base64 encoded key provided by Xendit.
   * @param {string} sessionKeyB64 base64 encoded session key.
   * @param {string} iv initialization vector in bytes.
   * @return {string} base64 encoded Session ID.
   */
  public generateSessionId(key: string, sessionKeyB64: string, iv: string) {
    try {
      const cipher = forge.cipher.createCipher('AES-CBC', forge.util.decode64(key));
      const ivB64 = forge.util.encode64(iv);
      cipher.start({ iv });
      cipher.update(forge.util.createBuffer(forge.util.decode64(sessionKeyB64)));
      cipher.finish();
      const encrypted = cipher.output.data;
      return Buffer.concat([Buffer.from(ivB64, 'base64'), Buffer.from(forge.util.encode64(encrypted), 'base64')]).toString('base64');
    } catch (err) {
      throw new GenerateSessionIdError(err.message);
    }
  }

  /**
   * Returns encrypted secret in base64.
   * @param {string} plain secret to encrypt.
   * @param {string} sessionKeyB64 base64 encoded session key used for encryption.
   * @param {string} iv initialization vector in bytes.
   * @return {string} base64 encoded decrypted secret.
   */
  public encrypt(plain: string, sessionKeyB64: string, iv: string): string {
    try {
      const cipher = forge.cipher.createCipher(
        'AES-GCM',
        Buffer.from(sessionKeyB64, 'base64').toString('binary'),
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
   * @param {string} ivB64 base64 encoded initialization vector used during encryption.
   * @param {string} secret base64 encoded secret.
   * @param {string} sessionKeyB64 base64 encoded session key used for encryption.
   * @return {string} base64 encoded decrypted secret.
   */
  public decrypt(ivB64: string, secret: string, sessionKeyB64: string): string {
    try {
      const sessionKey = forge.util.decode64(sessionKeyB64);
      const ivBytes = forge.util
        .createBuffer(forge.util.decode64(ivB64))
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
      return forge.util.encode64(decrypted);
    } catch (err) {
      throw new DecryptionError(err.message);
    }
  }
}
