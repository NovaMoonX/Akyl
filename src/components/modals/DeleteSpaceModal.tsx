import { useAuth } from '../../contexts/AuthContext';
import { deleteSpace } from '../../lib';
import ConfirmationModal, {
  type ConfirmationModalProps,
} from './ConfirmationModal';

interface DeleteSpaceModalProps
  extends Omit<
    ConfirmationModalProps,
    'title' | 'message' | 'onConfirm' | 'onCancel'
  > {
  spaceId?: string;
  onDelete?: (spaceId: string) => void;
}

export default function DeleteSpaceModal({
  spaceId,
  onDelete,
  ...confirmationModalProps
}: DeleteSpaceModalProps) {
  const { currentUser } = useAuth();
  const handleConfirm = async () => {
    if (spaceId) {
      await deleteSpace(spaceId, currentUser?.uid);
      confirmationModalProps.onClose();
      onDelete?.(spaceId);
    }
  };

  if (!spaceId) {
    return <></>;
  }

  return (
    <ConfirmationModal
      {...confirmationModalProps}
      onCancel={confirmationModalProps.onClose}
      title='Delete Space'
      message='Are you sure you want to delete this space?'
      onConfirm={handleConfirm}
    />
  );
}
