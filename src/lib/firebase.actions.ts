import { readDatabase, updateDatabase } from '../firebase';
import { decryptData, encryptData } from './crypt.actions';
import { ALL_SPACES_LAST_SYNC_KEY } from './firebase.constants';
import type { EncryptionObjectWithMetadata } from './firebase.types';
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
  const dataWithMeta: EncryptionObjectWithMetadata = {
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
    localStorage.setItem(ALL_SPACES_LAST_SYNC_KEY, String(timestamp));
    await updateDatabase({
      data: timestamp,
      userId,
      itemPath: `${ALL_SPACES_LAST_SYNC_KEY}`,
    });
  }
}

export async function fetchSpace({
  spaceId,
  userId,
  cryptoKey,
}: {
  spaceId: string;
  userId?: string;
  cryptoKey?: CryptoKey | null;
}) {
  if (!cryptoKey) {
    throw new Error('cryptoKey is required to read database');
  }

  const spaceReadResponse = await readDatabase<EncryptionObjectWithMetadata>({
    itemPath: spaceId,
    userId,
  });

  if (spaceReadResponse.error) {
    throw spaceReadResponse.error;
  }

  if (!spaceReadResponse.result) {
    console.warn('No data found for space:', spaceId);
    return;
  }

  if (!spaceReadResponse.result.encryptedData || !spaceReadResponse.result.iv) {
    console.warn('Incomplete encrypted data for space:', spaceId);
    return;
  }

  const { encryptedData, iv } = spaceReadResponse.result;
  const decryptedData = await decryptData(encryptedData, cryptoKey, iv);
  const decryptedSpace = decryptedData as Space;

  const metaTitle = spaceReadResponse?.result?.metadata?.title;
  const space: Space = {
    ...decryptedSpace,
    title: metaTitle || decryptedSpace.title || '',
  };

  return space;
}
