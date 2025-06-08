import { FirebaseError } from '@firebase/util';
import { get, ref } from 'firebase/database';
import { decryptData, type Space } from '../../lib';
import { timeoutAsyncFunction } from '../../utils';
import { db } from '../config';

interface ReadDatabaseParams {
  spaceId: string;
  cryptoKey: CryptoKey | null;
  testing?: boolean;
  userId?: string;
}

export default async function readDatabase({
  spaceId,
  cryptoKey,
  userId,
  testing = false,
}: ReadDatabaseParams) {
  let result = null,
    error = null;

  const path = testing ? 'test' : 'users';
  const userSegment = testing ? 'test_user' : userId;

  if (!userSegment) {
    return {
      result,
      error: new FirebaseError('', 'userSegment is required to read database'),
    };
  }
  if (!cryptoKey) {
    return {
      result,
      error: new FirebaseError('', 'cryptoKey is required to read database'),
    };
  }

  try {
    const pathRef = ref(db, `${path}/${userSegment}/${spaceId}`);
    const snapshot = await timeoutAsyncFunction(() => get(pathRef));
    const { iv, encryptedData } = snapshot.val() as {
      iv: string;
      encryptedData: string;
    };
    const decryptedData = (await decryptData(
      encryptedData,
      cryptoKey,
      iv,
    )) as Space;
    result = decryptedData;
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
