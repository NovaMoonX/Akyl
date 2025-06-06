import { useEffect, useState } from 'react';
import { logIn, signUp } from '../../firebase';

interface AuthModalProps {
  isLogin: boolean;
  onSuccess: () => void;
}

interface AuthModalFormState {
  email: string;
  password: string;
  confirmPassword?: string;
  errorMessage?: string;
}

export default function AuthForm({ isLogin, onSuccess }: AuthModalProps) {
  const [formState, setFormState] = useState<AuthModalFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    errorMessage: '',
  });

  const resetFormState = () => {
    setFormState({
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
    });
  };

  const handleAuth = (email: string, password: string) => {
    if (isLogin) {
      return logIn(email, password);
    }

    return signUp(email, password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password, confirmPassword } = formState;

    if (!email || !password || (!isLogin && !confirmPassword)) {
      setFormState((prev) => ({
        ...prev,
        errorMessage: 'Please fill in all fields.',
      }));
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setFormState((prev) => ({
        ...prev,
        errorMessage: 'Passwords do not match.',
      }));
      return;
    }

    const { result, error } = await handleAuth(email, password);
    if (error) {
      setFormState((prev) => ({
        ...prev,
        errorMessage: error.message,
      }));
      return;
    }

    if (result) {
      resetFormState();
      onSuccess();
    }
  };

  useEffect(() => {
    resetFormState();
  }, [isLogin]);

  return (
    <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
      <div>
        <label className='mb-1 block text-sm font-medium'>Email</label>
        <input
          type='email'
          className='dark:bg-surface-dark dark:text-surface-light w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          placeholder='you@email.com'
          required
          value={formState.email}
          onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>
      <div>
        <label className='mb-1 block text-sm font-medium'>Password</label>
        <input
          type='password'
          className='dark:bg-surface-dark dark:text-surface-light w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          placeholder='Password'
          required
          value={formState.password}
          onChange={e => setFormState(prev => ({ ...prev, password: e.target.value }))}
        />
      </div>
      {!isLogin && (
        <div>
          <label className='mb-1 block text-sm font-medium'>
            Confirm Password
          </label>
          <input
            type='password'
            className='dark:bg-surface-dark dark:text-surface-light w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
            placeholder='Confirm Password'
            required
            value={formState.confirmPassword}
            onChange={e => setFormState(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </div>
      )}

      {formState.errorMessage && (
        <small className='block text-center text-red-500'>
          {formState.errorMessage}
        </small>
      )}

      <button type='submit' className='btn btn-primary mt-2 w-full'>
        {isLogin ? 'Log In' : 'Sign Up'}
      </button>
    </form>
  );
}
