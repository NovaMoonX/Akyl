import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../store';
import useURL from './useURL';

export default function useInitSpace() {
  const [showLoadScreen, setShowLoadScreen] = useState(false);
  const spaceId = useSpace(useShallow((state) => state.space.id));
  const { spaceId: urlSpaceId } = useURL();

  useEffect(() => {
    if (!urlSpaceId) {
      setShowLoadScreen(true);
    }
    if (urlSpaceId && !localStorage.getItem(urlSpaceId)) {
      window.location.href = '/';
      setShowLoadScreen(true);
    }
  }, [spaceId, urlSpaceId]);

  return { showLoadScreen };
}
