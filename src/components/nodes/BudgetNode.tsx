import { Handle, Position } from '@xyflow/react';
import { Maximize2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import { formatCurrency, type BudgetData } from '../../lib';
import { useSpace } from '../../store';
import { join } from '../../utils';

interface BudgetNodeProps {
  data: BudgetData;
}

function BudgetNode({ data }: BudgetNodeProps) {
  const { budgetItemId } = data;
  const currency = useSpace(
    useShallow((state) => state?.space?.config?.currency || 'USD'),
  );
  const { getBudgetItem } = useBudget();
  const { item: budgetItem, type } = getBudgetItem(budgetItemId);
  const [isExpanded] = useState(false);

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
      <div className='border-node-border flex items-start justify-between gap-3 border-b py-2 pr-2 pl-3'>
        <p className='flex-1 truncate font-semibold'>{budgetItem.label}</p>
        <button
          type='button'
          onClick={handleOnExpand}
          className='shrink-0 opacity-60 hover:opacity-80'
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <Maximize2Icon className='size-4' />
        </button>
      </div>
      {/* Amount */}
      {!isExpanded && (
        <div className='flex flex-col items-center px-4 py-3'>
          <span
            className={join(
              'text-center text-lg font-bold',
              type === 'income' && 'text-inflow/80',
              type === 'expense' && 'text-outflow/80',
            )}
          >
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
