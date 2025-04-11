![NodeJs Support](https://img.shields.io/badge/nodejs-%3E=8.17.0-green)
![NPM Support](https://img.shields.io/badge/npm-%3E=6.14.15-green)

# Xenissuing

This SDK comprises the following module:

- **Xenissuing**: Handles encryption between XenIssuing and your web application.

## SecureSession

SecureSession is a module to help you set up encryption between XenIssuing and your application.

### Requirements

To use XenIssuing, you need a **public key** provided by Xendit.

It includes several methods:

- `getKey`: Generates and encrypts a random session key using the provided public key. This session key is used for asymmetric encryption with XenIssuing.
- `encrypt`: Used to encrypt sensitive data before sending it.
- `decryptCardData`: Used to decrypt sensitive card data received from XenIssuing.

---

### 1. Create Secure Session

```node
import XenIssuing from "@xendit/xenissuing-web"

const pubkey = "-----BEGIN PUBLIC KEY-----${key}-----END PUBLIC KEY-----`"

const secureSession = XenIssuing.createSecureSession(pubkey) // add sessionKey as parameter to test
const sessionId = secureSession.getKey() // to be used for API calls(eg. get card pan,cvv,etc)

const { secret, iv } = apiResponse.data
const decryptedData = secureSession.decryptCardData(iv, secret)
```

### 2. Get Card PAN

```node
import axios from "axios"

const secureSession = XenIssuing.createSecureSession(pubkey)
const authHeader = "auth"
const sessionId = secureSession.getKey()

const config = {
  method: "get",
  url: `https://base-url/pan?session_id=${sessionId}`,
  headers: {
    Authorization: authHeader,
  },
}

const response = await axios.request(config)

const { iv, secret } = response.data
const pan = secureSession.decryptCardData(iv, secret)

console.log("Decrypted PAN:", pan)
```

### 3. Get Card CVV

```node
import axios from "axios"

const secureSession = XenIssuing.createSecureSession(pubkey)
const authHeader = "auth"
const sessionId = secureSession.getKey()

const config = {
  method: "get",
  url: `https://base-url/cvv2?session_id=${sessionId}`,
  headers: {
    Authorization: authHeader,
  },
}

const response = await axios.request(config)

const { iv, secret } = response.data
const cvv = secureSession.decryptCardData(iv, secret)

console.log("Decrypted CVV:", cvv)
```

### 4. Set Card PIN

```node
import axios from 'axios';

const secureSession = XenIssuing.createSecureSession(pubkey);
const authHeader = 'auth';
const sessionId = secureSession.getKey();


const pinToSet = '159753';
const iv = secureSession.generateIV()
const encPIN = secureSession.encrypt(pin, iv)

const ivBase64 = forge.util.encode64(iv) // you need to turn this into Base64 before use it the api call

console.log({ iv: ivBase64, pin: encPIN })


const config = {
  method: 'post',
  url: `https://base-url/pin?session_id=${sessionId}`,
  data: {
    pin: encPIN,
    iv: ivBase64
  }
  headers: {
    Authorization: authHeader,
  },
};

const response = await axios.request(config);

console.log('PIN set successfully:', response.data);
```

### 5. Get Card PIN

```node
import axios from "axios"

const secureSession = XenIssuing.createSecureSession(pubkey)
const authHeader = "auth"
const sessionId = secureSession.getKey()

const config = {
  method: "get",
  url: `https://base-url/pin?session_id=${sessionId}`,
  headers: {
    Authorization: authHeader,
  },
}

const response = await axios.request(config)

const { iv, secret } = response.data
const pin = secureSession.decryptCardData(iv, secret)

console.log("Decrypted PIN:", pin)
```
