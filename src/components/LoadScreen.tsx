import {
  FolderIcon,
  ShieldQuestionIcon,
  SquarePlusIcon
} from 'lucide-react';
import { APP_SLOGAN, createNewSpace, importFile } from '../lib';

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
      importFile();
    },
  },
  {
    icon: <ShieldQuestionIcon />,
    label: 'Help',
    onClick: () => {
      console.log('Help clicked');
    },
  },
  // {
  //   icon: <LogInIcon />,
  //   label: 'Login',
  //   onClick: () => {
  //     console.log('Login clicked');
  //   },
  // },
];
export default function LoadScreen() {
  return (
    <div className='absolute top-0 left-0 z-10 flex min-h-screen w-screen'>
      <div className='bg-background-light/70 dark:bg-background-dark/70 relative m-auto w-48 py-1'>
        <div className='absolute -top-3 -left-14 w-full min-w-fit -translate-y-full'>
          <div className='text-brand relative'>
            <h1 className='font-brand min-w-fit text-center text-9xl font-black'>
              Akyl
            </h1>
            <span className='absolute -top-1 -right-3 text-xl'>©</span>
          </div>
          <p className='text-brand mt-1 text-center font-medium'>{APP_SLOGAN}</p>
        </div>

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
