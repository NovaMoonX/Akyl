import { useEffect, useState } from 'react';
import { createDemoSpace, type Space } from '../lib';
import { useSpace } from '../store';
import useURL from './useURL';
import { isFirebaseChannel, isValidSpace, setTabTitle, ensureDefaultSheet } from '../utils';

export default function useInitSpace() {
  const { setSpace } = useSpace();
  const { spaceId: urlSpaceId } = useURL();
  const [showLoadScreen, setShowLoadScreen] = useState(true);

  useEffect(() => {
    if (!urlSpaceId) {
      // Check if we're on a Firebase channel and should create a demo space
      if (isFirebaseChannel()) {
        // Check if any spaces exist in localStorage by trying to parse each item
        let hasExistingSpaces = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          try {
            const value = localStorage.getItem(key);
            if (!value) continue;
            const parsed = JSON.parse(value);
            // Check if it's a valid Space object
            if (isValidSpace(parsed)) {
              hasExistingSpaces = true;
              break;
            }
          } catch {
            // Ignore non-JSON or non-Space entries
          }
        }
        
        if (!hasExistingSpaces) {
          // Create demo space and redirect to it
          const demoSpace = createDemoSpace();
          localStorage.setItem(demoSpace.id, JSON.stringify(demoSpace));
          window.location.href = `/${demoSpace.id}`;
          return;
        }
      }
      
      setSpace({} as Space);
      document.title = 'Akyl';
      return;
    }

    const fetchedSpace = localStorage.getItem(urlSpaceId);
    if (urlSpaceId && !fetchedSpace) {
      window.location.href = '/';
      document.title = 'Akyl';
      setSpace({} as Space);
      return;
    }

    if (urlSpaceId && fetchedSpace) {
      const space = JSON.parse(fetchedSpace) as Space;
      
      // Ensure all budget items have at least one sheet
      const needsUpdate = ensureDefaultSheet(space);
      
      // Update localStorage if changes were made
      if (needsUpdate) {
        space.metadata.updatedAt = Date.now();
        localStorage.setItem(urlSpaceId, JSON.stringify(space));
      }
      
      setSpace(space);
      setShowLoadScreen(false);

      if (space.title) {
        setTabTitle(space.title);
      }
    }
  }, [urlSpaceId, setSpace]);

  return { showLoadScreen };
}
