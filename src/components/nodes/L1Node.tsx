import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { formatCurrency, type L1Data } from '../../lib';
import { useSpace } from '../../store';
import { join } from '../../utils';

interface L1NodeProps {
  data: L1Data;
}

function L1Node({ data }: L1NodeProps) {
  const { label, amount, type } = data;
  const currency = useSpace(
    useShallow((state) => state?.space?.config?.currency || 'USD'),
  );

  return (
    <div className='bg-surface-light dark:bg-surface-dark border-node-border flex max-w-[200px] min-w-[120px] flex-col items-center gap-1 rounded-lg border p-4 shadow-md'>
      <p className='text-center text-lg leading-snug font-semibold'>{label}</p>
      <span
        className={join(
          'text-center text-lg font-bold',
          type === 'income' && 'text-inflow/80',
          type === 'expense' && 'text-outflow/80',
        )}
      >
        {formatCurrency(amount, currency)}
      </span>

      <Handle type='target' position={Position.Top} className='invisible' />
      <Handle type='source' position={Position.Bottom} className='invisible' />
    </div>
  );
}

export default memo(L1Node);
