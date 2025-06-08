import { FirebaseError } from 'firebase/app';
import { signOut } from 'firebase/auth';
import { postSignOutProcess } from '../../lib';
import { auth } from '../config';

export default async function signOutUser(redirect = true) {
  let result = null,
    error = null;

  try {
    result = await signOut(auth);
    postSignOutProcess(redirect);
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
