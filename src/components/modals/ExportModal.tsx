import { useEffect, useState } from 'react';
import { exportCSV, exportFile, FILE_EXTENSION } from '../../lib';
import { useSpace } from '../../store';
import { toKebabCase } from '../../utils';
import Modal from '../ui/Modal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ExportFormat = 'akyl' | 'csv';

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { space } = useSpace();
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<ExportFormat>('akyl');

  useEffect(() => {
    const kebabCaseTitle = toKebabCase(space.title || '');
    setFileName(kebabCaseTitle);
  }, [space.title]);

  const handleExport = () => {
    if (format === 'csv') {
      exportCSV(fileName, space);
    } else {
      exportFile(fileName, space);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Export Space'>
      <div className='flex flex-col gap-4'>
        <div className='flex grow flex-col gap-1'>
          <label className='font-medium'>File Name</label>
          <div className='flex items-baseline gap-2'>
            <input
              type='text'
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={space.title || 'File name'}
              className='dark:bg-surface-dark dark:text-surface-light grow rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
            />
            <p>{format === 'csv' ? '.csv' : FILE_EXTENSION}</p>
          </div>
        </div>

        <div className='flex grow flex-col gap-1'>
          <label className='font-medium'>Format</label>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='format'
                value='akyl'
                checked={format === 'akyl'}
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
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
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
                className='size-4 cursor-pointer accent-emerald-500'
              />
              <span>CSV (Income & Expenses)</span>
            </label>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            {format === 'akyl'
              ? 'Exports all data including configurations and metadata.'
              : 'Exports only income and expense data in CSV format for spreadsheet compatibility.'}
          </p>
        </div>

        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='btn btn-secondary'>
            Cancel
          </button>
          <button
            onClick={handleExport}
            className='btn btn-primary'
            disabled={!fileName.trim()}
          >
            Export
          </button>
        </div>
      </div>
    </Modal>
  );
}
