import {
  CopyPlusIcon,
  FolderIcon,
  MenuIcon,
  SaveIcon,
  SettingsIcon,
  ShieldQuestionIcon,
  SquarePlusIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createNewSpace } from '../../lib';
import ConfirmationModal from '../modals/ConfirmationModal';
import SaveModal from '../modals/SaveModal';
import ThemeToggle from '../ui/ThemeToggle';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
}

const items: MenuItem[] = [
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
];

export default function HeaderMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMenuItemClick = (label: string) => {
    switch (label) {
      case 'New Space':
        setIsConfirmationOpen(true);
        break;
      case 'Open':
        console.log('Open clicked');
        break;
      case 'Save':
        setIsSaveModalOpen(true);
        break;
      case 'Duplicate':
        console.log('Duplicate clicked');
        break;
      case 'Help':
        console.log('Help clicked');
        break;
      case 'Configurations':
        console.log('Config clicked');
        break;
      default:
        break;
    }
    setIsMenuOpen(false);
  };

  const handleConfirmationModalConfirm = () => {
    createNewSpace();
  };

  const handleSave = (name: string, continuous: boolean) => {
    // TODO: Implement save logic for the space using name and continuous
    // For now, just log the values
    console.log('Save Space:', name, 'Continuous:', continuous);
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

      {isConfirmationOpen && (
        <ConfirmationModal
          isOpen={true}
          message='Any unsaved changes will be lost. Are you sure you want to create a new space?'
          title='Create New Space'
          onConfirm={handleConfirmationModalConfirm}
          onCancel={() => setIsConfirmationOpen(false)}
          onClose={() => setIsConfirmationOpen(false)}
        />
      )}

      {isSaveModalOpen && (
        <SaveModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
