import { PlusIcon, XIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../../store';
import { generateId } from '../../utils';

interface HeaderBarSheetsProps {
  onConfirmSheetDeletion: (sheetId: string) => void;
}

export default function HeaderBarSheets({
  onConfirmSheetDeletion,
}: HeaderBarSheetsProps) {
  const [sheets, activeSheet, setActiveSheet, addSheet] = useSpace(
    useShallow((state) => [
      state?.space?.sheets,
      state?.space?.config?.activeSheet || 'all',
      state.setActiveSheet,
      state.addSheet,
      state.removeSheet,
    ]),
  );
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleAddSheet = useCallback(() => {
    if (newSheetName.trim()) {
      const newSheet = {
        id: generateId('sheet'),
        name: newSheetName.trim(),
      };
      addSheet(newSheet);
      setNewSheetName('');
      setShowAddSheet(false);
    }
  }, [newSheetName, addSheet]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddSheet();
      } else if (e.key === 'Escape') {
        setShowAddSheet(false);
        setNewSheetName('');
      }
    },
    [handleAddSheet],
  );

  const handleShowHint = useCallback(() => setShowHint(true), []);
  const handleHideHint = useCallback(() => setShowHint(false), []);

  return (
    <div className='flex items-center gap-2'>
      {sheets && sheets.length > 0 && (
        <div
          className='relative -translate-y-0.5'
          onMouseEnter={handleShowHint}
          onMouseLeave={handleHideHint}
        >
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            Sheets:
          </span>
          {showHint && (
            <div className='absolute top-full left-0 z-50 mt-1 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white'>
              Ctrl/Cmd+Click items to multi-select
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setActiveSheet('all')}
        className={`rounded px-3 py-1 text-sm transition-colors ${
          activeSheet === 'all'
            ? 'bg-emerald-500 text-white'
            : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
        }`}
      >
        All
      </button>
      {sheets &&
        sheets.map((sheet) => (
          <div key={sheet.id} className='group relative'>
            <button
              onClick={() => setActiveSheet(sheet.id)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                activeSheet === sheet.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
            >
              {sheet.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirmSheetDeletion(sheet.id);
              }}
              className='absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100'
              aria-label={`Delete ${sheet.name}`}
            >
              <XIcon className='size-3' />
            </button>
          </div>
        ))}
      {showAddSheet ? (
        <div className='flex items-center gap-1'>
          <input
            type='text'
            value={newSheetName}
            onChange={(e) => setNewSheetName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='Sheet name'
            autoFocus
            className='w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          />
          <button
            onClick={handleAddSheet}
            className='rounded bg-emerald-500 px-2 py-1 text-sm text-white hover:bg-emerald-600'
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddSheet(false);
              setNewSheetName('');
            }}
            className='rounded bg-gray-500 px-2 py-1 text-sm text-white hover:bg-gray-600'
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddSheet(true)}
          className='rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
          aria-label='Add new sheet'
          title='Add new sheet'
        >
          <PlusIcon className='size-4' />
        </button>
      )}
    </div>
  );
}
