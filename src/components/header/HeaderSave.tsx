import { CloudIcon, EarthIcon } from 'lucide-react';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../../contexts/AuthContext';
import { useSpace } from '../../store';
import Dropdown from '../ui/Dropdown';

export default function HeaderSave() {
  const { currentUser } = useAuth();
  const spaceCreatedBy = useSpace(
    useShallow((state) => state.space?.metadata?.createdBy),
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMouseOver = () => {
    setIsDropdownOpen(true);
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 5000);
  };

  const showCloudSync = currentUser?.uid && spaceCreatedBy;
  return (
    <>
      <div className='flex flex-col items-center' onMouseOver={handleMouseOver}>
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
      </Dropdown>
    </>
  );
}
