import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../contexts/AuthContext';
import { listenForChanges } from '../firebase';
import { useSpace } from '../store';
import useURL from './useURL';

export default function useLastCloudSync() {
  const { currentUser } = useAuth();
  const spaceId = useSpace(useShallow((state) => state?.space?.id));
  const { spaceId: urlSpaceId } = useURL();
  const [lastSpaceSync, setLastSpaceSync] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    // Only save when both spaceId and urlSpaceId are present
    if (!urlSpaceId || !spaceId) {
      return;
    }
    // Only save when spaceId and urlSpaceId match
    if (urlSpaceId !== spaceId) {
      return;
    }

    // TASK: remove testing flag
    const unsubscribe = listenForChanges({
      spaceId,
      userId: currentUser.uid,
      testing: true,
      onChange: setLastSpaceSync,
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, spaceId, urlSpaceId]);

  return { lastSpaceSync };
}
