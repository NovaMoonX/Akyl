import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import type { Expense, Income } from '../lib';
import { useSpace } from '../store';

const demoIncomes = [
  {
    id: 'income-item-1',
    label: 'Salary',
    amount: 4000,
  },
  {
    id: 'income-item-2',
    label: '#1 Client',
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
    (id: string): Income | Expense | null => {
      return incomesMap[id] || expensesMap[id] || null;
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
