import { useEffect, useRef, useState } from 'react';
import { type Space } from '../lib';

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
          if (!value) continue;
          const parsed = JSON.parse(value) as Space;
          // Check for required Space properties
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            typeof parsed.id === 'string' &&
            typeof parsed.title === 'string' &&
            parsed.metadata &&
            parsed.config &&
            parsed.metadata?.createdBy === '' &&
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
        setSpaces(foundSpaces);
      }
    };

    fetchSpaces();
    const interval = setInterval(fetchSpaces, 5000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  // FUTURE: apply limit — `limitMet: spaces.length >= APP_SPACE_LIMIT`
  return { spaces, limitMet: false };
}
