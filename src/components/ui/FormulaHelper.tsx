import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import { useSpace } from '../../store';

interface FormulaHelperProps {
  currentItemId?: string;
  onInsert: (text: string) => void;
}

export default function FormulaHelper({ currentItemId, onInsert }: FormulaHelperProps) {
  const { incomeSources, expenseCategories, incomesInSpace, expensesInSpace } = useBudget();
  const [activeSheet] = useSpace(
    useShallow((state) => [
      state?.space?.config?.activeSheet || 'all',
    ]),
  );

  // Filter items for the current sheet
  const availableIncomes = useMemo(() => {
    if (!incomesInSpace) return [];
    if (activeSheet === 'all') return incomesInSpace;
    return incomesInSpace.filter(income => 
      !income.sheets || income.sheets.length === 0 || income.sheets.includes(activeSheet)
    );
  }, [incomesInSpace, activeSheet]);

  const availableExpenses = useMemo(() => {
    if (!expensesInSpace) return [];
    if (activeSheet === 'all') return expensesInSpace;
    return expensesInSpace.filter(expense => 
      !expense.sheets || expense.sheets.length === 0 || expense.sheets.includes(activeSheet)
    );
  }, [expensesInSpace, activeSheet]);

  return (
    <div className='rounded border border-gray-300 dark:border-gray-700 p-3 text-sm max-h-96 overflow-y-auto touch-pan-y'>
      <div className='font-medium mb-2'>Formula Helper</div>
      <div className='text-xs text-gray-600 dark:text-gray-400 mb-3'>
        Click to insert references into your formula
      </div>

      {/* Sources */}
      {incomeSources.length > 0 && (
        <div className='mb-3'>
          <div className='text-xs font-medium mb-1 text-gray-700 dark:text-gray-300'>Sources</div>
          <div className='flex flex-wrap gap-1'>
            {incomeSources.map((source) => (
              <button
                key={source}
                type='button'
                onClick={() => onInsert(`@source:${source}`)}
                className='px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 text-xs'
              >
                {source}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {expenseCategories.length > 0 && (
        <div className='mb-3'>
          <div className='text-xs font-medium mb-1 text-gray-700 dark:text-gray-300'>Categories</div>
          <div className='flex flex-wrap gap-1'>
            {expenseCategories.map((category) => (
              <button
                key={category}
                type='button'
                onClick={() => onInsert(`@category:${category}`)}
                className='px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs'
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget Items */}
      {(availableIncomes.length > 0 || availableExpenses.length > 0) && (
        <div className='mb-3'>
          <div className='text-xs font-medium mb-1 text-gray-700 dark:text-gray-300'>Budget Items</div>
          <div className='max-h-32 overflow-y-auto'>
            {availableIncomes.filter(inc => inc.id !== currentItemId).map((income) => (
              <button
                key={income.id}
                type='button'
                onClick={() => onInsert(`@item:${income.id}`)}
                className='block w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-xs mb-1'
                title={`Income: ${income.label}`}
              >
                <span className='text-green-600 dark:text-green-400'>📈</span> {income.label}
              </button>
            ))}
            {availableExpenses.filter(exp => exp.id !== currentItemId).map((expense) => (
              <button
                key={expense.id}
                type='button'
                onClick={() => onInsert(`@item:${expense.id}`)}
                className='block w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-xs mb-1'
                title={`Expense: ${expense.label}`}
              >
                <span className='text-red-600 dark:text-red-400'>📉</span> {expense.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Operators */}
      <div>
        <div className='text-xs font-medium mb-1 text-gray-700 dark:text-gray-300'>Operators</div>
        <div className='flex gap-1'>
          {['+', '-', '*', '/', '(', ')'].map((op) => (
            <button
              key={op}
              type='button'
              onClick={() => onInsert(op)}
              className='px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs font-mono'
            >
              {op}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
