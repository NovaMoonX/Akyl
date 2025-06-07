import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Space } from '../lib';
import { useSpace } from '../store';
import useURL from './useURL';
import { useAuth } from '../contexts/AuthContext';
import { updateDatabase } from '../firebase';

const THROTTLE_TIME = 1000; // 1 second

export default function usePersistLocally() {
  const { currentUser } = useAuth();
  const { space } = useSpace();
  const { spaceId: urlSpaceId } = useURL();
  const { theme } = useTheme();
  const lastSavedAt = useRef<number>(0);

  useEffect(() => {
    // Only save when both spaceId and urlSpaceId are present
    if (!urlSpaceId || !space?.id) {
      return;
    }
    // Only save when spaceId and urlSpaceId match
    if (urlSpaceId !== space.id) {
      return;
    }

    let timeout: NodeJS.Timeout;

    const spaceToSave: Space = {
      ...space,
      config: {
        ...space.config,
        theme,
      },
    };

    const saveChanges = () => {
      localStorage.setItem(urlSpaceId, JSON.stringify(spaceToSave));
      lastSavedAt.current = Date.now();

      if (currentUser) {
        // TASK: remove testing flag
        updateDatabase({ space: spaceToSave, userId: currentUser.uid, testing: true });
      }
    };

    // Save changes once it has been THROTTLE_TIME since the last save
    if (lastSavedAt.current - Date.now() < THROTTLE_TIME) {
      timeout = setTimeout(
        saveChanges,
        THROTTLE_TIME - (Date.now() - lastSavedAt.current),
      );
    } else {
      saveChanges();
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [space, urlSpaceId, theme, currentUser]);
}
