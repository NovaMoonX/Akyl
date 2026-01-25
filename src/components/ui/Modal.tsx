import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { join } from '../../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentOnly?: boolean;
  centerTitle?: boolean;
  hideCloseButton?: boolean;
  onEnter?: () => void; // Optional handler for Enter key
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  contentOnly = false,
  centerTitle = false,
  hideCloseButton = false,
  onEnter,
}: ModalProps) {
  // Handle Escape and Enter key presses
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'Enter' && onEnter) {
        event.preventDefault();
        onEnter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onEnter]);

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
        <div
          role='dialog'
          aria-modal={true}
          aria-labelledby={title ? 'modal-title' : undefined}
          className='fixed inset-0 z-50 overflow-y-auto'
        >
          <div className='flex min-h-dvh items-center justify-center p-2 sm:p-4'>
            <div
              className='bg-opacity-25 bg-background-light/50 dark:bg-background-dark/50 fixed inset-0 transition-opacity'
              onClick={onClose}
            />
            <div
              className={join(
                'bg-surface-light dark:bg-surface-dark relative w-full max-w-xl transform rounded-lg p-6 shadow-xl transition-all',
                contentOnly && '!bg-transparent !shadow-none',
              )}
            >
              {!contentOnly && (title || !hideCloseButton) && (
                <div className='mb-4 flex items-center justify-between'>
                  {title && (
                    <h1
                      className={join(
                        'w-full text-xl',
                        centerTitle && 'text-center',
                      )}
                    >
                      {title}
                    </h1>
                  )}
                  {!hideCloseButton && (
                    <button
                      onClick={onClose}
                      className='rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
                    >
                      <X className='size-5 text-gray-500 2xl:size-6 dark:text-gray-400' />
                    </button>
                  )}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
