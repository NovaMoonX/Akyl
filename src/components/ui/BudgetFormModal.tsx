import { XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { join } from '../../utils';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function BudgetFormModal({
  isOpen,
  onClose,
  children,
  title,
}: BudgetFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close modal
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

  // Prevent body scroll when modal is open
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

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={join(
        'fixed inset-0 z-50 flex flex-col transform transition-transform duration-300 ease-in-out',
        'bg-surface-light dark:bg-surface-dark',
        isOpen ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
        {title && <h2 className='text-lg font-semibold'>{title}</h2>}
        {!title && <div />}
        <button
          onClick={onClose}
          className='rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
          aria-label='Close'
        >
          <XIcon className='size-5' />
        </button>
      </div>

      {/* Content - scrollable */}
      <div className='flex-1 overflow-y-auto px-4 py-4'>
        {children}
      </div>
    </div>
  );
}
