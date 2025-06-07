import { onValue, ref } from 'firebase/database';
import { db } from '../config';

interface UseLastCloudSyncParams {
  spaceId: string;
  testing?: boolean;
  userId?: string;
  onChange?: (lastSync: number) => void;
}
export default function listenForChanges({
  spaceId,
  testing = false,
  userId,
  onChange,
}: UseLastCloudSyncParams) {
  const path = testing ? 'test' : 'users';
  const userSegment = testing ? 'test_user' : userId;

  if (!userSegment) {
    return;
  }

  const spaceUpdateAtRef = ref(
    db,
    `${path}/${userSegment}/${spaceId}/metadata/updatedAt`,
  );

  console.log('Listening for changes in ', spaceId); // REMOVE
  return onValue(spaceUpdateAtRef, (snapshot) => {
    const data = snapshot.val();
    onChange?.(Number(data));
  });
}
