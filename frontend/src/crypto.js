/**
 * Web Crypto API (AES-256-GCM + HMAC-SHA256) client matching Laravel PayloadCryptoService.
 */

const AES_KEY_B64 = import.meta.env.VITE_API_PAYLOAD_KEY || "YWNtZS1zZWN1cmUtMjU2LWJpdC1hZXMtZ2NtLWtleSE=";
const HMAC_KEY_B64 = import.meta.env.VITE_API_HMAC_SECRET || "YWNtZS1obWFjLXNoYTI1Ni1zaWduaW5nLXNlY3JldCE=";

function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function getAesKey() {
  return crypto.subtle.importKey("raw", b64ToBytes(AES_KEY_B64), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function getHmacKey() {
  return crypto.subtle.importKey("raw", b64ToBytes(HMAC_KEY_B64), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signRequestHeaders(method, path) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const nonceBytes = crypto.getRandomValues(new Uint8Array(12));
  const nonce = bytesToB64(nonceBytes);
  const hmacKey = await getHmacKey();
  const msg = new TextEncoder().encode(`${method.toUpperCase()}|${path}|${ts}|${nonce}`);
  const sigBuf = await crypto.subtle.sign("HMAC", hmacKey, msg);
  return {
    "X-API-Timestamp": ts,
    "X-API-Nonce": nonce,
    "X-API-Signature": bytesToB64(new Uint8Array(sigBuf)),
  };
}

export async function encryptEnvelope(payload) {
  const aesKey = await getAesKey();
  const hmacKey = await getHmacKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));

  const cipherWithTag = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, aesKey, plaintext)
  );
  const ciphertext = cipherWithTag.slice(0, cipherWithTag.length - 16);
  const tag = cipherWithTag.slice(cipherWithTag.length - 16);

  const ivB64 = bytesToB64(iv);
  const tagB64 = bytesToB64(tag);
  const dataB64 = bytesToB64(ciphertext);
  const ts = Math.floor(Date.now() / 1000);

  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new TextEncoder().encode(`${ivB64}.${tagB64}.${dataB64}.${ts}`)
  );

  return {
    encrypted: true,
    iv: ivB64,
    tag: tagB64,
    data: dataB64,
    ts,
    sig: bytesToB64(new Uint8Array(sigBuf)),
  };
}

export async function decryptEnvelope(envelope) {
  if (!envelope || !envelope.encrypted) return envelope;

  const { iv, tag, data, ts, sig } = envelope;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > 120) {
    throw new Error("Encrypted response timestamp expired.");
  }

  const hmacKey = await getHmacKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    hmacKey,
    b64ToBytes(sig),
    new TextEncoder().encode(`${iv}.${tag}.${data}.${ts}`)
  );
  if (!valid) throw new Error("Invalid response HMAC signature.");

  const cipherBytes = b64ToBytes(data);
  const tagBytes = b64ToBytes(tag);
  const combined = new Uint8Array(cipherBytes.length + tagBytes.length);
  combined.set(cipherBytes);
  combined.set(tagBytes, cipherBytes.length);

  const aesKey = await getAesKey();
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(iv), tagLength: 128 },
    aesKey,
    combined
  );
  return JSON.parse(new TextDecoder().decode(plainBuf));
}
