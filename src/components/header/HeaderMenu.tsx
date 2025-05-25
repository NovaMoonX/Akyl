import {
  CopyPlusIcon,
  FolderIcon,
  HomeIcon,
  MenuIcon,
  SaveIcon,
  SettingsIcon,
  ShieldQuestionIcon,
  SquarePlusIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createNewSpace, importFile } from '../../lib';
import ConfigModal from '../modals/ConfigModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import DuplicateSpaceModal from '../modals/DuplicateSpaceModal';
import HelpModal from '../modals/HelpModal';
import SaveModal from '../modals/SaveModal';
import ThemeToggle from '../ui/ThemeToggle';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
}

const items: MenuItem[] = [
  {
    icon: <HomeIcon />,
    label: 'Home',
  },
  {
    icon: <SquarePlusIcon />,
    label: 'New Space',
  },
  {
    icon: <FolderIcon />,
    label: 'Open',
  },
  {
    icon: <SaveIcon />,
    label: 'Save',
  },
  {
    icon: <CopyPlusIcon />,
    label: 'Duplicate',
  },
  {
    icon: <ShieldQuestionIcon />,
    label: 'Help',
  },
  {
    icon: <SettingsIcon />,
    label: 'Configurations',
  },
  // {
  //   icon: <LogInIcon />,
  //   label: 'Login',
  // },
];

export default function HeaderMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title?: string;
    message: string;
    onConfirm: () => void;
  }>();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMenuItemClick = (label: string) => {
    switch (label) {
      case 'Home':
        setConfirmation({
          message:
            'Any unsaved changes will be lost once you head back to the home screen.',
          onConfirm: () => (window.location.href = '/'),
        });
        break;
      case 'New Space':
        setConfirmation({
          title: 'Create New Space',
          message:
            'Any unsaved changes will be lost. Are you sure you want to create a new space?',
          onConfirm: createNewSpace,
        });
        break;
      case 'Open':
        importFile();
        break;
      case 'Save':
        setIsSaveModalOpen(true);
        break;
      case 'Duplicate':
        setIsDuplicateModalOpen(true);
        break;
      case 'Help':
        setIsHelpModalOpen(true);
        break;
      case 'Configurations':
        setIsConfigModalOpen(true);
        break;
      default:
        break;
    }
    setIsMenuOpen(false);
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleMouseAction = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    const handlePointerAction = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Mouse events for actions that are NOT part of the grid
    document.addEventListener('mousedown', handleMouseAction);
    // Pointer events for actions that are part of the grid
    document.addEventListener('pointerdown', handlePointerAction);

    return () => {
      document.removeEventListener('mousedown', handleMouseAction);
      document.removeEventListener('pointerdown', handlePointerAction);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className='bg-surface-light dark:bg-surface-dark hover:bg-surface-hover-light hover:dark:bg-surface-hover-dark rounded-lg px-4 py-5 text-teal-500 shadow-md'
      >
        <MenuIcon />
      </button>

      {isMenuOpen && (
        <div
          ref={dropdownRef}
          className='animate-slide-down bg-surface-light dark:bg-surface-dark absolute top-full left-0 mt-2 w-48 origin-top transform rounded-md py-1 shadow-lg transition-transform duration-1000 ease-out'
        >
          {items.map((item, index) => {
            const Icon = (item.icon as React.ReactElement).type;
            return (
              <button
                key={index}
                onClick={() => {
                  handleMenuItemClick(item.label);
                }}
                className='hover:bg-surface-hover-light hover:dark:bg-surface-hover-dark flex w-full flex-row items-center gap-1 px-4 py-2 text-left text-gray-500 hover:text-gray-900 hover:dark:text-gray-100'
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
          <div className='h-0.5 w-full bg-gray-200 dark:bg-gray-700' />
          <div className='flex items-center justify-between py-1 pr-3 pl-4'>
            <p className='opacity-80'>Theme</p>
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* All Modals for Menu Actions */}
      {confirmation?.message && (
        <ConfirmationModal
          isOpen={Boolean(confirmation?.message)}
          message={confirmation.message}
          title={confirmation.title}
          onConfirm={() => {
            confirmation.onConfirm();
            setConfirmation(undefined);
          }}
          onCancel={() => setConfirmation(undefined)}
          onClose={() => setConfirmation(undefined)}
        />
      )}

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />

      <DuplicateSpaceModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
}
