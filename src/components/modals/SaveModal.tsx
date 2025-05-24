import { useState } from 'react';
import { useSpace } from '../../store';
import Checkbox from '../ui/Checkbox';
import Modal from '../ui/Modal';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, continuous: boolean) => void;
}

export default function SaveModal({ isOpen, onClose, onSave }: SaveModalProps) {
  const { space } = useSpace();
  const [fileName, setFileName] = useState(
    (space.title || '').replace(/\s+/g, '-').toLowerCase(), // Convert to kebab-case
  );
  const [continuous, setContinuous] = useState(false);

  const handleSave = () => {
    onSave(fileName, continuous);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Save Space'>
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
            <p>.akyl</p>
          </div>
        </div>

        <Checkbox
          isChecked={continuous}
          onChange={setContinuous}
          label='Continuously save changes'
          description='Automatically save future changes to the file.'
          className='ml-1'
        />
        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='btn btn-secondary'>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='btn btn-primary'
            disabled={!fileName.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
