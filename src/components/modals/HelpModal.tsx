import { CopyIcon, KeyboardIcon, MailIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SUPPORT_EMAIL } from '../../lib';
import Modal from '../ui/Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'support' | 'tips';
}

// Keyboard shortcut information
const KEYBOARD_SHORTCUTS = [
  { keys: 'Ctrl+I', description: 'Add new income', category: 'Actions' },
  { keys: 'Ctrl+E', description: 'Add new expense', category: 'Actions' },
  { keys: 'Ctrl+K', description: 'Open calculator', category: 'Actions' },
  { keys: 'Ctrl+Shift+S', description: 'Open keyboard shortcuts', category: 'Actions' },
  { keys: 'Ctrl+S', description: 'Toggle sources visibility', category: 'Display' },
  { keys: 'Ctrl+C', description: 'Toggle categories visibility', category: 'Display' },
  { keys: 'Ctrl+L', description: 'Toggle list expenses', category: 'Display' },
  { keys: 'Ctrl+T', description: 'Toggle table/grid view', category: 'Display' },
  { keys: 'Ctrl+0', description: 'Fit view to screen', category: 'View Controls' },
  { keys: 'Ctrl++', description: 'Zoom in', category: 'View Controls' },
  { keys: 'Ctrl+-', description: 'Zoom out', category: 'View Controls' },
  { keys: 'Ctrl+Shift+←', description: 'Previous sheet/space', category: 'Navigation' },
  { keys: 'Ctrl+Shift+→', description: 'Next sheet/space', category: 'Navigation' },
];

export default function HelpModal({ isOpen, onClose, initialTab = 'support' }: HelpModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'support' | 'tips'>(initialTab);

  // Update active tab when initialTab changes and modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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
              {/* Group shortcuts by category */}
              {['Actions', 'Display', 'View Controls', 'Navigation'].map((category) => {
                const categoryShortcuts = KEYBOARD_SHORTCUTS.filter(s => s.category === category);
                if (categoryShortcuts.length === 0) return null;
                
                return (
                  <div key={category} className='mb-4'>
                    <h4 className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2'>
                      {category}
                    </h4>
                    <div className='space-y-2'>
                      {categoryShortcuts.map((shortcut, index) => (
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
                );
              })}
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
