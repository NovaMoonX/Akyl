import { FirebaseError } from 'firebase/app';
import { type UserCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { LOCAL_STORAGE_USER_ID } from '../../lib/app.constants';
import { auth } from '../config';

export default async function logIn(email: string, password: string) {
  let result: UserCredential | null = null,
    error = null;
  try {
    console.log('signing in'); // REMOVE
    result = await signInWithEmailAndPassword(auth, email, password);
    console.log('signed in', result); // REMOVE
    localStorage.setItem(LOCAL_STORAGE_USER_ID, result.user.uid);

    if (!result.user.emailVerified) {
      error = new FirebaseError(
        'auth/email-not-verified',
        'Email not verified',
      );
    }
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
