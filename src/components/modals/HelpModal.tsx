import { CopyIcon, KeyboardIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';
import { SUPPORT_EMAIL } from '../../lib';
import Modal from '../ui/Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Keyboard shortcut information
const KEYBOARD_SHORTCUTS = [
  { keys: 'Ctrl+I', description: 'Add new income' },
  { keys: 'Ctrl+E', description: 'Add new expense' },
  { keys: 'Ctrl+S', description: 'Toggle sources visibility' },
  { keys: 'Ctrl+C', description: 'Toggle categories visibility' },
  { keys: 'Ctrl+L', description: 'Toggle list expenses' },
  { keys: 'Ctrl+T', description: 'Toggle table/grid view' },
  { keys: 'Ctrl+K', description: 'Open calculator' },
  { keys: 'Ctrl+←', description: 'Previous sheet/space' },
  { keys: 'Ctrl+→', description: 'Next sheet/space' },
];

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'support' | 'tips'>('support');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Help & Support'>
      <div className='flex flex-col gap-4'>
        {/* Tab Navigation */}
        <div className='flex gap-2 border-b border-gray-200 dark:border-gray-700'>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'support'
                ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <MailIcon className='inline-block size-4 mr-1' />
            Support
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'tips'
                ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <KeyboardIcon className='inline-block size-4 mr-1' />
            Tips & Shortcuts
          </button>
        </div>

        {/* Support Tab */}
        {activeTab === 'support' && (
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
          </div>
        )}

        {/* Tips & Shortcuts Tab */}
        {activeTab === 'tips' && (
          <div className='flex flex-col gap-4'>
            <div>
              <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2'>
                Keyboard Shortcuts
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                Use these keyboard shortcuts to work faster:
              </p>
              <div className='space-y-2'>
                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  >
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      {shortcut.description}
                    </span>
                    <kbd className='bg-surface-hover-light dark:bg-surface-hover-dark px-2 py-1 rounded text-xs font-mono border border-gray-300 dark:border-gray-600'>
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
            <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3'>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                💡 <strong>Tip:</strong> On Mac, Ctrl is replaced with ⌘ (Command) key.
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className='flex justify-end'>
          <button onClick={onClose} className='btn btn-secondary'>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
