import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { readDatabase, updateDatabase } from '../firebase';
import type { Space } from '../lib';
import { useSpace } from '../store';
import { setTabTitle } from '../utils';
import useLastCloudSync from './useLastCloudSync';
import useURL from './useURL';

const CLOUD_THROTTLE_TIME = 1500; // 1.5 seconds

export default function usePersistCloud() {
  const { currentUser } = useAuth();
  const { lastSpaceSync } = useLastCloudSync();
  const { space, setSpace } = useSpace();
  const { spaceId: urlSpaceId } = useURL();

  // Update space from cloud if there are changes
  useEffect(() => {
    const spaceUpdatedAt = space?.metadata?.updatedAt;
    if (!currentUser?.uid || !spaceUpdatedAt || !lastSpaceSync) {
      return;
    }

    const areCloudChanges = lastSpaceSync > spaceUpdatedAt;
    if (!areCloudChanges) {
      return;
    }

    const readAndUpdate = async () => {
      // TASK: remove testing flag
      const response = await readDatabase<Space>({
        spaceId: space.id,
        userId: currentUser.uid,
        testing: true,
      });

      if (response?.result) {
        const fetchedSpace = response.result;
        setSpace(fetchedSpace);
        const newTitle = fetchedSpace?.title;
        setTabTitle(newTitle);      }
    };

    readAndUpdate();
  }, [lastSpaceSync, space, currentUser?.uid, setSpace]);

  // Save space to cloud if there are local changes
  useEffect(() => {
    const spaceUpdatedAt = space?.metadata?.updatedAt;
    if (!currentUser?.uid || !urlSpaceId || !lastSpaceSync || !spaceUpdatedAt) {
      return;
    }

    const areLocalChanges = spaceUpdatedAt > lastSpaceSync;
    if (!areLocalChanges) {
      return;
    }

    let timeout: NodeJS.Timeout;

    const saveChanges = () => {
      // TASK: remove testing flag
      updateDatabase({
        space,
        userId: currentUser.uid,
        testing: true,
      });
    };

    // Save changes once it has been CLOUD_THROTTLE_TIME since the last save
    if (lastSpaceSync - Date.now() < CLOUD_THROTTLE_TIME) {
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
