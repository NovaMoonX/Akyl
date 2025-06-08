import { updateDatabase } from '../firebase';
import { encryptData } from './crypt.actions';
import { ALL_SPACES_LAST_SYNC_KEY } from './firebase.constants';
import type { Space } from './space.types';

export async function syncSpace({
  space,
  cryptoKey,
  userId,
}: {
  space: Space;
  cryptoKey?: CryptoKey | null;
  userId?: string;
}) {
  if (!cryptoKey) {
    throw new Error('cryptoKey is required to update database');
  }

  const timestamp = space?.metadata?.updatedAt || Date.now();

  const encryptedData = await encryptData(space, cryptoKey);
  const dataWithMeta = {
    ...encryptedData,
    metadata: {
      updatedAt: timestamp,
      title: space.title || '',
    },
  };

  const spaceUpdateResponse = await updateDatabase({
    data: dataWithMeta,
    userId,
    itemPath: `${space.id}`,
  });

  if (spaceUpdateResponse.error) {
    throw spaceUpdateResponse.error;
  }

  if (spaceUpdateResponse.result) {
    await updateDatabase({
      data: timestamp,
      userId,
      itemPath: `${ALL_SPACES_LAST_SYNC_KEY}`,
    });
  }
}
