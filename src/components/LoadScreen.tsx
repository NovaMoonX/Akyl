import {
  FolderIcon,
  LogInIcon,
  ShieldQuestionIcon,
  SquarePlusIcon,
} from 'lucide-react';
import { createNewSpace } from '../lib';

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
      createNewSpace();
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
    icon: <ShieldQuestionIcon />,
    label: 'Help',
    onClick: () => {
      console.log('Help clicked');
    },
  },
  {
    icon: <LogInIcon />,
    label: 'Login',
    onClick: () => {
      console.log('Login clicked');
    },
  },
];
export default function LoadScreen() {
  return (
    <div className='absolute top-0 left-0 z-10 flex min-h-screen w-screen'>
      <div className='m-auto w-48 py-1'>
        {items.map((item, index) => {
          const Icon = (item.icon as React.ReactElement).type;
          return (
            <button
              key={index}
              onClick={() => {
                item.onClick();
              }}
              className='flex w-full flex-row items-center gap-1.5 px-4 py-2 text-left text-gray-500 hover:bg-black/5 hover:text-gray-900 hover:dark:bg-white/5 hover:dark:text-gray-100'
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
