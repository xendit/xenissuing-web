![NodeJs Support](https://img.shields.io/badge/nodejs-%3E=8.17.0-green)
![NPM Support](https://img.shields.io/badge/npm-%3E=6.14.15-green)

# Xenissuing

This SDK comprises of the following modules :

- XenIssuing: this module handles encryption between XenIssuing and your Web application.

## SecureSession

SecureSession is a module to help you set up encryption between XenIssuing and your application.

### Requirements

To be able to use Xenissuing, you will need to use a private key provided by Xendit.

It includes several methods:

- `getKey` will encrypt a session key randomly generated used for asymmetric encryption with Xenissuing.
- `encrypt` would be used when setting sensitive data.
- `decryptCardData` would be used whenever receiving sensitive card data from Xenissuing.

### Usage

```node
import XenIssuing from "@xendit/xenissuing-web";

const pubkey = "-----BEGIN PUBLIC KEY-----${key}-----END PUBLIC KEY-----`";

const secureSession = XenIssuing.createSecureSession(pubkey); // add sessionKey as parameter to test
const sessionId = secureSession.getKey(); // to be used for API calls(eg. get card pan,cvv,etc)

const { secret, iv } = apiResponse.data;
const decryptedData = secureSession.decryptCardData(iv, secret);
```
