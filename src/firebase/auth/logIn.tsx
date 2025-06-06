import { FirebaseError } from 'firebase/app';
import { type UserCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config';

export default async function logIn(email: string, password: string) {
  let result: UserCredential | null = null,
    error = null;
  try {
    result = await signInWithEmailAndPassword(auth, email, password);

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
