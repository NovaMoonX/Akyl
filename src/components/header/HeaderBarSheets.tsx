import { PlusIcon, XIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../../store';
import { generateId } from '../../utils';

export default function HeaderBarSheets() {
  const [sheets, activeSheet, setActiveSheet, addSheet, removeSheet] = useSpace(
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

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSheet();
    } else if (e.key === 'Escape') {
      setShowAddSheet(false);
      setNewSheetName('');
    }
  }, [handleAddSheet]);

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
          <span className='text-xs text-gray-500 dark:text-gray-400'>Sheets:</span>
          {showHint && (
            <div className='absolute top-full left-0 mt-1 z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap'>
              Ctrl/Cmd+Click items to multi-select
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setActiveSheet('all')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          activeSheet === 'all'
            ? 'bg-emerald-500 text-white'
            : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        All
      </button>
      {sheets && sheets.map((sheet) => (
        <div key={sheet.id} className='relative group'>
          <button
            onClick={() => setActiveSheet(sheet.id)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeSheet === sheet.id
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {sheet.name}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeSheet(sheet.id);
            }}
            className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity'
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
            className='px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:outline-none w-32'
          />
          <button
            onClick={handleAddSheet}
            className='px-2 py-1 text-sm rounded bg-emerald-500 text-white hover:bg-emerald-600'
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddSheet(false);
              setNewSheetName('');
            }}
            className='px-2 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600'
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddSheet(true)}
          className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
          aria-label='Add new sheet'
        >
          <PlusIcon className='size-4' />
        </button>
      )}
    </div>
  );
}
