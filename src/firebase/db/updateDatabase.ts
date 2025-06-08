import { FirebaseError } from '@firebase/util';
import { ref, set } from 'firebase/database';
import { encryptData, type Space } from '../../lib';
import { timeoutAsyncFunction } from '../../utils';
import { db } from '../config';

interface UpdateDatabaseParams {
  space: Space;
  cryptoKey: CryptoKey | null;
  testing?: boolean;
  userId?: string;
}

export default async function updateDatabase({
  space,
  cryptoKey,
  userId,
  testing = false,
}: UpdateDatabaseParams) {
  let result = null,
    error = null;

  const path = testing ? 'test' : 'users';
  const userSegment = testing ? 'test_user' : userId;

  if (!userSegment) {
    return {
      result,
      error: new FirebaseError(
        '',
        'userSegment is required to update database',
      ),
    };
  }
  if (!cryptoKey) {
    return {
      result,
      error: new FirebaseError('', 'cryptoKey is required to update database'),
    };
  }

  const { id } = space;

  try {
    const pathRef = ref(db, `${path}/${userSegment}/${id}`);
    const encryptedData = await encryptData(space, cryptoKey);
    const dataWithMeta = {
      ...encryptedData,
      metadata: {
        updatedAt: space?.metadata?.updatedAt || Date.now(),
      },
    };
    await timeoutAsyncFunction(() => set(pathRef, dataWithMeta));
    result = 'success';
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
