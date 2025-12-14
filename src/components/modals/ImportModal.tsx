import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { exportCSVTemplate, importCSV } from '../../lib';
import { useSpace } from '../../store';
import Modal from '../ui/Modal';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ImportMode = 'overwrite' | 'new-sheet' | 'new-space';

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { space, setSpace, addSheet } = useSpace();
  const sheets = useSpace(useShallow((state) => state?.space?.sheets));
  const [importMode, setImportMode] = useState<ImportMode>('new-sheet');
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [newSheetName, setNewSheetName] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadTemplate = () => {
    exportCSVTemplate();
  };

  const handleImport = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (importMode === 'new-space') {
        // For new space, import CSV and create a new space
        const { incomes, expenses } = await importCSV(space);
        
        // Create a new space with imported data
        const newSpaceId = crypto.randomUUID();
        const newSpace = {
          ...space,
          id: newSpaceId,
          title: 'Imported Budget',
          incomes,
          expenses,
        };
        
        localStorage.setItem(newSpaceId, JSON.stringify(newSpace));
        window.open(`/${newSpaceId}`, '_blank');
        onClose();
      } else if (importMode === 'overwrite') {
        if (!selectedSheet) {
          setError('Please select a sheet to overwrite');
          return;
        }
        
        // Import and assign to selected sheet
        const { incomes, expenses } = await importCSV(space, selectedSheet);
        
        // Remove existing items from the selected sheet
        const filteredIncomes = space.incomes.filter(
          (income) =>
            !income.sheets ||
            income.sheets.length === 0 ||
            !income.sheets.includes(selectedSheet)
        );
        const filteredExpenses = space.expenses.filter(
          (expense) =>
            !expense.sheets ||
            expense.sheets.length === 0 ||
            !expense.sheets.includes(selectedSheet)
        );
        
        setSpace({
          ...space,
          incomes: [...filteredIncomes, ...incomes],
          expenses: [...filteredExpenses, ...expenses],
        });
        onClose();
      } else {
        // Create new sheet
        if (!newSheetName.trim()) {
          setError('Please enter a sheet name');
          return;
        }
        
        const newSheetId = crypto.randomUUID();
        addSheet({
          id: newSheetId,
          name: newSheetName,
        });
        
        // Import and assign to new sheet
        const { incomes, expenses } = await importCSV(space, newSheetId);
        
        setSpace({
          ...space,
          incomes: [...space.incomes, ...incomes],
          expenses: [...space.expenses, ...expenses],
        });
        onClose();
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'No file selected') {
          // User cancelled, just close
          onClose();
        } else {
          setError(err.message);
        }
      } else {
        setError('An error occurred while importing the file.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setNewSheetName('');
    setSelectedSheet('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Import CSV'>
      <div className='flex flex-col gap-4'>
        <div className='rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-800 dark:text-blue-300'>
          <p className='font-medium mb-1'>CSV Format Required:</p>
          <p className='mb-2'>
            Two sections with headers: one for incomes, one for expenses.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className='text-blue-600 dark:text-blue-400 hover:underline font-medium'
          >
            Download Template CSV
          </button>
        </div>

        <div className='flex grow flex-col gap-1'>
          <label className='font-medium'>Import Destination</label>
          <div className='flex flex-col gap-2'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='importMode'
                value='new-space'
                checked={importMode === 'new-space'}
                onChange={(e) =>
                  setImportMode(e.target.value as ImportMode)
                }
                className='size-4 cursor-pointer accent-emerald-500'
              />
              <span>Create New Space</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='importMode'
                value='new-sheet'
                checked={importMode === 'new-sheet'}
                onChange={(e) =>
                  setImportMode(e.target.value as ImportMode)
                }
                className='size-4 cursor-pointer accent-emerald-500'
              />
              <span>Create New Sheet</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='importMode'
                value='overwrite'
                checked={importMode === 'overwrite'}
                onChange={(e) =>
                  setImportMode(e.target.value as ImportMode)
                }
                className='size-4 cursor-pointer accent-emerald-500'
              />
              <span>Overwrite Existing Sheet</span>
            </label>
          </div>
        </div>

        {importMode === 'new-sheet' && (
          <div className='flex grow flex-col gap-1'>
            <label className='font-medium'>New Sheet Name</label>
            <input
              type='text'
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder='Enter sheet name'
              className='dark:bg-surface-dark dark:text-surface-light grow rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
            />
          </div>
        )}

        {importMode === 'overwrite' && (
          <div className='flex grow flex-col gap-1'>
            <label className='font-medium'>Select Sheet to Overwrite</label>
            <select
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              className='dark:bg-surface-dark dark:text-surface-light grow rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
            >
              <option value=''>Select a sheet...</option>
              {sheets &&
                sheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {error && (
          <div className='rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-300'>
            {error}
          </div>
        )}

        <div className='flex justify-end gap-2'>
          <button onClick={handleClose} className='btn btn-secondary'>
            Cancel
          </button>
          <button
            onClick={handleImport}
            className='btn btn-primary'
            disabled={isLoading}
          >
            {isLoading ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
