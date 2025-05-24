import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { createNewSpace } from '../lib';
import { useSpace } from '../store';
import useURL from './useURL';

export default function useInitSpace() {
  const createdNewSpace = useRef(false);
  const spaceId = useSpace(useShallow((state) => state.space.id));
  const { spaceId: urlSpaceId } = useURL();

  useEffect(() => {
    // Create new space if no spaceId is found in the URL
    if (!urlSpaceId && !createdNewSpace.current) {
      createdNewSpace.current = true;
      createNewSpace();
    }
    // If spaceId in the URL is different from the current spaceId, fetch from local storage
    else if (urlSpaceId && spaceId && urlSpaceId !== spaceId) {
      // TODO: fetch space by id
      console.log('URL spaceId is different from current spaceId'); // REMOVE
    }
  }, [spaceId, urlSpaceId]);
}
