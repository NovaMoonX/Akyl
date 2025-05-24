import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import type { Space } from '../lib';
import { useSpace } from '../store';
import useURL from './useURL';

export default function useInitSpace() {
  const { setSpace } = useSpace();
  const { spaceId: urlSpaceId } = useURL();
  const [showLoadScreen, setShowLoadScreen] = useState(true);
  const spaceId = useSpace(useShallow((state) => state.space.id));

  useEffect(() => {
    if (!urlSpaceId) {
      setSpace({} as Space);
      return;
    }

    const fetchedSpace = localStorage.getItem(urlSpaceId);
    if (urlSpaceId && !fetchedSpace) {
      window.location.href = '/';
      setSpace({} as Space);
      return;
    }

    if (urlSpaceId && fetchedSpace) {
      const space = JSON.parse(fetchedSpace);
      setSpace(space);
      setShowLoadScreen(false);
    }
  }, [spaceId, urlSpaceId, setSpace]);

  return { showLoadScreen };
}
