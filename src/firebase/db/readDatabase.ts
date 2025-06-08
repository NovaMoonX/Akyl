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

  if (
    itemPath === undefined ||
    itemPath === null ||
    typeof itemPath !== 'string'
  ) {
    return {
      result,
      error: new FirebaseError('', 'itemPath is required to read database'),
    };
  }

  if (itemPath === '') {
    console.warn(
      'itemPath is empty, reading root of the database for user:',
      userId,
    );
  }

  const formattedItemPath = itemPath === '' ? '' : `/${itemPath}`;

  try {
    const pathRef = ref(db, `users/${userId}${formattedItemPath}`);
    const snapshot = await timeoutAsyncFunction(() => get(pathRef));
    result = snapshot.val() as T;
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
