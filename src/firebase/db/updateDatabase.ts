import { FirebaseError } from '@firebase/util';
import { ref, set } from 'firebase/database';
import { timeoutAsyncFunction } from '../../utils';
import { db } from '../config';

interface UpdateDatabaseParams {
  data: unknown;
  userId?: string;
  itemPath: string;
}

export default async function updateDatabase({
  data,
  userId,
  itemPath,
}: UpdateDatabaseParams) {
  let result = null,
    error = null;

  if (data == null || data === undefined) {
    return {
      result,
      error: new FirebaseError('', 'data is required to update database'),
    };
  }

  if (!userId) {
    return {
      result,
      error: new FirebaseError('', 'userId is required to update database'),
    };
  }

  if (!itemPath) {
    return {
      result,
      error: new FirebaseError('', 'itemPath is required to update database'),
    };
  }

  try {
    // Update space in the database
    const pathRef = ref(db, `users/${userId}/${itemPath}`);
    await timeoutAsyncFunction(() => set(pathRef, data));
    result = 'success';
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
