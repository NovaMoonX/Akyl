import { create } from 'zustand';
import type { Expense, Income } from '../lib';
import type { Space } from '../lib/space.types';

interface SpaceStore {
  space: Space;
  setSpace: (space: Space) => void;
  updateSpace: (partial: Partial<Space>) => void;
  updateMetadata: (partial: Partial<Space['metadata']>) => void;
  updateConfig: (partial: Partial<Space['config']>) => void;
  addIncome: (income: Income) => void;
  updateIncome: (id: string, updates: Partial<Income>) => void;
  removeIncome: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
}

const initialSpace = {} as Space;

const useSpaceStore = create<SpaceStore>((set) => ({
  space: initialSpace,
  setSpace: (space) => set({ space }),
  updateSpace: (partial) =>
    set((state) => ({
      space: state.space ? { ...state.space, ...partial } : initialSpace,
    })),
  updateMetadata: (partial) =>
    set((state) => ({
      space: state.space
        ? { ...state.space, metadata: { ...state.space.metadata, ...partial } }
        : initialSpace,
    })),
  updateConfig: (partial) =>
    set((state) => ({
      space: state.space
        ? { ...state.space, config: { ...state.space.config, ...partial } }
        : initialSpace,
    })),
  addIncome: (income) =>
    set((state) => ({
      space: state.space
        ? { ...state.space, incomes: [...state.space.incomes, income] }
        : initialSpace,
    })),
  updateIncome: (id, updates) =>
    set((state) => ({
      space: state.space
        ? {
            ...state.space,
            incomes: state.space.incomes.map((income) =>
              income.id === id ? { ...income, ...updates } : income,
            ),
          }
        : initialSpace,
    })),
  removeIncome: (id) =>
    set((state) => ({
      space: state.space
        ? {
            ...state.space,
            incomes: state.space.incomes.filter((income) => income.id !== id),
          }
        : initialSpace,
    })),
  addExpense: (expense) =>
    set((state) => ({
      space: state.space
        ? { ...state.space, expenses: [...state.space.expenses, expense] }
        : initialSpace,
    })),
  updateExpense: (id, updates) =>
    set((state) => ({
      space: state.space
        ? {
            ...state.space,
            expenses: state.space.expenses.map((expense) =>
              expense.id === id ? { ...expense, ...updates } : expense,
            ),
          }
        : initialSpace,
    })),
  removeExpense: (id) =>
    set((state) => ({
      space: state.space
        ? {
            ...state.space,
            expenses: state.space.expenses.filter(
              (expense) => expense.id !== id,
            ),
          }
        : initialSpace,
    })),
}));

export { useSpaceStore };
