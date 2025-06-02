export type BudgetItemCadenceType = 'month' | 'week' | 'day' | 'year';

export interface BudgetItemCadence {
  type: BudgetItemCadenceType;
  interval: number; // How often the event repeats (e.g., every 2 weeks = interval: 2)
}

export interface Income {
  id: string;
  label: string;
  description: string;
  amount: number;
  source: string; // i.e. Company name, freelance job, friends/family, etc.
  type: string;
  cadence: BudgetItemCadence;
  notes: string;
  hidden?: boolean; // For UI purposes, to hide/show income items
}

export interface Expense {
  id: string;
  label: string;
  description: string;
  amount: number;
  category: string;
  subCategory: string; // i.e. Water, Electricity, Gas -> Utilities
  cadence: BudgetItemCadence;
  notes: string;
  hidden?: boolean; // For UI purposes, to hide/show expense items
}
