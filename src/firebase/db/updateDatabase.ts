import { FirebaseError } from '@firebase/util';
import { ref, set } from 'firebase/database';
import type { Space } from '../../lib';
import { timeoutAsyncFunction } from '../../utils';
import { db } from '../config';

interface UpdateDatabaseParams {
  space: Space;
  testing?: boolean;
  userId?: string;
}

export default async function updateDatabase({
  space,
  userId,
  testing = false,
}: UpdateDatabaseParams) {
  let result = null,
    error = null;

  const path = testing ? 'test' : 'users';
  const userSegment = testing ? 'test_user' : userId;

  if (!userSegment) {
    return;
  }

  const { id } = space;

  try {
    const pathRef = ref(db, `${path}/${userSegment}/${id}`);
    await timeoutAsyncFunction(() => set(pathRef, space));
    result = 'success';
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
