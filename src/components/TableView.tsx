import { useShallow } from 'zustand/shallow';
import { formatCurrency } from '../lib';
import { useSpace } from '../store';
import useBudget from '../hooks/useBudget';

export default function TableView() {
  const currency = useSpace(
    useShallow((state) => state?.space?.config?.currency || 'USD'),
  );

  const {
    incomeBySource,
    expenseByCategory,
    incomesTotal,
    expensesTotal,
  } = useBudget();

  const netIncome = incomesTotal - expensesTotal;

  return (
    <div className='absolute inset-0 z-20 h-full w-full overflow-auto bg-background-light p-4 dark:bg-background-dark sm:p-6'>
      <div className='mx-auto max-w-4xl'>
        <div className='bg-surface-light dark:bg-surface-dark mb-6 overflow-hidden rounded-lg shadow-lg'>
          {/* Income Section */}
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <div className='bg-emerald-600 px-4 py-3 sm:px-6'>
              <h2 className='text-lg font-bold text-white sm:text-xl'>
                Income
              </h2>
            </div>
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              {Object.entries(incomeBySource).map(([source, data]) => (
                <div key={source} className='p-4 sm:p-6'>
                  {/* Source Header */}
                  <div className='mb-3 flex items-center justify-between'>
                    <h3 className='text-base font-semibold text-gray-800 dark:text-gray-100 sm:text-lg'>
                      {source}
                    </h3>
                    <span className='text-base font-semibold text-emerald-600 dark:text-emerald-400 sm:text-lg'>
                      {formatCurrency(data.total, currency)}
                    </span>
                  </div>
                  {/* Income Items */}
                  <div className='space-y-2'>
                    {data.items.map((income) => (
                      <div
                        key={income.id}
                        className='flex items-center justify-between pl-4 text-sm sm:text-base'
                      >
                        <div className='flex-1'>
                          <span className='text-gray-700 dark:text-gray-300'>
                            {income.label}
                          </span>
                          {income.description && (
                            <span className='ml-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm'>
                              ({income.description})
                            </span>
                          )}
                        </div>
                        <span className='ml-4 text-gray-600 dark:text-gray-400'>
                          {formatCurrency(income.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Total Income */}
            <div className='bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20 sm:px-6'>
              <div className='flex items-center justify-between'>
                <span className='text-base font-bold text-gray-800 dark:text-gray-100 sm:text-lg'>
                  Total Income
                </span>
                <span className='text-base font-bold text-emerald-600 dark:text-emerald-400 sm:text-lg'>
                  {formatCurrency(incomesTotal, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Expense Section */}
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <div className='bg-red-600 px-4 py-3 sm:px-6'>
              <h2 className='text-lg font-bold text-white sm:text-xl'>
                Expenses
              </h2>
            </div>
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              {Object.entries(expenseByCategory).map(([category, data]) => (
                <div key={category} className='p-4 sm:p-6'>
                  {/* Category Header */}
                  <div className='mb-3 flex items-center justify-between'>
                    <h3 className='text-base font-semibold text-gray-800 dark:text-gray-100 sm:text-lg'>
                      {category}
                    </h3>
                    <span className='text-base font-semibold text-red-600 dark:text-red-400 sm:text-lg'>
                      {formatCurrency(data.total, currency)}
                    </span>
                  </div>
                  {/* Expense Items */}
                  <div className='space-y-2'>
                    {data.items.map((expense) => (
                      <div
                        key={expense.id}
                        className='flex items-center justify-between pl-4 text-sm sm:text-base'
                      >
                        <div className='flex-1'>
                          <span className='text-gray-700 dark:text-gray-300'>
                            {expense.label}
                          </span>
                          {expense.description && (
                            <span className='ml-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm'>
                              ({expense.description})
                            </span>
                          )}
                        </div>
                        <span className='ml-4 text-gray-600 dark:text-gray-400'>
                          {formatCurrency(expense.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Total Expenses */}
            <div className='bg-red-50 px-4 py-3 dark:bg-red-900/20 sm:px-6'>
              <div className='flex items-center justify-between'>
                <span className='text-base font-bold text-gray-800 dark:text-gray-100 sm:text-lg'>
                  Total Expenses
                </span>
                <span className='text-base font-bold text-red-600 dark:text-red-400 sm:text-lg'>
                  {formatCurrency(expensesTotal, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Income / Grand Total */}
          <div
            className={`px-4 py-4 sm:px-6 sm:py-5 ${
              netIncome >= 0
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            <div className='flex items-center justify-between'>
              <span className='text-lg font-bold text-gray-900 dark:text-gray-50 sm:text-xl'>
                Net Income
              </span>
              <span
                className={`text-lg font-bold sm:text-xl ${
                  netIncome >= 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {formatCurrency(netIncome, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
