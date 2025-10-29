import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Expense, Income } from '../lib';
import type { Sheet, Space } from '../lib/space.types';

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
  addSheet: (sheet: Sheet) => void;
  updateSheet: (id: string, updates: Partial<Sheet>) => void;
  removeSheet: (id: string) => void;
  setActiveSheet: (sheetId: string) => void;
  // Multi-select state for bulk sheet assignment
  selectedBudgetItems: string[];
  toggleBudgetItemSelection: (id: string) => void;
  clearBudgetItemSelection: () => void;
  addSheetToSelectedItems: (sheetId: string) => void;
  removeSheetFromSelectedItems: (sheetId: string) => void;
}

const initialSpace = {} as Space;

// Devtools allow use of React DevTools to inspect the state of the store: https://zustand.docs.pmnd.rs/middlewares/devtools
const useSpaceStore = create<SpaceStore>()(
  devtools((set) => ({
    space: initialSpace,
    selectedBudgetItems: [],
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
    addSheet: (sheet) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              sheets: [...(state.space.sheets || []), sheet],
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
          : initialSpace,
      })),
    updateSheet: (id, updates) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              sheets: (state.space.sheets || []).map((sheet) =>
                sheet.id === id ? { ...sheet, ...updates } : sheet,
              ),
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
          : initialSpace,
      })),
    removeSheet: (id) =>
      set((state) => {
        if (!state.space) return state;
        
        // Remove sheet from all budget items
        const updatedIncomes = state.space.incomes.map((income) => ({
          ...income,
          sheets: (income.sheets || []).filter((sheetId) => sheetId !== id),
        }));
        const updatedExpenses = state.space.expenses.map((expense) => ({
          ...expense,
          sheets: (expense.sheets || []).filter((sheetId) => sheetId !== id),
        }));
        
        // If the deleted sheet was active, switch to 'all'
        const newActiveSheet = state.space.config?.activeSheet === id ? 'all' : (state.space.config?.activeSheet || 'all');
        
        return {
          space: {
            ...state.space,
            sheets: (state.space.sheets || []).filter(
              (sheet) => sheet.id !== id,
            ),
            incomes: updatedIncomes,
            expenses: updatedExpenses,
            config: { ...state.space.config, activeSheet: newActiveSheet },
            metadata: { ...state.space.metadata, updatedAt: Date.now() },
          },
        };
      }),
    setActiveSheet: (sheetId) =>
      set((state) => ({
        space: state.space
          ? {
              ...state.space,
              config: { ...state.space.config, activeSheet: sheetId },
              metadata: { ...state.space.metadata, updatedAt: Date.now() },
            }
          : initialSpace,
      })),
    toggleBudgetItemSelection: (id) =>
      set((state) => ({
        selectedBudgetItems: state.selectedBudgetItems.includes(id)
          ? state.selectedBudgetItems.filter((itemId) => itemId !== id)
          : [...state.selectedBudgetItems, id],
      })),
    clearBudgetItemSelection: () =>
      set(() => ({
        selectedBudgetItems: [],
      })),
    addSheetToSelectedItems: (sheetId) =>
      set((state) => {
        if (!state.space) return state;
        const updatedIncomes = state.space.incomes.map((income) =>
          state.selectedBudgetItems.includes(income.id)
            ? {
                ...income,
                sheets: [...new Set([...(income.sheets || []), sheetId])],
              }
            : income,
        );
        const updatedExpenses = state.space.expenses.map((expense) =>
          state.selectedBudgetItems.includes(expense.id)
            ? {
                ...expense,
                sheets: [...new Set([...(expense.sheets || []), sheetId])],
              }
            : expense,
        );
        return {
          space: {
            ...state.space,
            incomes: updatedIncomes,
            expenses: updatedExpenses,
            metadata: { ...state.space.metadata, updatedAt: Date.now() },
          },
        };
      }),
    removeSheetFromSelectedItems: (sheetId) =>
      set((state) => {
        if (!state.space) return state;
        const updatedIncomes = state.space.incomes.map((income) =>
          state.selectedBudgetItems.includes(income.id)
            ? {
                ...income,
                sheets: (income.sheets || []).filter((id) => id !== sheetId),
              }
            : income,
        );
        const updatedExpenses = state.space.expenses.map((expense) =>
          state.selectedBudgetItems.includes(expense.id)
            ? {
                ...expense,
                sheets: (expense.sheets || []).filter((id) => id !== sheetId),
              }
            : expense,
        );
        return {
          space: {
            ...state.space,
            incomes: updatedIncomes,
            expenses: updatedExpenses,
            metadata: { ...state.space.metadata, updatedAt: Date.now() },
          },
        };
      }),
  })),
);

export { useSpaceStore };
