import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import useDownloadPng from '../../hooks/useDownloadPng';
import { useSpace } from '../../store';
import Modal from '../ui/Modal';

interface ImageDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageDownloadModal({
  isOpen,
  onClose,
}: ImageDownloadModalProps) {
  const sheets = useSpace(useShallow((state) => state?.space?.sheets));
  const [selectedSheets, setSelectedSheets] = useState<string[]>(['all']);
  const { downloadSheet } = useDownloadPng();

  const handleDownload = async () => {
    // Download each selected sheet sequentially to avoid race conditions
    for (const sheetId of selectedSheets) {
      await downloadSheet(sheetId);
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
    <Modal isOpen={isOpen} onClose={onClose} title='Download Image'>
      <div className='flex flex-col gap-4'>
        <div className='flex grow flex-col gap-1'>
          <label className='font-medium'>Sheets to Download</label>
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
            Each sheet will be downloaded as a separate PNG image.
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

        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='btn btn-secondary'>
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className='btn btn-primary'
            disabled={selectedSheets.length === 0}
          >
            Download
          </button>
        </div>
      </div>
    </Modal>
  );
}
