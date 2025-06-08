import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listenForChanges } from '../firebase';
import {
  ALL_SPACES_LAST_SYNC_KEY,
  fetchAllSpacesAndUploadToLocalStorage,
  type Space,
} from '../lib';
import useURL from './useURL';

export default function useSyncAllSpaces() {
  const { currentUser, cryptoKey } = useAuth();
  const { spaceId: urlSpaceId } = useURL();
  const [spaces, setSpaces] = useState<Space[]>();

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    // Only fetch when at home since we sync individual spaces when they're open
    const isHome = window.location.pathname === '/';
    if (urlSpaceId || !isHome) {
      return;
    }

    const handleFetchAllSpaces = async (lastSync: number) => {
      const localLastSyncItem = localStorage.getItem(ALL_SPACES_LAST_SYNC_KEY);
      const localLastSync = localLastSyncItem ? Number(localLastSyncItem) : 0;

      if (localLastSync >= lastSync) {
        return;
      }

      const fetchedSpaces = await fetchAllSpacesAndUploadToLocalStorage({
        userId: currentUser.uid,
        cryptoKey,
      });
      setSpaces(fetchedSpaces);
    };

    const unsubscribe = listenForChanges({
      itemPath: `${ALL_SPACES_LAST_SYNC_KEY}`,
      userId: currentUser.uid,
      onChange: handleFetchAllSpaces,
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, urlSpaceId, cryptoKey]);

  const spacesMap = useMemo(() => {
    return (spaces ?? []).reduce<Record<string, Space>>((map, space) => {
      map[space.id] = space;
      return map;
    }, {});
  }, [spaces]);

  return { spaces: spaces ?? [], spacesMap };
}
