import { useEffect, useMemo, useState } from 'react';
import { duplicateSpace } from '../../lib';
import { useSpace } from '../../store';
import Modal from '../ui/Modal';

interface DuplicateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DuplicateSpaceModal({
  isOpen,
  onClose,
}: DuplicateSpaceModalProps) {
  const { space } = useSpace();
  const assumedFileName = useMemo(
    () =>
      space.title && space.title !== ''
        ? `${space.title} (Copy)`
        : 'New Space Title',
    [space.title],
  );
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen && fileName === undefined) {
      setFileName(assumedFileName);
    }
  }, [isOpen, assumedFileName, fileName, setFileName]);

  const handleDuplication = () => {
    duplicateSpace(space.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Duplicate Space'>
      <div className='flex flex-col gap-4'>
        <div className='flex grow flex-col gap-1'>
          <label className='font-medium'>Name of New Space</label>
          <input
            type='text'
            value={fileName ?? ''}
            onChange={(e) => setFileName(e.target.value)}
            placeholder={assumedFileName}
            className='dark:bg-surface-dark dark:text-surface-light grow rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          />
        </div>
        <small className='text-gray-500'>
          This will create a copy of the current space, including all its
          content and settings.
          <br />
          <span className='font-semibold'>
            Any unsaved changes will be lost.
          </span>
        </small>

        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='btn btn-secondary'>
            Cancel
          </button>
          <button
            onClick={handleDuplication}
            className='btn btn-primary'
            disabled={!fileName || fileName.trim() === ''}
          >
            Duplicate
          </button>
        </div>
      </div>
    </Modal>
  );
}
