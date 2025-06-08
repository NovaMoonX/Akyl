import { onValue, ref } from 'firebase/database';
import { db } from '../config';

interface UseListenForChangesParams {
  itemPath: string;
  testing?: boolean;
  userId?: string;
  onChange?: (lastSync: number) => void;
}

export default function listenForChanges({
  itemPath,
  testing = false,
  userId,
  onChange,
}: UseListenForChangesParams) {
  const path = testing ? 'test' : 'users';
  const userSegment = testing ? 'test_user' : userId;

  if (!userSegment) {
    return;
  }

  const spaceUpdateAtRef = ref(db, `${path}/${userSegment}/${itemPath}`);

  return onValue(spaceUpdateAtRef, (snapshot) => {
    const data = snapshot.val();
    console.log('onChange', data); // REMOVE
    onChange?.(Number(data));
  });
}
