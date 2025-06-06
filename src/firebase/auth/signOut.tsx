import { FirebaseError } from 'firebase/app';
import { signOut } from 'firebase/auth';
import { auth } from '../config';

export default async function signOutUser() {
  let result = null,
    error = null;
  try {
    result = await signOut(auth);
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
