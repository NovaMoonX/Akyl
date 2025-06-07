import { CloudIcon, EarthIcon } from 'lucide-react';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../../contexts/AuthContext';
import { useSpace } from '../../store';
import AuthModal from '../modals/AuthModal';
import Dropdown from '../ui/Dropdown';

export default function HeaderSave() {
  const { currentUser } = useAuth();
  const spaceCreatedBy = useSpace(
    useShallow((state) => state.space?.metadata?.createdBy),
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleMouseLeave = () => {
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 2000);
  };

  const showCloudSync = currentUser?.uid && spaceCreatedBy?.length > 0;

  return (
    <>
      <div
        className='flex flex-col items-center'
        onMouseOver={() => setIsDropdownOpen(true)}
        onMouseLeave={handleMouseLeave}
      >
        {!showCloudSync && <EarthIcon className='size-6 2xl:size-7' />}
        {showCloudSync && <CloudIcon className='size-6 2xl:size-7' />}
        <small className='text-xs'>saved</small>
      </div>

      <Dropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        className='-right-2'
      >
        <small className='block p-2'>
          {!showCloudSync &&
            'Saved in-browser to protect your privacy and keep data available offline.'}
          {showCloudSync &&
            'Saved to the cloud and encrypted to protect your privacy.'}
        </small>

        {!currentUser && (
          <button
            onClick={() => setAuthModalOpen(true)}
            className='p-2 pt-0 text-xs font-semibold hover:underline'
          >
            Sign in to sync to cloud.
          </button>
        )}
      </Dropdown>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
