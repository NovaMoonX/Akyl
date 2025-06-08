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

async function processedEncryptedSpace(
  spaceData: EncryptionObjectWithMetadata,
  cryptoKey: CryptoKey,
  id: string,
): Promise<Space | undefined> {
  if (!spaceData.encryptedData || !spaceData.iv) {
    console.warn('Incomplete encrypted data for space:', id);
    return;
  }

  const { encryptedData, iv } = spaceData;
  const decryptedData = await decryptData(encryptedData, cryptoKey, iv);
  const decryptedSpace = decryptedData as Space;

  const metaTitle = spaceData?.metadata?.title;
  const space: Space = {
    ...decryptedSpace,
    title: metaTitle || decryptedSpace.title || '',
  };

  return space;
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

  const processedSpace = await processedEncryptedSpace(
    spaceReadResponse.result,
    cryptoKey,
    spaceId,
  );
  return processedSpace;
}

export async function fetchAllSpacesAndUploadToLocalStorage({
  userId,
  cryptoKey,
}: {
  userId?: string;
  cryptoKey?: CryptoKey | null;
}) {
  if (!cryptoKey) {
    throw new Error('cryptoKey is required to read database for all spaces');
  }

  // Fetch all space IDs (assuming a function or a way to list all space IDs exists)
  // You may need to implement or adjust this part based on your DB structure
  const allSpacesResponse = await readDatabase<{
    [key: string]: EncryptionObjectWithMetadata;
  }>({
    itemPath: '',
    userId,
  });

  if (allSpacesResponse.error) {
    throw allSpacesResponse.error;
  }

  if (!allSpacesResponse.result) {
    console.warn('No spaces found for user:', userId);
    return;
  }

  const allSpaces: Space[] = [];

  const spacePromises = Object.entries(allSpacesResponse.result).map(
    async ([spaceId, spaceData]) => {
      if (spaceId === ALL_SPACES_LAST_SYNC_KEY) {
        // Skip the last sync key
        return null;
      }
      const processedSpace = await processedEncryptedSpace(
        spaceData,
        cryptoKey,
        spaceId,
      );
      if (!processedSpace) {
        console.warn('Failed to process space:', spaceId);
        return null;
      }
      localStorage.setItem(spaceId, JSON.stringify(processedSpace));
      return processedSpace;
    },
  );

  const resolvedSpaces = await Promise.all(spacePromises);
  allSpaces.push(...resolvedSpaces.filter((space) => space !== null));

  console.log('allSpaces', allSpaces); // REMOVE
  localStorage.setItem(ALL_SPACES_LAST_SYNC_KEY, String(Date.now()));
  return allSpaces;
}
