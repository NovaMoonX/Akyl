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
  const [incomesInSpace, expensesInSpace, spaceTimeWindow] = useSpace(
    useShallow((state) => [
      state?.space?.incomes,
      state?.space?.expenses,
      state?.space?.config?.timeWindow,
    ]),
  );

  const timeWindow = useMemo(() => {
    return spaceTimeWindow ?? DEFAULT_TIME_WINDOW;
  }, [spaceTimeWindow]);

  const incomes = useMemo(() => {
    const items = incomesInSpace ?? [];
    const itemsAdjustedAmount = items.map((income) => {
      const adjustedAmount = getBudgetItemWindowAmount(
        income.amount,
        income.cadence,
        timeWindow,
      );
      return { ...income, amount: adjustedAmount };
    });
    return itemsAdjustedAmount;
  }, [incomesInSpace, timeWindow]);

  const expenses = useMemo(() => {
    const items = expensesInSpace ?? [];
    const itemsAdjustedAmount = items.map((expense) => {
      const adjustedAmount = getBudgetItemWindowAmount(
        expense.amount,
        expense.cadence,
        timeWindow,
      );
      return { ...expense, amount: adjustedAmount };
    });
    return itemsAdjustedAmount;
  }, [expensesInSpace, timeWindow]);

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
            acc[income.source] = { total: 0, items: [] };
          }
          acc[income.source].items.push(income);
          acc[income.source].total += income.amount;
        }
        return acc;
      },
      {} as Record<string, { total: number; items: Income[] }>,
    );

    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .reduce(
        (acc, [source, data]) => {
          acc[source] = data;
          return acc;
        },
        {} as Record<string, { total: number; items: Income[] }>,
      );
  }, [incomes]);

  // Group expenses by category and calculate totals
  // Sort categories by total amount descending
  const expenseByCategory = useMemo(() => {
    const map = expenses.reduce(
      (acc, expense) => {
        if (expense.category) {
          if (!acc[expense.category]) {
            acc[expense.category] = { total: 0, items: [] };
          }
          acc[expense.category].items.push(expense);
          acc[expense.category].total += expense.amount;
        }
        return acc;
      },
      {} as Record<string, { total: number; items: Expense[] }>,
    );

    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .reduce(
        (acc, [category, data]) => {
          acc[category] = data;
          return acc;
        },
        {} as Record<string, { total: number; items: Expense[] }>,
      );
  }, [expenses]);

  const incomesTotal = useMemo(() => {
    return incomes.reduce((total, income) => total + income.amount, 0);
  }, [incomes]);

  const expensesTotal = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

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

  return {
    incomes,
    expenses,
    incomesMap,
    expensesMap,
    incomesTotal,
    expensesTotal,
    getBudgetItem,
    incomeSources,
    expenseSubCategoriesMap,
    incomeTypes,
    expenseCategories,
    incomeBySource,
    expenseByCategory,
  };
}
