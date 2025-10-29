import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../../store';
import { generateId } from '../../utils';

export default function HeaderBarSheets() {
  const [sheets, activeSheet, setActiveSheet, addSheet] = useSpace(
    useShallow((state) => [
      state?.space?.sheets || [],
      state?.space?.config?.activeSheet || 'all',
      state.setActiveSheet,
      state.addSheet,
    ]),
  );
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');

  const handleAddSheet = () => {
    if (newSheetName.trim()) {
      const newSheet = {
        id: generateId('sheet'),
        name: newSheetName.trim(),
      };
      addSheet(newSheet);
      setNewSheetName('');
      setShowAddSheet(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSheet();
    } else if (e.key === 'Escape') {
      setShowAddSheet(false);
      setNewSheetName('');
    }
  };

  return (
    <div className='flex items-center gap-2'>
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
      {sheets.map((sheet) => (
        <button
          key={sheet.id}
          onClick={() => setActiveSheet(sheet.id)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            activeSheet === sheet.id
              ? 'bg-emerald-500 text-white'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {sheet.name}
        </button>
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
