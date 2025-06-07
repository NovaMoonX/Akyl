import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { readDatabase, updateDatabase } from '../firebase';
import type { Space } from '../lib';
import { useSpace } from '../store';
import { setTabTitle } from '../utils';
import useLastCloudSync from './useLastCloudSync';
import useURL from './useURL';

const CLOUD_THROTTLE_TIME = 3000; // 3 seconds

export default function usePersistCloud() {
  const { currentUser } = useAuth();
  const { lastSpaceSync } = useLastCloudSync();
  const { space, setSpace } = useSpace();
  const { spaceId: urlSpaceId } = useURL();

  // Update space from cloud if there are changes
  useEffect(() => {
    const spaceUpdatedAt = space?.metadata?.updatedAt;
    if (!currentUser?.uid || !spaceUpdatedAt || lastSpaceSync === null) {
      return;
    }

    const areCloudChanges = lastSpaceSync > spaceUpdatedAt;
    if (!areCloudChanges) {
      return;
    }

    const readAndUpdate = async () => {
      const response = await readDatabase<Space>({
        spaceId: space.id,
        userId: currentUser.uid,
      });

      if (response?.result) {
        const fetchedSpace = response.result;
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

    const saveChanges = () => {
      updateDatabase({
        space,
        userId: currentUser.uid,
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
  }, [space, currentUser?.uid, urlSpaceId, lastSpaceSync]);
}
