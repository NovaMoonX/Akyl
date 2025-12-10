import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  BaseExpenseCategories,
  BaseIncomeTypes,
  DEFAULT_TIME_WINDOW,
  getBudgetItemWindowAmount,
  type Expense,
  type Income,
} from '../lib';
import type { BudgetType } from '../lib/node.types';
import { useSpace } from '../store';

export default function useBudget() {
  const [incomesInSpace, expensesInSpace, spaceTimeWindow, activeSheet, sheets] = useSpace(
    useShallow((state) => [
      state?.space?.incomes,
      state?.space?.expenses,
      state?.space?.config?.timeWindow,
      state?.space?.config?.activeSheet || 'all',
      state?.space?.sheets,
    ]),
  );

  // Get the active sheet object for per-sheet settings
  const activeSheetObj = useMemo(() => {
    if (activeSheet !== 'all' && sheets) {
      return sheets.find((s) => s.id === activeSheet);
    }
    return null;
  }, [activeSheet, sheets]);

  // Use per-sheet time window if available, otherwise fall back to global
  const timeWindow = useMemo(() => {
    if (activeSheetObj?.timeWindow) {
      return activeSheetObj.timeWindow;
    }
    return spaceTimeWindow ?? DEFAULT_TIME_WINDOW;
  }, [activeSheetObj, spaceTimeWindow]);

  const incomes = useMemo(() => {
    let items = incomesInSpace ?? [];
    
    // Filter by active sheet
    if (activeSheet && activeSheet !== 'all') {
      items = items.filter((income) => 
        income.sheets?.includes(activeSheet) ?? false
      );
    }
    
    const itemsAdjustedAmount = items.map((income) => {
      const adjustedAmount = getBudgetItemWindowAmount(
        income.amount,
        income.cadence,
        timeWindow,
      );
      return { ...income, amount: adjustedAmount, originalAmount: income.amount };
    });
    itemsAdjustedAmount.sort((a, b) => b.amount - a.amount);
    return itemsAdjustedAmount;
  }, [incomesInSpace, timeWindow, activeSheet]);

  const expenses = useMemo(() => {
    let items = expensesInSpace ?? [];
    
    // Filter by active sheet
    if (activeSheet && activeSheet !== 'all') {
      items = items.filter((expense) => 
        expense.sheets?.includes(activeSheet) ?? false
      );
    }
    
    const itemsAdjustedAmount = items.map((expense) => {
      const adjustedAmount = getBudgetItemWindowAmount(
        expense.amount,
        expense.cadence,
        timeWindow,
      );
      return { ...expense, amount: adjustedAmount, originalAmount: expense.amount };
    });
    itemsAdjustedAmount.sort((a, b) => b.amount - a.amount);
    return itemsAdjustedAmount;
  }, [expensesInSpace, timeWindow, activeSheet]);

  const incomeSources = useMemo(() => {
    const sourceCount = new Map<string, number>();
    for (const income of incomes) {
      if (income.source) {
        sourceCount.set(
          income.source,
          (sourceCount.get(income.source) || 0) + 1,
        );
      }
    }
    return Array.from(sourceCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([source]) => source);
  }, [incomes]);

  const expenseSubCategoriesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const expense of expenses) {
      if (expense.category && expense.subCategory) {
        if (!map[expense.category]) {
          map[expense.category] = [];
        }
        // Only add if not already present
        if (!map[expense.category].includes(expense.subCategory)) {
          map[expense.category].push(expense.subCategory);
        }
      }
    }
    return map;
  }, [expenses]);

  const incomeTypes = useMemo(() => {
    const types = new Set<string>(BaseIncomeTypes);
    for (const income of incomes) {
      if (income.type) {
        types.add(income.type);
      }
    }
    return Array.from(types).sort();
  }, [incomes]);

  const expenseCategories = useMemo(() => {
    const categories = new Set<string>(BaseExpenseCategories);
    for (const expense of expenses) {
      if (expense.category) {
        categories.add(expense.category);
      }
    }
    return Array.from(categories).sort();
  }, [expenses]);

  const incomesMap = useMemo(() => {
    return incomes.reduce(
      (acc, income) => {
        acc[income.id] = income;
        return acc;
      },
      {} as Record<string, (typeof incomes)[0]>,
    );
  }, [incomes]);

  const expensesMap = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        acc[expense.id] = expense;
        return acc;
      },
      {} as Record<string, (typeof expenses)[0]>,
    );
  }, [expenses]);

  // Group incomes by source and calculate totals
  // Sort sources by total amount descending
  const incomeBySource = useMemo(() => {
    const map = incomes.reduce(
      (acc, income) => {
        if (income.source) {
          if (!acc[income.source]) {
            acc[income.source] = { total: 0, items: [], completeTotal: 0, enabledTotal: 0 };
          }
          acc[income.source].items.push(income);
          acc[income.source].completeTotal += income.amount;
          
          // Check per-sheet hidden state
          const isHidden = activeSheet && activeSheet !== 'all'
            ? income.hiddenInSheets?.includes(activeSheet) ?? false
            : income.hidden ?? false;
          
          if (!isHidden) {
            // only include non-hidden incomes
            acc[income.source].total += income.amount;
            
            // Track enabled-only total (non-hidden and non-disabled)
            if (!income.disabled) {
              acc[income.source].enabledTotal += income.amount;
            }
          }
        }
        return acc;
      },
      {} as Record<
        string,
        { total: number; items: Income[]; completeTotal: number; enabledTotal: number }
      >,
    );

    return Object.entries(map)
      .sort((a, b) => b[1].completeTotal - a[1].completeTotal)
      .reduce(
        (acc, [source, data]) => {
          acc[source] = { total: data.total, items: data.items, enabledTotal: data.enabledTotal };
          return acc;
        },
        {} as Record<string, { total: number; items: Income[]; enabledTotal: number }>,
      );
  }, [incomes, activeSheet]);

  // Group expenses by category and calculate totals
  // Sort categories by total amount descending
  const expenseByCategory = useMemo(() => {
    const map = expenses.reduce(
      (acc, expense) => {
        if (expense.category) {
          if (!acc[expense.category]) {
            acc[expense.category] = { total: 0, items: [], completeTotal: 0, enabledTotal: 0 };
          }
          acc[expense.category].items.push(expense);
          acc[expense.category].completeTotal += expense.amount;
          
          // Check per-sheet hidden state
          const isHidden = activeSheet && activeSheet !== 'all'
            ? expense.hiddenInSheets?.includes(activeSheet) ?? false
            : expense.hidden ?? false;
          
          if (!isHidden) {
            // only include non-hidden expenses
            acc[expense.category].total += expense.amount;
            
            // Track enabled-only total (non-hidden and non-disabled)
            if (!expense.disabled) {
              acc[expense.category].enabledTotal += expense.amount;
            }
          }
        }
        return acc;
      },
      {} as Record<
        string,
        { total: number; items: Expense[]; completeTotal: number; enabledTotal: number }
      >,
    );

    return Object.entries(map)
      .sort((a, b) => b[1].completeTotal - a[1].completeTotal)
      .reduce(
        (acc, [category, data]) => {
          acc[category] = {
            total: data.total,
            items: data.items,
            enabledTotal: data.enabledTotal,
          };
          return acc;
        },
        {} as Record<string, { total: number; items: Expense[]; enabledTotal: number }>,
      );
  }, [expenses, activeSheet]);

  const incomesTotal = useMemo(() => {
    return incomes.reduce((total, income) => {
      // Check per-sheet hidden state
      const isHidden = activeSheet && activeSheet !== 'all'
        ? income.hiddenInSheets?.includes(activeSheet) ?? false
        : income.hidden ?? false;
      
      if (isHidden) {
        return total; // only include non-hidden incomes
      }
      return total + income.amount;
    }, 0);
  }, [incomes, activeSheet]);

  const incomesEnabledTotal = useMemo(() => {
    return incomes.reduce((total, income) => {
      // Check per-sheet hidden state
      const isHidden = activeSheet && activeSheet !== 'all'
        ? income.hiddenInSheets?.includes(activeSheet) ?? false
        : income.hidden ?? false;
      
      if (isHidden || income.disabled) {
        return total; // only include non-hidden and non-disabled incomes
      }
      return total + income.amount;
    }, 0);
  }, [incomes, activeSheet]);

  const expensesTotal = useMemo(() => {
    return expenses.reduce((total, expense) => {
      // Check per-sheet hidden state
      const isHidden = activeSheet && activeSheet !== 'all'
        ? expense.hiddenInSheets?.includes(activeSheet) ?? false
        : expense.hidden ?? false;
      
      if (isHidden) {
        return total; // only include non-hidden expenses
      }
      return total + expense.amount;
    }, 0);
  }, [expenses, activeSheet]);

  const expensesEnabledTotal = useMemo(() => {
    return expenses.reduce((total, expense) => {
      // Check per-sheet hidden state
      const isHidden = activeSheet && activeSheet !== 'all'
        ? expense.hiddenInSheets?.includes(activeSheet) ?? false
        : expense.hidden ?? false;
      
      if (isHidden || expense.disabled) {
        return total; // only include non-hidden and non-disabled expenses
      }
      return total + expense.amount;
    }, 0);
  }, [expenses, activeSheet]);

  // Source mapped to `true` if all items in that source are hidden
  const incomesSourceHiddenMap = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    for (const source in incomeBySource) {
      const items = incomeBySource[source]?.items ?? [];
      visibility[source] = items.length > 0 && items.every((income) => {
        // Check per-sheet hidden state
        return activeSheet && activeSheet !== 'all'
          ? income.hiddenInSheets?.includes(activeSheet) ?? false
          : income.hidden ?? false;
      });
    }
    return visibility;
  }, [incomeBySource, activeSheet]);

  // Category mapped to `true` if all items in that category are hidden
  const expensesCategoryHiddenMap = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    for (const category in expenseByCategory) {
      const items = expenseByCategory[category]?.items ?? [];
      visibility[category] = items.length > 0 && items.every((expense) => {
        // Check per-sheet hidden state
        return activeSheet && activeSheet !== 'all'
          ? expense.hiddenInSheets?.includes(activeSheet) ?? false
          : expense.hidden ?? false;
      });
    }
    return visibility;
  }, [expenseByCategory, activeSheet]);

  const getBudgetItem = useCallback(
    (
      id: string,
    ): {
      item: Income | Expense | null;
      type: BudgetType | 'none';
    } => {
      const incomeItem = incomesMap[id];
      if (incomeItem) {
        return { item: incomeItem, type: 'income' };
      }
      const expenseItem = expensesMap[id];
      if (expenseItem) {
        return { item: expenseItem, type: 'expense' };
      }
      return { item: null, type: 'none' };
    },
    [incomesMap, expensesMap],
  );

  const totalBudgetItems = useMemo(() => {
    return incomes.length + expenses.length;
  }, [incomes, expenses]);

  const totalBudgetItemsInSpace = useMemo(() => {
    return (incomesInSpace?.length ?? 0) + (expensesInSpace?.length ?? 0);
  }, [incomesInSpace, expensesInSpace]);

  return {
    incomes,
    expenses,
    incomesInSpace,
    expensesInSpace,
    incomesMap,
    expensesMap,
    incomesTotal,
    expensesTotal,
    incomesEnabledTotal,
    expensesEnabledTotal,
    getBudgetItem,
    incomeSources,
    expenseSubCategoriesMap,
    incomeTypes,
    expenseCategories,
    incomeBySource,
    expenseByCategory,
    incomesSourceHiddenMap,
    expensesCategoryHiddenMap,
    totalBudgetItems,
    totalBudgetItemsInSpace,
  };
}
