import { XenIssuing } from '../src';

const pubkey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtnraE8cT6G4CGhwVIan7EqmcMue7cFgtgTGzbiZS4buNuDiPN18iiOGSIdXGAwte0CS8o6qjwKKigHtg2XMBxThZctxj0T5lKa2JatqH2SnVV8c2GdoLJEqpmr73P7/tkCWGCds0KZriupPKgU+JSqGWhCKkKectUgkz8F/GdQIHUHxRdKQ4rFLbuHCwzncL3ZolUruiFIEZmz435B2iKdBXlxOx9MizxsH8IDiFgSRgId+xp0V2eStz8dKaN+N5C+QnDtVmXJWlkks0WygMxqXPQVaaiLNwmwvCSV+9zY3NU+Xz4+EfwZ4+Mvc7SxUq7IVwwmT+g2Vwq9xEWedMmwIDAQAB';
const pkstr = `-----BEGIN PUBLIC KEY-----${pubkey}-----END PUBLIC KEY-----`;

// const sessionKey = SecureSession.generateSessionKey();
// console.log('sessionKey', sessionKey);

// add sessionKey as parameter to test
// eg. XenIssuing.createSecureSession(pkstr, sessionKey);
const secureSession = XenIssuing.createSecureSession(pkstr);

const sessionId = secureSession.getKey(); // to be used for API calls(eg. get card pan,cvv,etc)
console.log('sessionId', sessionId);

// Call API (eg. get card pan,cvv,etc) to get secret and iv from response
const secret = '';
const iv = '';
console.log('decrypt', secureSession.decryptCardData(iv, secret));
