import { FirebaseError } from 'firebase/app';
import { signOut } from 'firebase/auth';
import { auth } from '../config';

export default async function signOutUser(redirect = true) {
  let result = null,
    error = null;
  try {
    result = await signOut(auth);

    const isHome = window.location.pathname === '/';
    if (!isHome && redirect) {
      window.location.href = '/';
    }
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
