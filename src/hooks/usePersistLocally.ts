import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Space } from '../lib';
import { useSpace } from '../store';
import useURL from './useURL';

export default function usePersistLocally() {
  const { space } = useSpace();
  const { spaceId: urlSpaceId } = useURL();
  const { theme } = useTheme();

  useEffect(() => {
    // Only save when both spaceId and urlSpaceId are present
    if (!urlSpaceId || !space?.id) {
      return;
    }
    // Only save when spaceId and urlSpaceId match
    if (urlSpaceId !== space.id) {
      return;
    }

    const spaceToSave: Space = {
      ...space,
      config: {
        ...space.config,
        theme,
      },
    };
    localStorage.setItem(space.id, JSON.stringify(spaceToSave));
  }, [space, urlSpaceId, theme]);
}
