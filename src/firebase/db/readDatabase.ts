import { FirebaseError } from '@firebase/util';
import { get, ref } from 'firebase/database';
import { decryptData } from '../../lib';
import { timeoutAsyncFunction } from '../../utils';
import { db } from '../config';

interface ReadDatabaseParams {
  spaceId: string;
  cryptoKey: CryptoKey | null;
  testing?: boolean;
  userId?: string;
}

export default async function readDatabase<T>({
  spaceId,
  cryptoKey,
  userId,
  testing = false,
}: ReadDatabaseParams) {
  let result = null,
    error = null;

  const path = testing ? 'test' : 'users';
  const userSegment = testing ? 'test_user' : userId;

  if (!userSegment || !cryptoKey) {
    return;
  }

  console.log('reading DB'); // REMOVE
  try {
    const pathRef = ref(db, `${path}/${userSegment}/${spaceId}`);
    const snapshot = await timeoutAsyncFunction(() => get(pathRef));
    const { iv, encryptedData } = snapshot.val() as {
      iv: string;
      encryptedData: string;
    };
    result = (await decryptData(encryptedData, cryptoKey, iv)) as T;
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
