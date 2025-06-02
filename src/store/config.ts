import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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

// Devtools allow use of React DevTools to inspect the state of the store: https://zustand.docs.pmnd.rs/middlewares/devtools
const useSpaceStore = create<SpaceStore>()(
  devtools((set) => ({
    space: initialSpace,
    setSpace: (space) => set({ space }),
    updateSpace: (partial) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              ...partial,
              metadata: {
                ...state.space.metadata,
                ...partial.metadata,
                updatedAt: Date.now(),
              },
            }
          : initialSpace,
      })),
    updateMetadata: (partial) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              metadata: {
                ...state.space.metadata,
                updatedAt: Date.now(),
                ...partial,
              },
            }
          : initialSpace,
      })),
    updateConfig: (partial) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              config: { ...state.space.config, ...partial },
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
          : initialSpace,
      })),
    addIncome: (income) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              incomes: [...state.space.incomes, income],
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
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
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
          : initialSpace,
      })),
    removeIncome: (id) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              incomes: state.space.incomes.filter((income) => income.id !== id),
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
          : initialSpace,
      })),
    addExpense: (expense) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              expenses: [...state.space.expenses, expense],
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
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
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
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
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
          : initialSpace,
      })),
  })),
);

export { useSpaceStore };
