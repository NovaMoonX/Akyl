import { LOCAL_STORAGE_USER_ID } from './app.constants';
import { ALL_SPACES_LAST_SYNC_KEY } from './firebase.constants';
import type { Space } from './space.types';

export function postSignOutProcess(redirect = true) {
  const userId = localStorage.getItem(LOCAL_STORAGE_USER_ID);
  if (!userId) return;

  // Remove all spaces from local storage
  Object.entries(localStorage).forEach(([key, value]) => {
    try {
      const valueAsSpace = JSON.parse(value ?? '{}') as Space;
      if (valueAsSpace?.metadata?.createdBy === userId) {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore any errors in parsing, just skip this key
    }
  });

  // Remove all spaces last sync key
  localStorage.removeItem(ALL_SPACES_LAST_SYNC_KEY);

  // Take the user to home page
  const isHome = window.location.pathname === '/';
  if (!isHome && redirect) {
    window.location.href = '/';
  }
}
