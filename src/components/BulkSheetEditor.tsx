import { XIcon } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../store';

export default function BulkSheetEditor() {
  const [selectedBudgetItems, sheets, addSheetToSelectedItems, removeSheetFromSelectedItems, clearBudgetItemSelection] = useSpace(
    useShallow((state) => [
      state.selectedBudgetItems,
      state?.space?.sheets || [],
      state.addSheetToSelectedItems,
      state.removeSheetFromSelectedItems,
      state.clearBudgetItemSelection,
    ]),
  );

  if (selectedBudgetItems.length === 0) {
    return null;
  }

  return (
    <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-surface-light dark:bg-surface-dark rounded-full shadow-lg px-4 py-2 border border-gray-300 dark:border-gray-700'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          <span className='font-semibold text-sm'>
            {selectedBudgetItems.length} item{selectedBudgetItems.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={clearBudgetItemSelection}
            className='p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded'
            aria-label='Clear selection'
          >
            <XIcon className='size-4' />
          </button>
        </div>
        {sheets.length > 0 && (
          <>
            <div className='h-6 w-px bg-gray-300 dark:bg-gray-700' />
            <div className='flex items-center gap-2'>
              <span className='text-sm opacity-70'>Add to:</span>
              {sheets.map((sheet) => (
                <button
                  key={sheet.id}
                  onClick={() => addSheetToSelectedItems(sheet.id)}
                  className='px-3 py-1 text-sm rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors'
                >
                  {sheet.name}
                </button>
              ))}
            </div>
            <div className='h-6 w-px bg-gray-300 dark:bg-gray-700' />
            <div className='flex items-center gap-2'>
              <span className='text-sm opacity-70'>Remove from:</span>
              {sheets.map((sheet) => (
                <button
                  key={sheet.id}
                  onClick={() => removeSheetFromSelectedItems(sheet.id)}
                  className='px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition-colors'
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
