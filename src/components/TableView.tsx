import { ChevronDownIcon, ChevronRightIcon, EyeIcon, EyeClosedIcon } from 'lucide-react';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { CashFlowVerbiagePairs, formatCurrency } from '../lib';
import { useSpace } from '../store';
import useBudget from '../hooks/useBudget';

export default function TableView() {
  const [currency, cashFlowVerbiage, activeSheet] = useSpace(
    useShallow((state) => [
      state?.space?.config?.currency || 'USD',
      state?.space?.config?.cashFlowVerbiage || 'default',
      state?.space?.config?.activeSheet || 'all',
    ]),
  );

  const { updateIncome, updateExpense } = useSpace(
    useShallow((state) => ({
      updateIncome: state.updateIncome,
      updateExpense: state.updateExpense,
    })),
  );

  const {
    incomeBySource,
    expenseByCategory,
    incomesTotal,
    expensesTotal,
    incomesEnabledTotal,
    expensesEnabledTotal,
    incomesSourceHiddenMap,
    expensesCategoryHiddenMap,
  } = useBudget();

  const netIncome = incomesTotal - expensesTotal;
  const netEnabledIncome = incomesEnabledTotal - expensesEnabledTotal;

  // State for collapsible sections
  const [collapsedSources, setCollapsedSources] = useState<Set<string>>(
    new Set(),
  );
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );

  const toggleSource = (source: string) => {
    setCollapsedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(source)) {
        newSet.delete(source);
      } else {
        newSet.add(source);
      }
      return newSet;
    });
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Toggle hide/show for individual budget items
  const toggleItemHide = (itemId: string, type: 'income' | 'expense', currentlyHidden: boolean) => {
    if (activeSheet === 'all') {
      // Toggle global hidden state
      const nowHidden = !currentlyHidden;
      if (type === 'income') {
        updateIncome(itemId, { hidden: nowHidden });
      } else {
        updateExpense(itemId, { hidden: nowHidden });
      }
    } else {
      // Toggle per-sheet hidden state
      const item = type === 'income' 
        ? Object.values(incomeBySource).flatMap(s => s.items).find(i => i.id === itemId)
        : Object.values(expenseByCategory).flatMap(c => c.items).find(e => e.id === itemId);
      
      if (item) {
        const hiddenInSheets = item.hiddenInSheets ?? [];
        const nowHidden = hiddenInSheets.includes(activeSheet);
        const updatedHiddenInSheets = nowHidden
          ? hiddenInSheets.filter((id) => id !== activeSheet)
          : [...hiddenInSheets, activeSheet];
        
        if (type === 'income') {
          updateIncome(itemId, { hiddenInSheets: updatedHiddenInSheets });
        } else {
          updateExpense(itemId, { hiddenInSheets: updatedHiddenInSheets });
        }
      }
    }
  };

  // Toggle hide/show for all items in a source
  const toggleSourceHide = (source: string, currentlyHidden: boolean) => {
    const sourceIncomes = incomeBySource[source]?.items ?? [];
    const nowHidden = !currentlyHidden;
    
    sourceIncomes.forEach((income) => {
      if (activeSheet === 'all') {
        updateIncome(income.id, { hidden: nowHidden });
      } else {
        const hiddenInSheets = income.hiddenInSheets ?? [];
        const updatedHiddenInSheets = nowHidden
          ? [...hiddenInSheets, activeSheet]
          : hiddenInSheets.filter((id) => id !== activeSheet);
        updateIncome(income.id, { hiddenInSheets: updatedHiddenInSheets });
      }
    });
  };

  // Toggle hide/show for all items in a category
  const toggleCategoryHide = (category: string, currentlyHidden: boolean) => {
    const categoryExpenses = expenseByCategory[category]?.items ?? [];
    const nowHidden = !currentlyHidden;
    
    categoryExpenses.forEach((expense) => {
      if (activeSheet === 'all') {
        updateExpense(expense.id, { hidden: nowHidden });
      } else {
        const hiddenInSheets = expense.hiddenInSheets ?? [];
        const updatedHiddenInSheets = nowHidden
          ? [...hiddenInSheets, activeSheet]
          : hiddenInSheets.filter((id) => id !== activeSheet);
        updateExpense(expense.id, { hiddenInSheets: updatedHiddenInSheets });
      }
    });
  };

  // Check if an item is hidden
  const isItemHidden = (item: { hidden?: boolean; hiddenInSheets?: string[] }) => {
    if (activeSheet === 'all') {
      return item.hidden ?? false;
    }
    return item.hiddenInSheets?.includes(activeSheet) ?? false;
  };

  // Get verbiage labels
  const verbiage =
    CashFlowVerbiagePairs[cashFlowVerbiage] || CashFlowVerbiagePairs.default;
  const incomeLabel =
    verbiage.in.charAt(0).toUpperCase() + verbiage.in.slice(1);
  const expenseLabel =
    verbiage.out.charAt(0).toUpperCase() + verbiage.out.slice(1);

  return (
    <div className='absolute inset-x-0 top-16 bottom-20 z-20 overflow-auto bg-background-light p-4 dark:bg-background-dark sm:p-6'>
      <div className='mx-auto max-w-4xl pb-4'>
        <div className='bg-surface-light dark:bg-surface-dark mb-6 overflow-hidden rounded-lg shadow-lg'>
          {/* Income Section */}
          <div className='border-b border-gray-200 dark:border-gray-700'>
              <div className='bg-emerald-600 px-4 py-3 sm:px-6'>
                <h2 className='text-lg font-bold text-white sm:text-xl'>
                  {incomeLabel}
                </h2>
              </div>
              <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                {Object.entries(incomeBySource).map(([source, data]) => {
                  const isCollapsed = collapsedSources.has(source);
                  return (
                    <div
                      key={source}
                      className={
                        isCollapsed ? 'p-4 pb-2 sm:p-6 sm:pb-3' : 'p-4 sm:p-6'
                      }
                    >
                      {/* Source Header - Clickable */}
                      <div className={`flex items-center gap-2 ${!isCollapsed ? 'mb-3' : ''}`}>
                        <button
                          onClick={() => toggleSource(source)}
                          className='flex flex-1 items-center justify-between text-left hover:opacity-80'
                        >
                          <div className='flex items-center gap-2'>
                            {isCollapsed ? (
                              <ChevronRightIcon className='size-4 text-gray-600 dark:text-gray-400' />
                            ) : (
                              <ChevronDownIcon className='size-4 text-gray-600 dark:text-gray-400' />
                            )}
                            <h3 className='text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-100'>
                              {source}
                            </h3>
                          </div>
                          <div className='flex flex-col items-end'>
                            {data.enabledTotal !== data.total && (
                              <span className='text-xs text-gray-500 line-through sm:text-sm dark:text-gray-400'>
                                {formatCurrency(data.total, currency)}
                              </span>
                            )}
                            <span className='text-base font-semibold text-emerald-600 sm:text-lg dark:text-emerald-400'>
                              {formatCurrency(data.enabledTotal, currency)}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSourceHide(source, incomesSourceHiddenMap[source]);
                          }}
                          className='rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
                          aria-label={incomesSourceHiddenMap[source] ? 'Show all income items' : 'Hide all income items'}
                        >
                          {incomesSourceHiddenMap[source] ? (
                            <EyeClosedIcon className='size-4 text-gray-600 dark:text-gray-400' />
                          ) : (
                            <EyeIcon className='size-4 text-gray-600 dark:text-gray-400' />
                          )}
                        </button>
                      </div>
                      {/* Income Items - Collapsible */}
                      {!isCollapsed && (
                        <div className='space-y-2'>
                          {data.items.map((income) => {
                            const itemHidden = isItemHidden(income);
                            return (
                              <div
                                key={income.id}
                                className={`flex items-center justify-between gap-2 pl-4 text-sm sm:text-base ${income.disabled ? 'opacity-50' : ''}`}
                              >
                                <div className='flex-1'>
                                  <span className={`text-gray-700 dark:text-gray-300 ${itemHidden ? 'line-through' : ''}`}>
                                    {income.label}
                                  </span>
                                  {income.description && (
                                    <span className='ml-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400'>
                                      ({income.description})
                                    </span>
                                  )}
                                </div>
                                <span className={`ml-4 text-gray-600 dark:text-gray-400 ${itemHidden ? 'line-through' : ''}`}>
                                  {formatCurrency(income.amount, currency)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItemHide(income.id, 'income', itemHidden);
                                  }}
                                  className='rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  aria-label={itemHidden ? 'Show income item' : 'Hide income item'}
                                >
                                  {itemHidden ? (
                                    <EyeClosedIcon className='size-3.5 text-gray-500 dark:text-gray-400' />
                                  ) : (
                                    <EyeIcon className='size-3.5 text-gray-500 dark:text-gray-400' />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Total Income */}
              <div className='bg-emerald-50 px-4 py-3 sm:px-6 dark:bg-emerald-950/40'>
                <div className='flex items-center justify-between'>
                  <span className='text-base font-bold text-gray-800 sm:text-lg dark:text-gray-100'>
                    Total {incomeLabel}
                  </span>
                  <div className='flex flex-col items-end'>
                    {incomesEnabledTotal !== incomesTotal && (
                      <span className='text-xs text-gray-500 line-through sm:text-sm dark:text-gray-400'>
                        {formatCurrency(incomesTotal, currency)}
                      </span>
                    )}
                    <span className='text-base font-bold text-emerald-600 sm:text-lg dark:text-emerald-400'>
                      {formatCurrency(incomesEnabledTotal, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Section */}
            <div className='border-b border-gray-200 dark:border-gray-700'>
              <div className='bg-red-600 px-4 py-3 sm:px-6'>
                <h2 className='text-lg font-bold text-white sm:text-xl'>
                  {expenseLabel}s
                </h2>
              </div>
              <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                {Object.entries(expenseByCategory).map(([category, data]) => {
                  const isCollapsed = collapsedCategories.has(category);
                  return (
                    <div
                      key={category}
                      className={
                        isCollapsed ? 'p-4 pb-2 sm:p-6 sm:pb-3' : 'p-4 sm:p-6'
                      }
                    >
                      {/* Category Header - Clickable */}
                      <div className={`flex items-center gap-2 ${!isCollapsed ? 'mb-3' : ''}`}>
                        <button
                          onClick={() => toggleCategory(category)}
                          className='flex flex-1 items-center justify-between text-left hover:opacity-80'
                        >
                          <div className='flex items-center gap-2'>
                            {isCollapsed ? (
                              <ChevronRightIcon className='size-4 text-gray-600 dark:text-gray-400' />
                            ) : (
                              <ChevronDownIcon className='size-4 text-gray-600 dark:text-gray-400' />
                            )}
                            <h3 className='text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-100'>
                              {category}
                            </h3>
                          </div>
                          <div className='flex flex-col items-end'>
                            {data.enabledTotal !== data.total && (
                              <span className='text-xs text-gray-500 line-through sm:text-sm dark:text-gray-400'>
                                {formatCurrency(data.total, currency)}
                              </span>
                            )}
                            <span className='text-base font-semibold text-red-600 sm:text-lg dark:text-red-400'>
                              {formatCurrency(data.enabledTotal, currency)}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryHide(category, expensesCategoryHiddenMap[category]);
                          }}
                          className='rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
                          aria-label={expensesCategoryHiddenMap[category] ? 'Show all expense items' : 'Hide all expense items'}
                        >
                          {expensesCategoryHiddenMap[category] ? (
                            <EyeClosedIcon className='size-4 text-gray-600 dark:text-gray-400' />
                          ) : (
                            <EyeIcon className='size-4 text-gray-600 dark:text-gray-400' />
                          )}
                        </button>
                      </div>
                      {/* Expense Items - Collapsible */}
                      {!isCollapsed && (
                        <div className='space-y-2'>
                          {data.items.map((expense) => {
                            const itemHidden = isItemHidden(expense);
                            return (
                              <div
                                key={expense.id}
                                className={`flex items-center justify-between gap-2 pl-4 text-sm sm:text-base ${expense.disabled ? 'opacity-50' : ''}`}
                              >
                                <div className='flex-1'>
                                  <span className={`text-gray-700 dark:text-gray-300 ${itemHidden ? 'line-through' : ''}`}>
                                    {expense.label}
                                  </span>
                                  {expense.description && (
                                    <span className='ml-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400'>
                                      ({expense.description})
                                    </span>
                                  )}
                                </div>
                                <span className={`ml-4 text-gray-600 dark:text-gray-400 ${itemHidden ? 'line-through' : ''}`}>
                                  {formatCurrency(expense.amount, currency)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItemHide(expense.id, 'expense', itemHidden);
                                  }}
                                  className='rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  aria-label={itemHidden ? 'Show expense item' : 'Hide expense item'}
                                >
                                  {itemHidden ? (
                                    <EyeClosedIcon className='size-3.5 text-gray-500 dark:text-gray-400' />
                                  ) : (
                                    <EyeIcon className='size-3.5 text-gray-500 dark:text-gray-400' />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Total Expenses */}
              <div className='bg-red-50 px-4 py-3 sm:px-6 dark:bg-red-950/40'>
                <div className='flex items-center justify-between'>
                  <span className='text-base font-bold text-gray-800 sm:text-lg dark:text-gray-100'>
                    Total {expenseLabel}s
                  </span>
                  <div className='flex flex-col items-end'>
                    {expensesEnabledTotal !== expensesTotal && (
                      <span className='text-xs text-gray-500 line-through sm:text-sm dark:text-gray-400'>
                        {formatCurrency(expensesTotal, currency)}
                      </span>
                    )}
                    <span className='text-base font-bold text-red-600 sm:text-lg dark:text-red-400'>
                      {formatCurrency(expensesEnabledTotal, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Income / Grand Total */}
            <div
              className={`px-4 py-4 sm:px-6 sm:py-5 ${
                netEnabledIncome >= 0
                  ? 'bg-emerald-100 dark:bg-emerald-950/50'
                  : 'bg-red-100 dark:bg-red-950/50'
              }`}
            >
              <div className='flex items-center justify-between'>
                <span className='text-lg font-bold text-gray-900 sm:text-xl dark:text-gray-50'>
                  Net {incomeLabel}
                </span>
                <div className='flex flex-col items-end'>
                  {netEnabledIncome !== netIncome && (
                    <span className='text-sm text-gray-500 line-through sm:text-base dark:text-gray-400'>
                      {formatCurrency(netIncome, currency)}
                    </span>
                  )}
                  <span
                    className={`text-lg font-bold sm:text-xl ${
                      netEnabledIncome >= 0
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {formatCurrency(netEnabledIncome, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
