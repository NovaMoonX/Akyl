import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../../contexts/AuthContext';
import { createNewSpace, exportCSVTemplate, importCSV } from '../../lib';
import { useSpace } from '../../store';
import Modal from '../ui/Modal';
import { generateId } from '../../utils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ImportMode = 'overwrite' | 'new-sheet' | 'new-space' | 'overwrite-space' | 'add-to-sheet';

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { currentUser } = useAuth();
  const { space, setSpace } = useSpace();
  const sheets = useSpace(useShallow((state) => state?.space?.sheets));
  const [importMode, setImportMode] = useState<ImportMode>('new-space');
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [newSheetName, setNewSheetName] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const hasSheets = sheets && sheets.length > 0;
  const hasSpace = space && space.id;

  const handleDownloadTemplate = () => {
    exportCSVTemplate();
  };

  const handleFileSelect = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setSelectedFile(file);
          setError('');
        }
      };
      input.click();
    } catch {
      setError('Failed to select file');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first');
      return;
    }

    // If overwrite-space mode, show confirmation dialog first
    if (importMode === 'overwrite-space' && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (importMode === 'new-space') {
        if (!newSpaceName.trim()) {
          setError('Please enter a space name');
          setIsLoading(false);
          return;
        }

        // Import CSV from selected file
        const { incomes, expenses } = await importCSV(selectedFile);

        createNewSpace({
          userId: currentUser?.uid,
          title: newSpaceName,
          incomes,
          expenses,
        });
        handleClose();
      } else if (importMode === 'overwrite-space') {
        // Import CSV and replace all budget items, delete all sheets
        const { incomes, expenses } = await importCSV(selectedFile);

        setSpace({
          ...space,
          incomes,
          expenses,
          sheets: [], // Delete all sheets
        });
        setShowConfirmDialog(false);
        handleClose();
      } else if (importMode === 'overwrite') {
        if (!selectedSheet) {
          setError('Please select a sheet to overwrite');
          setIsLoading(false);
          return;
        }

        // Import and assign to selected sheet
        const { incomes, expenses } = await importCSV(
          selectedFile,
          selectedSheet,
        );

        // Remove existing items from the selected sheet
        const filteredIncomes = space.incomes.filter(
          (income) =>
            !income.sheets ||
            income.sheets.length === 0 ||
            !income.sheets.includes(selectedSheet),
        );
        const filteredExpenses = space.expenses.filter(
          (expense) =>
            !expense.sheets ||
            expense.sheets.length === 0 ||
            !expense.sheets.includes(selectedSheet),
        );

        setSpace({
          ...space,
          incomes: [...filteredIncomes, ...incomes],
          expenses: [...filteredExpenses, ...expenses],
        });
        handleClose();
      } else if (importMode === 'add-to-sheet') {
        if (!selectedSheet) {
          setError('Please select a sheet to add items to');
          setIsLoading(false);
          return;
        }

        // Import and assign to selected sheet (add to existing items)
        const { incomes, expenses } = await importCSV(
          selectedFile,
          selectedSheet,
        );

        setSpace({
          ...space,
          incomes: [...space.incomes, ...incomes],
          expenses: [...space.expenses, ...expenses],
        });
        handleClose();
      } else {
        // Create new sheet
        if (!newSheetName.trim()) {
          setError('Please enter a sheet name');
          setIsLoading(false);
          return;
        }

        const newSheetId = generateId('sheet');

        // Import and assign to new sheet
        const { incomes, expenses } = await importCSV(selectedFile, newSheetId);

        // Create the new sheet and update space with new items
        const newSheet = {
          id: newSheetId,
          name: newSheetName,
        };

        setSpace({
          ...space,
          sheets: [...(space.sheets || []), newSheet],
          incomes: [...space.incomes, ...incomes],
          expenses: [...space.expenses, ...expenses],
        });
        handleClose();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
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
    setNewSpaceName('');
    setSelectedSheet('');
    setSelectedFile(null);
    setShowConfirmDialog(false);
    onClose();
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Import CSV'>
      <div className='flex flex-col gap-4'>
        <div className='rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'>
          <p className='mb-1 font-medium'>CSV Format Required:</p>
          <p className='mb-2'>
            Two sections with headers: one for incomes, one for expenses.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className='font-medium text-blue-600 hover:underline dark:text-blue-400'
          >
            Download Template CSV
          </button>
        </div>

        <div className='flex grow flex-col gap-1'>
          <label className='font-medium'>Select CSV File</label>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleFileSelect}
              className='btn btn-secondary flex-1'
            >
              {selectedFile ? selectedFile.name : 'Choose File'}
            </button>
            {selectedFile && (
              <span className='text-sm text-green-600 dark:text-green-400'>
                ✓
              </span>
            )}
          </div>
        </div>

        {hasSpace && (
          <div className='flex grow flex-col gap-1'>
            <label className='font-medium'>Import Destination</label>
            <div className='flex flex-col gap-2'>
              <label className='flex cursor-pointer items-center gap-2'>
                <input
                  type='radio'
                  name='importMode'
                  value='new-space'
                  checked={importMode === 'new-space'}
                  onChange={(e) => setImportMode(e.target.value as ImportMode)}
                  className='size-4 cursor-pointer accent-emerald-500'
                />
                <span>Create New Space</span>
              </label>
              <label className='flex cursor-pointer items-center gap-2'>
                <input
                  type='radio'
                  name='importMode'
                  value='new-sheet'
                  checked={importMode === 'new-sheet'}
                  onChange={(e) => setImportMode(e.target.value as ImportMode)}
                  className='size-4 cursor-pointer accent-emerald-500'
                />
                <span>Create New Sheet</span>
              </label>
              <label
                className={`flex items-center gap-2 ${
                  !hasSheets
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                }`}
              >
                <input
                  type='radio'
                  name='importMode'
                  value='overwrite'
                  checked={importMode === 'overwrite'}
                  onChange={(e) => setImportMode(e.target.value as ImportMode)}
                  disabled={!hasSheets}
                  className='size-4 cursor-pointer accent-emerald-500 disabled:cursor-not-allowed'
                />
                <span>Overwrite Existing Sheet</span>
                {!hasSheets && (
                  <span className='text-xs text-gray-500'>
                    (No sheets available)
                  </span>
                )}
              </label>
              <label
                className={`flex items-center gap-2 ${
                  !hasSheets
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                }`}
              >
                <input
                  type='radio'
                  name='importMode'
                  value='add-to-sheet'
                  checked={importMode === 'add-to-sheet'}
                  onChange={(e) => setImportMode(e.target.value as ImportMode)}
                  disabled={!hasSheets}
                  className='size-4 cursor-pointer accent-emerald-500 disabled:cursor-not-allowed'
                />
                <span>Add to Existing Sheet</span>
                {!hasSheets && (
                  <span className='text-xs text-gray-500'>
                    (No sheets available)
                  </span>
                )}
              </label>
              <label className='flex cursor-pointer items-center gap-2'>
                <input
                  type='radio'
                  name='importMode'
                  value='overwrite-space'
                  checked={importMode === 'overwrite-space'}
                  onChange={(e) => setImportMode(e.target.value as ImportMode)}
                  className='size-4 cursor-pointer accent-emerald-500'
                />
                <span className='text-red-600 dark:text-red-400'>
                  Overwrite Current Space
                </span>
              </label>
            </div>
          </div>
        )}

        {(importMode === 'new-space' || !hasSpace) && (
          <div className='flex grow flex-col gap-1'>
            <label className='font-medium'>Space Name</label>
            <input
              type='text'
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              placeholder='Enter space name'
              className='dark:bg-surface-dark dark:text-surface-light grow rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
            />
          </div>
        )}

        {hasSpace && importMode === 'new-sheet' && (
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

        {hasSpace && importMode === 'overwrite' && (
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

        {hasSpace && importMode === 'add-to-sheet' && (
          <div className='flex grow flex-col gap-1'>
            <label className='font-medium'>Select Sheet to Add Items To</label>
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

        {hasSpace && importMode === 'overwrite-space' && (
          <div className='rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'>
            <p className='font-medium mb-1'>⚠️ Warning</p>
            <p>
              This will delete all existing budget items and sheets in the current space. This action cannot be undone.
            </p>
          </div>
        )}

        {error && (
          <div className='rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300'>
            {error}
          </div>
        )}

        {showConfirmDialog && importMode === 'overwrite-space' ? (
          <div className='flex flex-col gap-4 rounded-md border-2 border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20'>
            <div className='text-center'>
              <p className='mb-2 text-lg font-semibold text-red-800 dark:text-red-300'>
                Confirm Overwrite
              </p>
              <p className='text-sm text-red-700 dark:text-red-400'>
                Are you sure you want to overwrite the current space? All budget items and sheets will be permanently deleted. This action cannot be undone.
              </p>
            </div>
            <div className='flex justify-center gap-2'>
              <button onClick={handleCancelConfirm} className='btn btn-secondary'>
                Cancel
              </button>
              <button
                onClick={handleImport}
                className='btn bg-red-600 text-white hover:bg-red-700'
                disabled={isLoading}
              >
                {isLoading ? 'Overwriting...' : 'Yes, Overwrite Space'}
              </button>
            </div>
          </div>
        ) : (
          <div className='flex justify-end gap-2'>
            <button onClick={handleClose} className='btn btn-secondary'>
              Cancel
            </button>
            <button
              onClick={handleImport}
              className='btn btn-primary'
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? 'Importing...' : 'Import CSV'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
