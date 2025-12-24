import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import JSZip from 'jszip';
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
  const space = useSpace(useShallow((state) => state?.space));
  const sheets = useSpace(useShallow((state) => state?.space?.sheets));
  const [selectedSheets, setSelectedSheets] = useState<string[]>(['all']);
  const { downloadSheet, captureSheetImage } = useDownloadPng();

  const handleDownload = async () => {
    const errors: string[] = [];
    
    // If only one sheet is selected, download directly without zip
    if (selectedSheets.length === 1) {
      try {
        await downloadSheet(selectedSheets[0]);
      } catch (error) {
        const sheetName = selectedSheets[0] === 'all' ? 'All Items' : sheets?.find(s => s.id === selectedSheets[0])?.name || selectedSheets[0];
        errors.push(sheetName);
        console.error(`Failed to download ${sheetName}:`, error);
      }
    } else {
      // Multiple sheets: create a zip file
      const zip = new JSZip();
      
      for (const sheetId of selectedSheets) {
        try {
          const { filename, dataUrl } = await captureSheetImage(sheetId);
          // Convert data URL to blob
          const base64Data = dataUrl.split(',')[1];
          zip.file(filename, base64Data, { base64: true });
        } catch (error) {
          const sheetName = sheetId === 'all' ? 'All Items' : sheets?.find(s => s.id === sheetId)?.name || sheetId;
          errors.push(sheetName);
          console.error(`Failed to capture ${sheetName}:`, error);
        }
      }
      
      // Generate and download the zip file
      try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = Date.now();
        a.download = `${space?.title || 'budget'}-images-${timestamp}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to create zip file:', error);
        alert('Failed to create zip file');
      }
    }
    
    if (errors.length > 0) {
      alert(`Failed to download images for: ${errors.join(', ')}`);
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
            {selectedSheets.length > 1
              ? 'Multiple sheets will be downloaded as a ZIP file.'
              : 'Each sheet will be downloaded as a separate PNG image.'}
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
