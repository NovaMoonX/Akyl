import Modal from '../ui/Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  title = 'Are you sure?',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p>{message}</p>
      <div className='mt-4 flex justify-end gap-2'>
        <button onClick={onCancel} className='btn btn-secondary'>
          {cancelText}
        </button>
        <button onClick={onConfirm} className='btn btn-primary'>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
