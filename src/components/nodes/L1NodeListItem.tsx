import { EyeClosedIcon, EyeIcon, PencilIcon } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import {
  formatCurrency,
  URL_PARAM_FORM,
  URL_PARAM_ID,
  type BudgetData,
} from '../../lib';
import { useSpace } from '../../store';
import { join } from '../../utils';

interface L1NodeListItemProps {
  data: BudgetData;
}

export default function L1NodeListItem({ data }: L1NodeListItemProps) {
  const { budgetItemId } = data;
  const currency = useSpace(
    useShallow((state) => state?.space?.config?.currency || 'USD'),
  );
  const { updateIncome, updateExpense } = useSpace();
  const { getBudgetItem } = useBudget();
  const { item: budgetItem, type } = getBudgetItem(budgetItemId);
  const [, setSearchParams] = useSearchParams();

  const toggleHide = () => {
    const nowHidden = budgetItem?.hidden ? false : true;
    if (type === 'income') {
      updateIncome(budgetItemId, { hidden: nowHidden });
    } else if (type === 'expense') {
      updateExpense(budgetItemId, { hidden: nowHidden });
    }
    setSearchParams({});
  };

  const handleEdit = () => {
    setSearchParams({
      [URL_PARAM_FORM]: type,
      [URL_PARAM_ID]: budgetItemId,
    });
  };

  if (!budgetItem) {
    return null;
  }

  return (
    <div
      className={join(
        'border-node-border flex max-w-[300px] items-center gap-3 border-b px-3 py-2',
        budgetItem?.hidden &&
          'bg-surface-light dark:bg-surface-dark opacity-40',
      )}
    >
      {/* Label and super text */}
      <div className='min-w-0 flex-1'>
        <div className='truncate font-semibold' title={budgetItem.label}>
          {budgetItem.label}
        </div>
      </div>
      {/* Amount */}
      <div
        className={join(
          'min-w-[80px] text-right font-semibold',
          type === 'income' && 'text-inflow/80',
          type === 'expense' && 'text-outflow/80',
        )}
      >
        {formatCurrency(budgetItem.amount, currency)}
      </div>
      {/* Actions */}
      <button
        type='button'
        onClick={toggleHide}
        className='ml-2 p-1 opacity-70 hover:opacity-100'
        aria-label={
          budgetItem?.hidden ? 'Unhide Budget Item' : 'Hide Budget Item'
        }
      >
        {budgetItem?.hidden ? (
          <EyeIcon className='size-4' />
        ) : (
          <EyeClosedIcon className='size-4' />
        )}
      </button>
      <button
        type='button'
        onClick={handleEdit}
        className='ml-1 p-1 opacity-70 hover:opacity-100'
        aria-label='Edit Budget Item'
      >
        <PencilIcon className='size-4' />
      </button>
    </div>
  );
}
