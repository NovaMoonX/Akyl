import { XIcon } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../store';

interface BulkSheetEditorProps {
  endBulkEdit: () => void;
  onAddedToSheet?: (sheet: { id: string; name: string }) => void;
}

export default function BulkSheetEditor({
  endBulkEdit,
  onAddedToSheet,
}: BulkSheetEditorProps) {
  const [
    selectedBudgetItems,
    sheets,
    activeSheet,
    addSheetToSelectedItems,
    removeSheetFromSelectedItems,
    clearBudgetItemSelection,
  ] = useSpace(
    useShallow((state) => [
      state.selectedBudgetItems,
      state?.space?.sheets,
      state?.space?.config?.activeSheet || 'all',
      state.addSheetToSelectedItems,
      state.removeSheetFromSelectedItems,
      state.clearBudgetItemSelection,
    ]),
  );

  const handleRemoveSheetFromSelectedItems = (sheetId: string) => {
    removeSheetFromSelectedItems(sheetId);
    endBulkEdit();
  };

  const handleAddSheetToSelectedItems = (sheet: {
    id: string;
    name: string;
  }) => {
    addSheetToSelectedItems(sheet.id);
    endBulkEdit();
    onAddedToSheet?.(sheet);
  };

  if (selectedBudgetItems.length === 0) {
    return null;
  }

  const currentSheet = sheets?.find((sheet) => sheet.id === activeSheet);

  return (
    <div className='bg-surface-light dark:bg-surface-dark fixed bottom-4 left-1/2 z-40 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-gray-300 px-3 py-2 shadow-lg md:max-w-none md:px-4 dark:border-gray-700'>
      {/* Desktop layout */}
      <div className='hidden items-center gap-3 md:flex'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>
            {selectedBudgetItems.length} item
            {selectedBudgetItems.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={clearBudgetItemSelection}
            className='rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700'
            aria-label='Clear selection'
          >
            <XIcon className='size-4' />
          </button>
        </div>
        {sheets && sheets.length > 0 && (
          <>
            <div className='h-6 w-px bg-gray-300 dark:bg-gray-700' />
            <div className='flex items-center gap-2'>
              <span className='text-sm opacity-70'>Add to:</span>
              {sheets
                .filter((sheet) => sheet.id !== currentSheet?.id)
                .map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => handleAddSheetToSelectedItems(sheet)}
                    className='max-w-36 truncate rounded bg-emerald-500 px-3 py-1 text-sm text-white transition-colors hover:bg-emerald-600'
                  >
                    {sheet.name}
                  </button>
                ))}
            </div>
            {currentSheet && currentSheet.name !== 'All' && (
              <>
                <div className='h-6 w-px bg-gray-300 dark:bg-gray-700' />
                <div className='flex items-center gap-2'>
                  <span className='text-sm opacity-70'>Remove from</span>
                  <button
                    onClick={() =>
                      handleRemoveSheetFromSelectedItems(currentSheet.id)
                    }
                    className='max-w-36 truncate rounded bg-red-500 px-3 py-1 text-xs whitespace-nowrap text-white transition-colors hover:bg-red-600'
                  >
                    {currentSheet.name}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile layout */}
      <div className='flex flex-col gap-2 md:hidden'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-sm font-semibold'>
            {selectedBudgetItems.length} selected
          </span>
          <button
            onClick={clearBudgetItemSelection}
            className='rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700'
            aria-label='Clear selection'
          >
            <XIcon className='size-4' />
          </button>
        </div>
        {sheets && sheets.length > 0 && (
          <div className='flex flex-col gap-2'>
            {currentSheet && currentSheet.name !== 'All' && (
              <div className='flex items-center gap-1.5'>
                <span className='text-xs whitespace-nowrap opacity-70'>
                  Remove from
                </span>
                <button
                  onClick={() =>
                    handleRemoveSheetFromSelectedItems(currentSheet.id)
                  }
                  className='max-w-24 truncate rounded bg-red-500 px-2 py-0.5 text-xs whitespace-nowrap text-white transition-colors active:bg-red-600'
                >
                  {currentSheet.name}
                </button>
              </div>
            )}
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='text-xs whitespace-nowrap opacity-70'>
                Add to sheet:
              </span>
              {sheets
                .filter((sheet) => sheet.id !== currentSheet?.id)
                .map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => handleAddSheetToSelectedItems(sheet)}
                    className='max-w-24 truncate rounded bg-emerald-500 px-2 py-0.5 text-xs text-white transition-colors active:bg-emerald-600'
                  >
                    {sheet.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
