import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';
import { timeoutAsyncFunction } from '../../utils';
import { firestore } from '../config';

interface PullEncryptionKeyParams {
  userId?: string;
  testing?: boolean;
}

export default async function pullEncryptionKey({
  userId = '',
  testing = false,
}: PullEncryptionKeyParams) {
  let result = null,
    error = null;

  const path = testing ? 'test_keys' : 'keys';
  const userSegment = testing ? 'test_user' : userId;

  try {
    const pathRef = doc(firestore, path, userSegment);
    const docSnap = await timeoutAsyncFunction(() => getDoc(pathRef));
    if (docSnap.exists()) {
      const jwk = docSnap.data()?.key;
      result = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'AES-GCM' },
        true,
        ['decrypt'],
      );
    }
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
