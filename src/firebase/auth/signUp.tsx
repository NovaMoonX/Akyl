import { FirebaseError } from 'firebase/app';
import {
  type User,
  type UserCredential,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { timeoutAsyncFunction } from '../../utils';
import { auth } from '../config';

export default async function signUp(email: string, password: string) {
  let result: UserCredential | null = null,
    error = null;

  try {
    result = await createUserWithEmailAndPassword(auth, email, password);
    await timeoutAsyncFunction(() =>
      sendEmailVerification(result?.user as User),
    );
  } catch (e) {
    error = e as FirebaseError;
  }

  return { result, error };
}
