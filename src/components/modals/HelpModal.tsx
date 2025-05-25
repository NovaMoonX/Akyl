import { CopyIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';
import { SUPPORT_EMAIL } from '../../lib';
import Modal from '../ui/Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Help & Support'>
      <div className='flex flex-col gap-4'>
        <p className='text-base'>
          Need help or have questions? Reach out to our support team and we'll
          get back to you as soon as possible.
        </p>
        <div className='bg-surface-light dark:bg-surface-dark flex items-center gap-2 rounded px-3 py-2'>
          <MailIcon size={18} className='text-emerald-500' />
          <span className='font-mono text-sm select-all'>{SUPPORT_EMAIL}</span>
          <button
            onClick={handleCopy}
            className='ml-2 rounded p-1 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900'
            aria-label='Copy email address'
            type='button'
          >
            <CopyIcon size={16} />
          </button>
          {copied && (
            <span className='ml-2 text-xs text-emerald-600'>Copied!</span>
          )}
        </div>
        <div className='flex justify-end'>
          <button onClick={onClose} className='btn btn-secondary'>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
