import { pullEncryptionKey, pushEncryptionKey } from '../firebase';

export async function generateEncryptionKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}

export async function getUserCryptoKey(
  userId: string,
  testing = false,
): Promise<CryptoKey | null> {
  const pullResponse = await pullEncryptionKey({ userId, testing });
  if (pullResponse.error) {
    console.error('Error fetching user crypto key:', pullResponse.error);
    return null;
  }

  if (pullResponse.result) {
    return pullResponse.result;
  }

  console.warn('No crypto key found for user:', userId, 'generating a new key.');
  const key = await generateEncryptionKey();
  const pushResult = await pushEncryptionKey({ key, userId, testing });

  if (pushResult.error) {
    console.error('Error pushing user crypto key:', pushResult.error);
    return null;
  }

  return key;
}

export async function encryptData(data: object, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData,
  );
  // Convert ArrayBuffer and IV to Base64 strings for storage
  const encryptedDataBase64 = arrayBufferToBase64(encryptedData);
  const ivBase64 = arrayBufferToBase64(iv);
  return { iv: ivBase64, encryptedData: encryptedDataBase64 };
}

export async function decryptData(
  encryptedDataBase64: string,
  key: CryptoKey,
  ivBase64: string,
) {
  // Convert Base64 strings back to ArrayBuffer/Uint8Array
  const encryptedData = base64ToArrayBuffer(encryptedDataBase64);
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData,
  );
  return JSON.parse(new TextDecoder().decode(decryptedData));
}

// Helper functions for Base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
