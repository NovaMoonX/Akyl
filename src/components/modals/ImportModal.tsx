import { useState } from 'react';
import { importCSV, importFile } from '../../lib';
import { useSpace } from '../../store';
import Modal from '../ui/Modal';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ImportFormat = 'akyl' | 'csv';

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { space, setSpace } = useSpace();
  const [format, setFormat] = useState<ImportFormat>('akyl');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (format === 'csv') {
        const updatedSpace = await importCSV(space);
        setSpace(updatedSpace);
        onClose();
      } else {
        await importFile();
        // importFile handles the redirect internally
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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Import Data'>
      <div className='flex flex-col gap-4'>
        <div className='flex grow flex-col gap-1'>
          <label className='font-medium'>Format</label>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='format'
                value='akyl'
                checked={format === 'akyl'}
                onChange={(e) => setFormat(e.target.value as ImportFormat)}
                className='size-4 cursor-pointer accent-emerald-500'
              />
              <span>Akyl (Complete Data)</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='format'
                value='csv'
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value as ImportFormat)}
                className='size-4 cursor-pointer accent-emerald-500'
              />
              <span>CSV (Income & Expenses)</span>
            </label>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            {format === 'akyl'
              ? 'Imports a complete Akyl space file including all configurations.'
              : 'Imports income and expense data from a CSV file, replacing current data.'}
          </p>
        </div>

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
            {isLoading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
