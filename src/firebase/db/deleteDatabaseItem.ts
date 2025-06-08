import { FirebaseError } from '@firebase/util';
import { ref, remove } from 'firebase/database';
import { timeoutAsyncFunction } from '../../utils';
import { db } from '../config';

interface DeleteDatabaseItemParams {
  userId?: string;
  itemPath: string;
}

export default async function deleteDatabaseItem({
  userId,
  itemPath,
}: DeleteDatabaseItemParams) {
  let result = null,
    error = null;

  if (!userId) {
    return {
      result,
      error: new FirebaseError(
        '',
        'userId is required to delete database item',
      ),
    };
  }

  if (!itemPath) {
    return {
      result,
      error: new FirebaseError(
        '',
        'itemPath is required to delete database item',
      ),
    };
  }

  try {
    // Update space in the database
    const pathRef = ref(db, `users/${userId}/${itemPath}`);
    await timeoutAsyncFunction(() => remove(pathRef));
    result = 'success';
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
