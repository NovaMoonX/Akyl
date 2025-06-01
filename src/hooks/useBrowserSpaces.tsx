import { useEffect, useRef, useState } from 'react';
import type { Space } from '../lib';

/**
 * Custom hook to fetch and manage browser-stored spaces from localStorage.
 * It retrieves all items from localStorage, checks if they conform to the Space interface,
 * and updates the state with valid spaces.
 *
 * @returns {Space[]} An object containing the array of spaces.
 */
export default function useBrowserSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchSpaces = () => {
      const foundSpaces: Space[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        try {
          const value = localStorage.getItem(key);
          console.log('value', value); // REMOVE
          if (!value) continue;
          const parsed = JSON.parse(value);
          // Check for required Space properties
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            typeof parsed.id === 'string' &&
            typeof parsed.title === 'string' &&
            parsed.metadata &&
            parsed.config &&
            Array.isArray(parsed.incomes) &&
            Array.isArray(parsed.expenses)
          ) {
            foundSpaces.push(parsed as Space);
          }
        } catch {
          // Ignore non-JSON or non-Space entries
        }
      }
      if (isMounted.current) {
        // Sort spaces by updatedAt and title
        const sortedSpaces = foundSpaces.sort((a, b) => {
          const aUpdated = a.metadata?.updatedAt ?? 0;
          const bUpdated = b.metadata?.updatedAt ?? 0;
          if (bUpdated !== aUpdated) {
            return bUpdated - aUpdated;
          }
          return a.title.localeCompare(b.title);
        });
        setSpaces(sortedSpaces);
      }
    };

    fetchSpaces();
    const interval = setInterval(fetchSpaces, 5000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  console.log('spaces', spaces); // REMOVE
  return { spaces, limitMet: spaces.length >= 3 };
}
