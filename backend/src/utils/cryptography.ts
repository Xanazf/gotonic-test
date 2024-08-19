import crypto from "node:crypto";
import { JWTPayload, SignJWT, jwtVerify } from 'jose';

// utility
// -- JWT
async function signJWT(payload: JWTPayload, secret: string, expiresIn: string = '7d') {
  const secretEncoded = new TextEncoder().encode(secret);
  const alg = 'HS256';

  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretEncoded);
}
async function verifyJWT(token: string, secret: string) {
  const secretEncoded = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(token, secretEncoded);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw error;
  }
}

// -- text conversion
function buf2hex(buffer: ArrayBuffer | Buffer) {
  return Array.prototype.slice
    .call(new Uint8Array(buffer))
    .map(x => [x >> 4, x & 15])
    .map(ab => ab.map(x => x.toString(16)).join(""))
    .join("");
}
function buf2str(buffer: ArrayBuffer | Buffer) {
  return new TextDecoder("utf-8").decode(buffer);
}
function hex2str(h: string) {
  const hexbuf = Buffer.from(h, "hex");
  return hexbuf.toString("utf8")
}

// -- Crypto
async function deriveKey(secret: string, salt?: Buffer): Promise<[CryptoKey, Buffer]> {
  salt = salt || crypto.randomBytes(32);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    Buffer.from(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,  // Increased for better security
      hash: "SHA-512"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return [key, salt];
}
async function encrypt(payload: string, presalt?: string, checkiv?: Buffer) {
  const secret = process.env.SECRET || "superSecretSecret";
  const backupSalt = process.env.BACKUP_SALT || "backupSuperSalt";
  const salt = Buffer.from(presalt || backupSalt);

  const iv = checkiv || crypto.randomBytes(16);
  const data = Buffer.from(payload);

  const [key, usedSalt] = await deriveKey(secret, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);


  return `${usedSalt.toString("hex")}:${iv.toString("hex")}:${buf2hex(encrypted)}`;
}
async function check(payload: string, saltIvCipherHex: string) {
  try {
    const [saltHex, ivHex, dataHex] = saltIvCipherHex.split(":");

    const salt = hex2str(saltHex);
    const iv = Buffer.from(ivHex, "hex");

    const encrypted = await encrypt(payload, salt, iv);

    return encrypted === saltIvCipherHex
  } catch (error) {
    console.error('Check error:', error);
  }
}
async function decrypt(secret: string, saltIvCipherHex: string) {

  try {
    const [saltHex, ivHex, dataHex] = saltIvCipherHex.split(":");

    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const data = Buffer.from(dataHex, "hex");

    const [key] = await deriveKey(secret, salt);

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);

    const decryptor = new TextDecoder();
    const result = decryptor.decode(decrypted);
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

export {
  signJWT,
  verifyJWT,
  deriveKey,
  encrypt,
  check,
  decrypt
}
