import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import JSZip from 'jszip';
import { exportCSV, exportFile, FILE_EXTENSION, generateCSVContent } from '../../lib';
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
  const sheets = useSpace(useShallow((state) => state?.space?.sheets));
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<ExportFormat>('akyl');
  const [selectedSheets, setSelectedSheets] = useState<string[]>(['all']);

  useEffect(() => {
    const kebabCaseTitle = toKebabCase(space.title || '');
    setFileName(kebabCaseTitle);
  }, [space.title]);

  const handleExport = async () => {
    if (format === 'csv') {
      // If only one sheet is selected, export directly without zip
      if (selectedSheets.length === 1) {
        const sheetId = selectedSheets[0];
        let sheetFileName = fileName;
        if (sheetId === 'all') {
          sheetFileName = `${fileName} - All`;
        } else {
          const sheet = sheets?.find((s) => s.id === sheetId);
          if (sheet) {
            sheetFileName = `${fileName} - ${sheet.name}`;
          }
        }
        exportCSV(sheetFileName, space, sheetId);
      } else {
        // Multiple sheets: create a zip file
        const zip = new JSZip();
        
        selectedSheets.forEach((sheetId) => {
          let sheetFileName = fileName;
          if (sheetId === 'all') {
            sheetFileName = `${fileName} - All`;
          } else {
            const sheet = sheets?.find((s) => s.id === sheetId);
            if (sheet) {
              sheetFileName = `${fileName} - ${sheet.name}`;
            }
          }
          const csvContent = generateCSVContent(space, sheetId);
          zip.file(`${sheetFileName}.csv`, csvContent);
        });
        
        // Generate and download the zip file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = Date.now();
        a.download = `${fileName}-csvs-${timestamp}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      exportFile(fileName, space);
    }
    onClose();
  };

  const toggleSheet = (sheetId: string) => {
    setSelectedSheets((prev) => {
      if (prev.includes(sheetId)) {
        return prev.filter((id) => id !== sheetId);
      }
      return [...prev, sheetId];
    });
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

        {format === 'csv' && (
          <div className='flex grow flex-col gap-1'>
            <label className='font-medium'>Sheets to Export</label>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
              {selectedSheets.length > 1
                ? 'Multiple sheets will be exported as a ZIP file.'
                : 'Each sheet will be exported as a separate CSV file.'}
            </p>
            <div className='flex flex-col gap-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={selectedSheets.includes('all')}
                  onChange={() => toggleSheet('all')}
                  className='size-4 cursor-pointer accent-emerald-500 rounded'
                />
                <span>All Items</span>
              </label>
              {sheets &&
                sheets.map((sheet) => (
                  <label
                    key={sheet.id}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selectedSheets.includes(sheet.id)}
                      onChange={() => toggleSheet(sheet.id)}
                      className='size-4 cursor-pointer accent-emerald-500 rounded'
                    />
                    <span>{sheet.name}</span>
                  </label>
                ))}
            </div>
          </div>
        )}

        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='btn btn-secondary'>
            Cancel
          </button>
          <button
            onClick={handleExport}
            className='btn btn-primary'
            disabled={
              !fileName.trim() ||
              (format === 'csv' && selectedSheets.length === 0)
            }
          >
            Export
          </button>
        </div>
      </div>
    </Modal>
  );
}
