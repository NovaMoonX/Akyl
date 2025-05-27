import { Handle, Position } from '@xyflow/react';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { memo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import { formatCurrency, type BudgetData } from '../../lib';
import { useSpace } from '../../store';

interface BudgetNodeProps {
  data: BudgetData;
}

function BudgetNode({ data }: BudgetNodeProps) {
  const { budgetItemId } = data;
  const currency = useSpace(
    useShallow((state) => state?.space?.config?.currency || 'USD'),
  );
  const { getBudgetItem } = useBudget();
  const budgetItem = getBudgetItem(budgetItemId);
  const [isExpanded] = useState(false);

  const handleOnEdit = () => {
    console.log('Edit button clicked');
  };

  const handleOnExpand = () => {
    console.log('Expand button clicked');
  };

  if (!budgetItem) {
    console.log('Budget item not found', budgetItemId);
    return null;
  }

  return (
    <div className='bg-surface-light dark:bg-surface-dark border-node-border flex max-w-[220px] min-w-[140px] flex-col rounded-lg border p-0 shadow-md'>
      {/* Header */}
      <div className='border-node-border flex items-center justify-between gap-1 border-b px-3 py-2'>
        <span className='truncate text-base font-semibold'>
          {budgetItem.label}
        </span>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={handleOnEdit}
            className='hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded p-1'
            aria-label='Edit'
          >
            <Pencil className='size-4 text-gray-500 dark:text-gray-400' />
          </button>
          <button
            type='button'
            onClick={handleOnExpand}
            className='hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded p-1'
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className='size-4 text-gray-500 dark:text-gray-400' />
            ) : (
              <ChevronDown className='size-4 text-gray-500 dark:text-gray-400' />
            )}
          </button>
        </div>
      </div>
      {/* Amount */}
      {!isExpanded && (
        <div className='flex flex-col items-center px-4 py-3'>
          <span className='text-center text-lg font-bold'>
            {formatCurrency(budgetItem.amount, currency)}
          </span>
        </div>
      )}
      <Handle type='target' position={Position.Top} className='invisible' />
      <Handle type='source' position={Position.Bottom} className='invisible' />
    </div>
  );
}

export default memo(BudgetNode);
