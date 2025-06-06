import { FirebaseError } from 'firebase/app';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config';

export default async function authWithGoogle() {
  let result = null,
    error = null;
  try {
    result = await signInWithPopup(auth, googleProvider);

    if (!result.user.emailVerified) {
      document.location = '/verify-email';
    }
  } catch (e) {
    error = e as FirebaseError;
    console.error('error auth with Google', error);
  }

  return { result, error };
}
