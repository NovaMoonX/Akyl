import { useEffect, useState } from 'react';
import AuthForm from '../forms/AuthForm';
import Modal from '../ui/Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailVerificationNotice, setShowEmailVerificationNotice] =
    useState(false);

  const handleAuthSuccess = () => {
    if (!isLogin) {
      setShowEmailVerificationNotice(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true);
      setShowEmailVerificationNotice(false);
    }
  }, [isOpen, setIsLogin, setShowEmailVerificationNotice]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        showEmailVerificationNotice ? undefined : isLogin ? 'Log In' : 'Sign Up'
      }
      centerTitle={true}
      hideCloseButton={showEmailVerificationNotice}
    >
      {showEmailVerificationNotice && (
        <div className='flex flex-col items-center gap-4 p-4'>
          <h2 className='text-lg font-semibold'>Verification Email Sent 📬</h2>
          <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
            Thank you for signing up! Before you log in and start using Akyl,
            please verify your email address. If you don't see the email in your
            inbox, please check your spam folder.
          </p>
          <button
            className='bg-inflow hover:bg-inflow-darker dark:bg-inflow hover:dark:bg-inflow mt-4 rounded-md px-4 py-2 text-white'
            onClick={onClose}
          >
            Close
          </button>
        </div>
      )}
      {!showEmailVerificationNotice && (
        <div className='flex flex-col gap-4'>
          {/* Google Auth Button */}
          <button
            className='flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800'
            // onClick={handleGoogleAuth} // TODO: implement auth logic
            type='button'
          >
            <svg className='h-5 w-5' viewBox='0 0 48 48'>
              <g>
                <path
                  fill='#4285F4'
                  d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.13 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.36 13.13 17.74 9.5 24 9.5z'
                />
                <path
                  fill='#34A853'
                  d='M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.2 5.6C43.98 37.13 46.1 31.36 46.1 24.55z'
                />
                <path
                  fill='#FBBC05'
                  d='M10.67 28.65A14.5 14.5 0 0 1 9.5 24c0-1.62.28-3.19.77-4.65l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.87.92 7.54 2.54 10.85l8.13-6.2z'
                />
                <path
                  fill='#EA4335'
                  d='M24 48c6.13 0 11.27-2.03 15.03-5.53l-7.2-5.6c-2.01 1.35-4.59 2.15-7.83 2.15-6.26 0-11.64-3.63-13.33-8.85l-8.13 6.2C6.73 42.52 14.82 48 24 48z'
                />
                <path fill='none' d='M0 0h48v48H0z' />
              </g>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className='flex items-center gap-2 pt-2'>
            <div className='h-px flex-1 bg-gray-200 dark:bg-gray-700' />
            <span className='text-xs text-gray-400'>or</span>
            <div className='h-px flex-1 bg-gray-200 dark:bg-gray-700' />
          </div>

          <AuthForm isLogin={isLogin} onSuccess={handleAuthSuccess} />

          {/* Switch State */}
          <div className='mt-2 flex justify-center'>
            <button
              type='button'
              className='text-inflow-darker dark:text-inflow text-sm hover:underline'
              onClick={() => setIsLogin((v) => !v)}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Log In'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
