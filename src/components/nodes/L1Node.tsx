import { Handle, Position } from '@xyflow/react';
import { EyeClosedIcon, EyeIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import { formatCurrency, type L1Data } from '../../lib';
import { useSpace } from '../../store';
import { join } from '../../utils';
import L1NodeListItem from './L1NodeListItem';

interface L1NodeProps {
  data: L1Data;
}

function L1Node({ data }: L1NodeProps) {
  const { label, amount, type } = data;
  const [currency, listExpenses] = useSpace(
    useShallow((state) => [
      state?.space?.config?.currency || 'USD',
      state?.space?.config?.listExpenses,
    ]),
  );
  const { updateIncome, updateExpense } = useSpace();
  const {
    incomesSourceHiddenMap,
    expensesCategoryHiddenMap,
    incomeBySource,
    expenseByCategory,
  } = useBudget();

  const isHidden = useMemo(() => {
    if (type === 'income') {
      return incomesSourceHiddenMap[label];
    }
    return expensesCategoryHiddenMap[label];
  }, [type, label, incomesSourceHiddenMap, expensesCategoryHiddenMap]);

  const toggleHide = () => {
    const nowHidden = isHidden ? false : true;

    if (type === 'income') {
      const sourceIncomes = incomeBySource[label]?.items ?? [];
      sourceIncomes.forEach((income) => {
        updateIncome(income.id, { hidden: nowHidden });
      });
      return;
    }

    const categoryExpenses = expenseByCategory[label]?.items ?? [];
    categoryExpenses.forEach((expense) => {
      updateExpense(expense.id, { hidden: nowHidden });
    });
  };

  return (
    // Wrapper div for styling and hiding
    <div>
      <div
        className={join(
          isHidden &&
            'bg-surface-light group dark:bg-surface-dark max-w-fit rounded-lg',
        )}
      >
        <div
          className={join(
            'group bg-surface-light dark:bg-surface-dark border-node-border relative flex max-w-[160px] min-w-[120px] flex-col items-center gap-1 rounded-lg border p-4 shadow-md',
            isHidden && 'opacity-40',
          )}
        >
          <p className='text-center text-lg leading-snug font-semibold'>
            {label}
          </p>

          <button
            type='button'
            onClick={toggleHide}
            className='absolute top-0.5 right-0.5 shrink-0 p-1 opacity-0 group-hover:opacity-70 hover:opacity-90'
            aria-label={
              isHidden ? `Unhide all ${type} items` : `Hide all ${type} items`
            }
          >
            {isHidden ? (
              <EyeIcon className='size-3' />
            ) : (
              <EyeClosedIcon className='size-3' />
            )}
          </button>

          <span
            className={join(
              'text-center text-lg font-bold',
              type === 'income' && 'text-inflow/80',
              type === 'expense' && 'text-outflow/80',
            )}
          >
            {formatCurrency(amount, currency)}
          </span>

          {/* move handle inward for smoother edge animation */}
          <Handle
            type='target'
            position={Position.Top}
            className='invisible translate-y-3'
          />
          <Handle
            type='source'
            position={Position.Bottom}
            className='invisible -translate-y-3'
          />
        </div>
      </div>

      {listExpenses && type === 'expense' && (
        <div>
          {expenseByCategory[label]?.items.map((expense) => (
            <L1NodeListItem
              key={expense.id}
              data={{
                budgetItemId: expense.id,
                hidden: expense.hidden,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(L1Node);
