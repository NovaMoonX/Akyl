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
import ThemeToggle from '../ui/ThemeToggle';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const items: MenuItem[] = [
  {
    icon: <SquarePlusIcon />,
    label: 'New Space',
    onClick: () => {
      console.log('Create New clicked');
    },
  },
  {
    icon: <FolderIcon />,
    label: 'Open',
    onClick: () => {
      console.log('Open clicked');
    },
  },
  {
    icon: <SaveIcon />,
    label: 'Save',
    onClick: () => {
      console.log('Save clicked');
    },
  },
  {
    icon: <CopyPlusIcon />,
    label: 'Duplicate',
    onClick: () => {
      console.log('Duplicate clicked');
    },
  },
  {
    icon: <ShieldQuestionIcon />,
    label: 'Help',
    onClick: () => {
      console.log('Help clicked');
    },
  },
  {
    icon: <SettingsIcon />,
    label: 'Configurations',
    onClick: () => {
      console.log('Config clicked');
    },
  },
];

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleMouseAction = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handlePointerAction = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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
        onClick={() => setIsOpen(!isOpen)}
        className='bg-surface-light dark:bg-surface-dark hover:bg-surface-hover-light hover:dark:bg-surface-hover-dark rounded-lg px-4 py-5 text-teal-500 shadow-md'
      >
        <MenuIcon />
      </button>

      {isOpen && (
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
                  item.onClick();
                  setIsOpen(false); // Close dropdown after clicking an item
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
    </>
  );
}
