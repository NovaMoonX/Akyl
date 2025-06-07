import { FirebaseError } from '@firebase/util';
import { get, ref } from 'firebase/database';
import { timeoutAsyncFunction } from '../../utils';
import { db } from '../config';

interface ReadDatabaseParams {
  spaceId: string;
  testing?: boolean;
  userId?: string;
}

export default async function readDatabase<T>({
  spaceId,
  userId,
  testing = false,
}: ReadDatabaseParams) {
  let result = null,
    error = null;

  const path = testing ? 'test' : 'users';
  const userSegment = testing ? 'test_user' : userId;

  if (!userSegment) {
    return;
  }

  try {
    const pathRef = ref(db, `${path}/${userSegment}/${spaceId}`);
    console.log('Reading DB for ', spaceId); // REMOVE
    const snapshot = await timeoutAsyncFunction(() => get(pathRef));
    result = snapshot.val() as T;
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
