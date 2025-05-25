import { useEffect, useState } from 'react';
import type { Space } from '../lib';
import { useSpace } from '../store';
import useURL from './useURL';

export default function useInitSpace() {
  const { setSpace } = useSpace();
  const { spaceId: urlSpaceId } = useURL();
  const [showLoadScreen, setShowLoadScreen] = useState(true);

  useEffect(() => {
    if (!urlSpaceId) {
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
        document.title = `Akyl - ${space.title}`;
      }
    }
  }, [urlSpaceId, setSpace]);

  return { showLoadScreen };
}
