import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  BaseExpenseCategories,
  BaseIncomeTypes,
  type Expense,
  type Income,
} from '../lib';
import type { BudgetType } from '../lib/node.types';
import { useSpace } from '../store';

const demoIncomes = [
  {
    id: 'income-item-1',
    label: 'Salary',
    amount: 4000,
    source: 'HubSpot',
    // category: ''
  },
  {
    id: 'income-item-2',
    label: '#1 Client',
    source: 'Side Gig (Photography)',
    amount: 450.5,
  },
] as Income[];

const demoExpenses = [
  {
    id: 'expense-item-1',
    label: 'Rent',
    category: 'Housing',
    amount: 1000,
  },
  {
    id: 'expense-item-2',
    label: 'Monthly Food',
    category: 'Groceries',
    amount: 100,
  },
] as Expense[];

export default function useBudget() {
  const [incomes, expenses] = useSpace(
    useShallow((state) => [state?.space?.incomes, state?.space?.expenses]),
  );

  const incomeSources = useMemo(() => {
    const sourceCount = new Map<string, number>();
    for (const income of [...(incomes ?? []), ...demoIncomes]) {
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
    for (const expense of [...(expenses ?? []), ...demoExpenses]) {
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
    for (const income of [...(incomes ?? []), ...demoIncomes]) {
      if (income.type) {
        types.add(income.type);
      }
    }
    return Array.from(types).sort();
  }, [incomes]);

  const expenseCategories = useMemo(() => {
    const categories = new Set<string>(BaseExpenseCategories);
    for (const expense of [...(expenses ?? []), ...demoExpenses]) {
      if (expense.category) {
        categories.add(expense.category);
      }
    }
    return Array.from(categories).sort();
  }, [expenses]);

  const incomesMap = useMemo(() => {
    return [...(incomes ?? []), ...demoIncomes].reduce(
      (acc, income) => {
        acc[income.id] = income;
        return acc;
      },
      {} as Record<string, (typeof incomes)[0]>,
    );
  }, [incomes]);

  const expensesMap = useMemo(() => {
    return [...(expenses ?? []), ...demoExpenses].reduce(
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
    const map = [...(incomes ?? []), ...demoIncomes].reduce(
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
    const map = [...(expenses ?? []), ...demoExpenses].reduce(
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
    return [...(incomes ?? []), ...demoIncomes].reduce(
      (total, income) => total + income.amount,
      0,
    );
  }, [incomes]);

  const expensesTotal = useMemo(() => {
    return [...(expenses ?? []), ...demoExpenses].reduce(
      (total, expense) => total + expense.amount,
      0,
    );
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
