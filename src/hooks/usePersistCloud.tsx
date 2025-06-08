import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchSpace, syncSpace, type Space } from '../lib';
import { useSpace } from '../store';
import { setTabTitle } from '../utils';
import useLastSpaceCloudSync from './useLastSpaceCloudSync';
import useURL from './useURL';

const CLOUD_THROTTLE_TIME = 3000; // 3 seconds

export default function usePersistCloud() {
  const { currentUser, cryptoKey } = useAuth();
  const { lastSpaceSync } = useLastSpaceCloudSync();
  const { space, setSpace } = useSpace();
  const { spaceId: urlSpaceId } = useURL();

  // Update space from cloud if there are changes
  useEffect(() => {
    const spaceUpdatedAt = space?.metadata?.updatedAt;
    if (
      !currentUser?.uid ||
      !urlSpaceId ||
      !spaceUpdatedAt ||
      lastSpaceSync === null
    ) {
      return;
    }

    const areCloudChanges = lastSpaceSync > spaceUpdatedAt;
    if (!areCloudChanges) {
      return;
    }

    const readAndUpdate = async () => {
      const fetchedSpace = await fetchSpace({
        spaceId: space.id,
        userId: currentUser.uid,
        cryptoKey,
      });

      console.log('fetchedSpace', fetchedSpace); // REMOVE

      if (fetchedSpace) {
        const filledInSpace: Space = {
          ...fetchedSpace,
          title: fetchedSpace?.title || '',
          incomes: fetchedSpace?.incomes || [],
          expenses: fetchedSpace?.expenses || [],
        };
        setSpace(filledInSpace);
        const newTitle = filledInSpace?.title;
        setTabTitle(newTitle);
      }
    };

    readAndUpdate();
  }, [
    lastSpaceSync,
    space?.id,
    space?.metadata?.updatedAt,
    currentUser?.uid,
    setSpace,
    cryptoKey,
    urlSpaceId,
  ]);

  // Save space to cloud if there are local changes
  useEffect(() => {
    const spaceUpdatedAt = space?.metadata?.updatedAt;
    if (
      !currentUser?.uid ||
      !urlSpaceId ||
      lastSpaceSync === null ||
      !spaceUpdatedAt
    ) {
      return;
    }

    const areLocalChanges = spaceUpdatedAt > lastSpaceSync;
    if (!areLocalChanges) {
      return;
    }

    let timeout: NodeJS.Timeout;

    const saveChanges = async () => {
      syncSpace({
        space,
        cryptoKey,
        userId: currentUser.uid,
      }).then(() => {
        // Set createdBy metadata if it doesn't exist. It represents if the space is synced.
        const spaceCreatedBy = space?.metadata?.createdBy;
        if (!spaceCreatedBy) {
          setSpace({
            ...space,
            metadata: { ...space.metadata, createdBy: currentUser.uid },
          });
        }
      });
    };

    // Save changes once it has been CLOUD_THROTTLE_TIME since the last save
    if (Date.now() - lastSpaceSync < CLOUD_THROTTLE_TIME) {
      timeout = setTimeout(
        saveChanges,
        CLOUD_THROTTLE_TIME - (Date.now() - lastSpaceSync),
      );
    } else {
      saveChanges();
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [space, currentUser?.uid, urlSpaceId, lastSpaceSync, setSpace, cryptoKey]);
}
