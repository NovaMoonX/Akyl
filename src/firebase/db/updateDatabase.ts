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

  if (!userSegment || !cryptoKey) {
    return;
  }

  const { id } = space;

  console.log('updating DB'); // REMOVE
  try {
    const pathRef = ref(db, `${path}/${userSegment}/${id}`);
    const encryptedData = await encryptData(space, cryptoKey);
    console.log('encryptedData', encryptedData); // REMOVE
    await timeoutAsyncFunction(() => set(pathRef, encryptedData));
    result = 'success';
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
