import { MonitorCheckIcon } from 'lucide-react';
import { useState } from 'react';
import Dropdown from '../ui/Dropdown';

export default function HeaderSave() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMouseOver = () => {
    setIsDropdownOpen(true);
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 2000);
  };

  return (
    <>
      <div className='flex flex-col items-center' onMouseOver={handleMouseOver}>
        <MonitorCheckIcon className='size-5 2xl:size-6' />
        <small className='text-xs'>saved</small>
      </div>

      <Dropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        className='-right-2'
      >
        <small className='block p-2'>
          Changes are being saved in your browser
        </small>
      </Dropdown>
    </>
  );
}
