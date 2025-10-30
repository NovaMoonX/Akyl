import { Handle, Position } from '@xyflow/react';
import { CheckIcon, EyeClosedIcon, EyeIcon, PencilIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import {
  formatCurrency,
  URL_PARAM_FORM,
  URL_PARAM_ID,
  type BudgetData,
  type Expense,
  type Income,
} from '../../lib';
import { useSpace } from '../../store';
import { join } from '../../utils';

interface BudgetNodeProps {
  data: BudgetData;
}

function BudgetNode({ data }: BudgetNodeProps) {
  const { budgetItemId } = data;
  const [currency, activeSheet] = useSpace(
    useShallow((state) => [
      state?.space?.config?.currency || 'USD',
      state?.space?.config?.activeSheet || 'all',
    ]),
  );
  const { updateIncome, updateExpense, toggleBudgetItemSelection, selectedBudgetItems } = useSpace(
    useShallow((state) => ({
      updateIncome: state.updateIncome,
      updateExpense: state.updateExpense,
      toggleBudgetItemSelection: state.toggleBudgetItemSelection,
      selectedBudgetItems: state.selectedBudgetItems,
    })),
  );
  const { getBudgetItem } = useBudget();
  const { item: budgetItem, type } = getBudgetItem(budgetItemId);
  const [, setSearchParams] = useSearchParams();

  const isSelected = selectedBudgetItems.includes(budgetItemId);

  // Check if item is hidden in current sheet context
  const isHidden = useMemo(() => {
    if (!budgetItem) return false;
    if (activeSheet === 'all') {
      return budgetItem.hidden ?? false;
    }
    return budgetItem.hiddenInSheets?.includes(activeSheet) ?? false;
  }, [budgetItem, activeSheet]);

  const toggleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!budgetItem) return;
    
    if (activeSheet === 'all') {
      // Toggle global hidden state
      const nowHidden = budgetItem.hidden ? false : true;
      if (type === 'income') {
        updateIncome(budgetItemId, { hidden: nowHidden });
      } else if (type === 'expense') {
        updateExpense(budgetItemId, { hidden: nowHidden });
      }
    } else {
      // Toggle per-sheet hidden state
      const hiddenInSheets = budgetItem.hiddenInSheets ?? [];
      const nowHidden = hiddenInSheets.includes(activeSheet);
      const updatedHiddenInSheets = nowHidden
        ? hiddenInSheets.filter((id) => id !== activeSheet)
        : [...hiddenInSheets, activeSheet];
      
      if (type === 'income') {
        updateIncome(budgetItemId, { hiddenInSheets: updatedHiddenInSheets });
      } else if (type === 'expense') {
        updateExpense(budgetItemId, { hiddenInSheets: updatedHiddenInSheets });
      }
    }
    setSearchParams({});
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchParams({
      [URL_PARAM_FORM]: type,
      [URL_PARAM_ID]: budgetItemId,
    });
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Only toggle selection if shift or ctrl/cmd is pressed
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      toggleBudgetItemSelection(budgetItemId);
    }
  };

  if (!budgetItem) {
    console.log('Budget item not found', budgetItemId);
    return null;
  }

  const getBudgetSuperText = () => {
    if (type === 'income') {
      const income = budgetItem as Income;
      return income.source;
    }
    if (type === 'expense') {
      const expense = budgetItem as Expense;
      return expense.subCategory
        ? `${expense.category} (${expense.subCategory})`
        : expense.category;
    }
    return '';
  };

  return (
    // Wrapper div for styling and hiding
    <div
      className={join(
        isHidden &&
          'bg-surface-light group dark:bg-surface-dark rounded-lg',
      )}
      onClick={handleNodeClick}
    >
      <div
        className={join(
          'bg-surface-light group dark:bg-surface-dark border-node-border relative flex max-w-[180px] min-w-[140px] flex-col rounded-lg border p-0 shadow-md',
          isHidden && 'opacity-40',
          isSelected && type === 'income' && 'ring-2 ring-green-500',
          isSelected && type === 'expense' && 'ring-2 ring-red-500',
        )}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className={join(
            'absolute -top-2 -right-2 rounded-full p-1 z-10',
            type === 'income' && 'bg-green-500',
            type === 'expense' && 'bg-red-500',
          )}>
            <CheckIcon className='size-3 text-white' />
          </div>
        )}

        {/* Super Text */}
        <small className='absolute top-0 left-0 line-clamp-2 max-w-full -translate-y-full opacity-80'>
          {getBudgetSuperText()}
        </small>

        {/* Header */}
        <div className='border-node-border flex items-start justify-between gap-1.5 border-b py-2 pr-2 pl-3'>
          <p className='flex-1 truncate font-semibold'>{budgetItem.label}</p>
          <button
            type='button'
            onClick={toggleHide}
            className='shrink-0 translate-x-0.5 -translate-y-0.5 opacity-0 group-hover:opacity-70 hover:opacity-90'
            aria-label={
              isHidden ? 'Unhide Budget Item' : 'Hide Budget Item'
            }
          >
            {isHidden ? (
              <EyeIcon className='size-3' />
            ) : (
              <EyeClosedIcon className='size-3' />
            )}
          </button>
          <button
            type='button'
            onClick={handleEdit}
            className='shrink-0 translate-x-0.5 -translate-y-0.5 opacity-0 group-hover:opacity-70 hover:opacity-90'
            aria-label='Edit Budget Item'
          >
            <PencilIcon className='size-3' />
          </button>
        </div>
        {/* Amount */}
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
  );
}

export default memo(BudgetNode);
