import {
  CopyPlusIcon,
  FileImageIcon,
  FolderIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  SaveIcon,
  SettingsIcon,
  ShieldQuestionIcon,
  SquarePlusIcon,
  TrashIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../../contexts/AuthContext';
import { signOutUser } from '../../firebase';
import useBrowserSpaces from '../../hooks/useBrowserSpaces';
import useDownloadPng from '../../hooks/useDownloadPng';
import { APP_SPACE_LIMIT_REACHED, createNewSpace, importFile } from '../../lib';
import { useSpaceStore } from '../../store/config';
import DreamTrigger from '../DreamTrigger';
import AuthModal from '../modals/AuthModal';
import ConfigModal from '../modals/ConfigModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import DeleteSpaceModal from '../modals/DeleteSpaceModal';
import DuplicateSpaceModal from '../modals/DuplicateSpaceModal';
import HelpModal from '../modals/HelpModal';
import SaveModal from '../modals/SaveModal';
import Dropdown from '../ui/Dropdown';
import ThemeToggle from '../ui/ThemeToggle';
import Tooltip from '../ui/Tooltip';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
}

const DEFAULT_ITEMS: MenuItem[] = [
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
    icon: <FileImageIcon />,
    label: 'Download Image',
  },
  {
    icon: <CopyPlusIcon />,
    label: 'Duplicate',
  },
  {
    icon: <TrashIcon />,
    label: 'Delete',
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
  const { currentUser } = useAuth();
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteSpaceId, setDeleteSpaceId] = useState<string>();
  const spaceId = useSpaceStore(useShallow((state) => state?.space?.id));
  const { limitMet } = useBrowserSpaces();
  const { download } = useDownloadPng();

  const items = useMemo(() => {
    if (currentUser) {
      return [
        ...DEFAULT_ITEMS,
        {
          icon: <LogOutIcon />,
          label: 'Sign Out',
        },
      ];
    }

    return [
      ...DEFAULT_ITEMS,
      {
        icon: <LogInIcon />,
        label: 'Login',
      },
    ];
  }, [currentUser]);

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
          onConfirm: () => createNewSpace(currentUser?.uid),
        });
        break;
      case 'Open':
        importFile();
        break;
      case 'Save':
        setIsSaveModalOpen(true);
        break;
      case 'Download Image':
        download();
        break;
      case 'Duplicate':
        setIsDuplicateModalOpen(true);
        break;
      case 'Delete':
        setDeleteSpaceId(spaceId);
        break;
      case 'Help':
        setIsHelpModalOpen(true);
        break;
      case 'Configurations':
        setIsConfigModalOpen(true);
        break;
      case 'Login':
        setIsAuthModalOpen(true);
        break;
      case 'Sign Out':
        signOutUser();
        break;
      default:
        break;
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className='bg-surface-light dark:bg-surface-dark hover:bg-surface-hover-light hover:dark:bg-surface-hover-dark rounded-lg px-3 py-4 sm:px-4 sm:py-5 text-teal-500 shadow-md'
      >
        <MenuIcon className='size-4 sm:size-5' />
      </button>

      <Dropdown
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        className='left-2 sm:left-4'
      >
        {items.map((item, index) => {
          const Icon = (item.icon as React.ReactElement).type;
          const isDisabled = item.label === 'New Space' && limitMet;
          return (
            <Tooltip
              key={index}
              title={APP_SPACE_LIMIT_REACHED}
              disabled={!isDisabled}
            >
              <button
                key={index}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  handleMenuItemClick(item.label);
                }}
                className='enabled:hover:bg-surface-hover-light enabled:hover:dark:bg-surface-hover-dark flex w-full flex-row items-center gap-1 px-4 py-2 text-left text-gray-500 enabled:hover:text-gray-900 disabled:!cursor-not-allowed enabled:hover:dark:text-gray-100 text-sm sm:text-base'
              >
                <Icon size={16} />
                {item.label}
              </button>
            </Tooltip>
          );
        })}
        <div className='h-0.5 w-full bg-gray-200 dark:bg-gray-700' />
        <div className='flex items-center justify-between py-1 pr-3 pl-4'>
          <p className='opacity-80 text-sm sm:text-base'>Theme</p>
          <ThemeToggle />
        </div>
        <DreamTrigger />
      </Dropdown>

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

      <DeleteSpaceModal
        isOpen={Boolean(deleteSpaceId)}
        onClose={() => setDeleteSpaceId(undefined)}
        spaceId={deleteSpaceId}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
