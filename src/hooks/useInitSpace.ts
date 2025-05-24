import { useEffect, useRef } from 'react';
import { useSpace } from '../store';
import { useShallow } from 'zustand/shallow';
import { createNewSpace } from '../lib';

export default function useInitSpace() {
  const createdNewSpace = useRef(false);
  const spaceId = useSpace(useShallow((state) => state.space.id));

  useEffect(() => {
    if (!spaceId && !createdNewSpace.current) {
      createdNewSpace.current = true;
      createNewSpace();
    }
  }, [spaceId]);
}
