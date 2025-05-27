import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import type { Expense, Income } from '../lib';
import type { BudgetType } from '../lib/node.types';
import { useSpace } from '../store';

const demoIncomes = [
  {
    id: 'income-item-1',
    label: 'Salary from Company',
    amount: 4000,
  },
  {
    id: 'income-item-2',
    label: '#1 Client (Photography)',
    amount: 450.5,
  },
] as Income[];

const demoExpenses = [
  {
    id: 'expense-item-1',
    label: 'Rent',
    amount: 1000,
  },
  {
    id: 'expense-item-2',
    label: 'Phone Bill',
    amount: 100,
  },
] as Expense[];

export default function useBudget() {
  const [incomes, expenses] = useSpace(
    useShallow((state) => [state?.space?.incomes, state?.space?.expenses]),
  );

  const incomesMap = useMemo(() => {
    return [...incomes, ...demoIncomes].reduce(
      (acc, income) => {
        acc[income.id] = income;
        return acc;
      },
      {} as Record<string, (typeof incomes)[0]>,
    );
  }, [incomes]);

  const expensesMap = useMemo(() => {
    return [...expenses, ...demoExpenses].reduce(
      (acc, expense) => {
        acc[expense.id] = expense;
        return acc;
      },
      {} as Record<string, (typeof expenses)[0]>,
    );
  }, [expenses]);

  const incomesTotal = useMemo(() => {
    return [...incomes, ...demoIncomes].reduce(
      (total, income) => total + income.amount,
      0,
    );
  }, [incomes]);

  const expensesTotal = useMemo(() => {
    return [...expenses, ...demoExpenses].reduce(
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
  };
}
