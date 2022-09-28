
![NodeJs Support](https://img.shields.io/badge/nodejs-%3E=8.17.0-green)
![NPM Support](https://img.shields.io/badge/npm-%3E=6.14.15-green)

# Xenissuing

This SDK comprises of the following modules :
- XenCrypt: this module handles encryption between XenIssuing and your Web application.

## XenCrypt

XenCrypt is a module to help you set up encryption between XenIssuing and your application.

### Requirements

To be able to use Xenissuing, you will need to use a private key provided by Xendit.

It includes several methods:
- `generateSessionId` will encrypt a session key randomly generated used for symmetric encryption with Xenissuing.
- `encrypt` would be used when setting sensitive data.
- `decrypt` would be used whenever receiving sensitive data from Xenissuing.

### Usage
```node
import forge from 'node-forge';
import XenIssuing from '@xendit/xenissuing-web';

const xen = new XenIssuing();
const sessionKey = xen.generateSessionKey();
const iv = xen.generateIV();
const sessionId = xen.generateSessionId('PRIVATE_KEY_PROVIDED_BY_XENDIT', sessionKey, iv);
const encryptedPlain = xen.encrypt('plainText', sessionKey, iv);
const decryptedPlain = forge.util.decode64(xen.decrypt(forge.util.encode64(iv), encryptedPlain, sessionKey));
```
