import { LOCAL_STORAGE_USER_ID } from './app.constants';
import type { Space } from './space.types';

export function postSignOutProcess(redirect = true) {
  const userId = localStorage.getItem(LOCAL_STORAGE_USER_ID);
  if (!userId) return;

  // Remove all spaces from local storage
  Object.entries(localStorage).forEach(([key, value]) => {
    const valueAsSpace = JSON.parse(value ?? '{}') as Space;
    if (valueAsSpace?.metadata?.createdBy === userId) {
      localStorage.removeItem(key);
    }
  });

  // Take the user to home page
  const isHome = window.location.pathname === '/';
  if (!isHome && redirect) {
    window.location.href = '/';
  }
}
