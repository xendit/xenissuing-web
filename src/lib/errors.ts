// eslint-disable-next-line max-classes-per-file
export class DecryptionError extends Error {
  constructor(message) {
    super(`Failed to decrypt: ${message}`);
  }
}

export class EncryptionError extends Error {
  constructor(message) {
    super(`Failed to encrypt: ${message}`);
  }
}

export class GenerateSessionIdError extends Error {
  constructor(message) {
    super(`Failed to generate session id: ${message}`);
  }
}
