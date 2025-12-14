import { useEffect, useState } from 'react';
import { createDemoSpace, type Space } from '../lib';
import { useSpace } from '../store';
import useURL from './useURL';
import { isFirebaseChannel, setTabTitle } from '../utils';

export default function useInitSpace() {
  const { setSpace } = useSpace();
  const { spaceId: urlSpaceId } = useURL();
  const [showLoadScreen, setShowLoadScreen] = useState(true);

  useEffect(() => {
    if (!urlSpaceId) {
      // Check if we're on a Firebase channel and should create a demo space
      if (isFirebaseChannel()) {
        // Check if any spaces exist in localStorage
        const hasExistingSpaces = Object.keys(localStorage).some(key => 
          key.startsWith('space_')
        );
        
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
      const space = JSON.parse(fetchedSpace);
      setSpace(space);
      setShowLoadScreen(false);

      if (space.title) {
        setTabTitle(space.title);
      }
    }
  }, [urlSpaceId, setSpace]);

  return { showLoadScreen };
}
