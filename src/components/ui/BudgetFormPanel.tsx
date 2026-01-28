import { XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { join } from '../../utils';

interface BudgetFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function BudgetFormPanel({
  isOpen,
  onClose,
  children,
  title,
}: BudgetFormPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus first input after animation completes
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const firstInput = panelRef.current?.querySelector('input[type="text"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 400); // Wait for animation to complete

    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={join(
          'fixed inset-0 z-40 bg-black/30 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Side panel */}
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? 'panel-title' : undefined}
        aria-label={!title ? 'Budget form' : undefined}
        className={join(
          'fixed right-0 top-0 z-50 h-full w-full max-w-lg transform transition-transform duration-300 ease-in-out',
          'bg-surface-light dark:bg-surface-dark shadow-2xl',
          'flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
          {title && <h2 id='panel-title' className='text-xl font-semibold'>{title}</h2>}
          {!title && <div />}
          <button
            onClick={onClose}
            className='rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
            aria-label='Close panel'
          >
            <XIcon className='size-5' />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className='flex-1 overflow-y-auto px-6 py-6'>
          {children}
        </div>
      </div>
    </>
  );
}
