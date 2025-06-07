import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import { timeoutAsyncFunction } from '../../utils';
import { firestore } from '../config';

interface PushEncryptionKeyParams {
  key: CryptoKey;
  userId?: string;
  testing?: boolean;
}

export default async function pushEncryptionKey({
  key,
  userId = '',
  testing = false,
}: PushEncryptionKeyParams) {
  let result = null,
    error = null;

  const path = testing ? 'test_keys' : 'keys';
  const userSegment = testing ? 'test_user' : userId;
  const exportedKey = await crypto.subtle.exportKey("jwk", key); // Export the key in JWK format since Firestore requires a JSON-compatible format

  try {
    const pathRef = doc(firestore, path, userSegment);
    await timeoutAsyncFunction(() => setDoc(pathRef, { key: exportedKey }));
    result = 'success';
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
