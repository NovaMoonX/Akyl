import {
  CheckSquareIcon,
  CalculatorIcon,
  Settings2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoveHorizontalIcon,
} from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useSidebarStore } from '../store/sidebar';
import { join } from '../utils';

interface SidebarActionsProps {
  onMultiSelectClick: () => void;
  onCalculatorClick: () => void;
  onSettingsClick: () => void;
  isMultiSelectActive: boolean;
}

export default function SidebarActions({
  onMultiSelectClick,
  onCalculatorClick,
  onSettingsClick,
  isMultiSelectActive,
}: SidebarActionsProps) {
  const [isCollapsed, position, toggleCollapsed, togglePosition] = useSidebarStore(
    useShallow((state) => [
      state.isCollapsed,
      state.position,
      state.toggleCollapsed,
      state.togglePosition,
    ]),
  );

  const isLeft = position === 'left';

  return (
    <>
      {/* Collapsed Tab */}
      {isCollapsed && (
        <div
          className={join(
            'bg-surface-light dark:bg-surface-dark fixed top-1/2 z-40 -translate-y-1/2 rounded-lg border border-gray-300 shadow-lg dark:border-gray-700 sm:hidden',
            isLeft ? 'left-0 rounded-l-none' : 'right-0 rounded-r-none',
          )}
        >
          <button
            onClick={toggleCollapsed}
            className='p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            aria-label='Expand sidebar'
            title='Expand sidebar'
          >
            {isLeft ? (
              <ChevronRightIcon className='size-5' />
            ) : (
              <ChevronLeftIcon className='size-5' />
            )}
          </button>
        </div>
      )}

      {/* Expanded Sidebar */}
      {!isCollapsed && (
        <div
          className={join(
            'bg-surface-light dark:bg-surface-dark fixed top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3 rounded-lg border border-gray-300 p-3 shadow-lg dark:border-gray-700 sm:hidden',
            isLeft ? 'left-4' : 'right-4',
          )}
        >
          {/* Action buttons */}
          <div className='flex flex-col gap-2'>
            <button
              onClick={onMultiSelectClick}
              className={join(
                'rounded-lg p-2 transition-colors',
                isMultiSelectActive
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700',
              )}
              aria-label='Multi-select mode'
              title='Multi-select mode'
            >
              <CheckSquareIcon className='size-5' />
            </button>

            <button
              onClick={onCalculatorClick}
              className='rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
              aria-label='Calculator'
              title='Calculator'
            >
              <CalculatorIcon className='size-5' />
            </button>

            <button
              onClick={onSettingsClick}
              className='rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
              aria-label='Settings'
              title='Settings'
            >
              <Settings2Icon className='size-5' />
            </button>
          </div>

          {/* Divider */}
          <div className='h-px bg-gray-300 dark:bg-gray-700' />

          {/* Sidebar controls */}
          <div className='flex flex-col gap-2'>
            <button
              onClick={togglePosition}
              className='rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
              aria-label={isLeft ? 'Move to right' : 'Move to left'}
              title={isLeft ? 'Move to right' : 'Move to left'}
            >
              <MoveHorizontalIcon className='size-5' />
            </button>

            <button
              onClick={toggleCollapsed}
              className='rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
              aria-label='Collapse sidebar'
              title='Collapse sidebar'
            >
              {isLeft ? (
                <ChevronLeftIcon className='size-5' />
              ) : (
                <ChevronRightIcon className='size-5' />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
