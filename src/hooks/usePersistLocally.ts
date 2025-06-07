import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Space } from '../lib';
import { useSpace } from '../store';
import useURL from './useURL';

const THROTTLE_TIME = 1000; // 1 second

export default function usePersistLocally() {
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
    };

    // Save changes once it has been THROTTLE_TIME since the last save
    if (Date.now() - lastSavedAt.current < THROTTLE_TIME) {
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
  }, [space, urlSpaceId, theme]);
}
