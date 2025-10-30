import { Settings2Icon } from 'lucide-react';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../store';
import BulkSheetEditor from './BulkSheetEditor';
import HeaderBarSheets from './header/HeaderBarSheets';
import Modal from './ui/Modal';
import Dropdown from './ui/Dropdown';
import BottomActions from './BottomActions';
import HeaderBarTimeWindow from './header/HeaderBarTimeWindow';

export default function BottomBar() {
  const selectedBudgetItems = useSpace(
    useShallow((state) => state.selectedBudgetItems),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isBulkSelecting = selectedBudgetItems.length > 0;

  if (isBulkSelecting) {
    return <BulkSheetEditor />;
  }

  return (
    <>
      <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-surface-light dark:bg-surface-dark rounded-full shadow-lg px-4 py-2 border border-gray-300 dark:border-gray-700'>
        <div className='flex items-center gap-3'>
          <HeaderBarSheets />
          <div className='h-6 w-px bg-gray-300 dark:bg-gray-700' />
          
          {/* Desktop: Dropdown */}
          <div className='hidden sm:block relative'>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              aria-label='Settings'
            >
              <Settings2Icon className='size-5' />
            </button>
            
            <Dropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              className='bottom-full mb-2 right-0 w-fit !p-4'
            >
              <div className='flex flex-col gap-4'>
                <div>
                  <span className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                    Budget Time Window
                  </span>
                  <HeaderBarTimeWindow />
                </div>
                <div>
                  <span className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                    Display Options
                  </span>
                  <BottomActions className='' actionClassName='rounded-md' />
                </div>
              </div>
            </Dropdown>
          </div>

          {/* Mobile: Modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className='sm:hidden p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            aria-label='Settings'
          >
            <Settings2Icon className='size-5' />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Settings'
        centerTitle={true}
      >
        <div className='flex flex-col items-center gap-4 pb-2'>
          <div>
            <span className='mb-1 block text-center font-medium text-gray-700 dark:text-gray-200'>
              Budget Time Window
            </span>
            <HeaderBarTimeWindow />
          </div>

          <div>
            <span className='mb-1 block text-center font-medium text-gray-700 dark:text-gray-200'>
              Display Options
            </span>
            <BottomActions className='' actionClassName='rounded-md' />
          </div>
        </div>
      </Modal>
    </>
  );
}
