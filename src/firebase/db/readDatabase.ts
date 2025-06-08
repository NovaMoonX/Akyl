import { FirebaseError } from '@firebase/util';
import { get, ref } from 'firebase/database';
import { timeoutAsyncFunction } from '../../utils';
import { db } from '../config';

interface ReadDatabaseParams {
  itemPath: string;
  userId?: string;
}

export default async function readDatabase<T>({
  itemPath,
  userId,
}: ReadDatabaseParams) {
  let result = null,
    error = null;

  if (!userId) {
    return {
      result,
      error: new FirebaseError('', 'userId is required to read database'),
    };
  }

  if (!itemPath) {
    return {
      result,
      error: new FirebaseError('', 'itemPath is required to read database'),
    };
  }

  try {
    const pathRef = ref(db, `users/${userId}/${itemPath}`);
    const snapshot = await timeoutAsyncFunction(() => get(pathRef));
    result = snapshot.val() as T;
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
