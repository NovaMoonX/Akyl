export type BudgetItemCadenceType = 'month' | 'week' | 'day' | 'year';

export interface BudgetItemCadence {
  type: BudgetItemCadenceType;
  interval: number; // How often the event repeats (e.g., every 2 weeks = interval: 2)
}

export type IncomeCategory =
  | 'Salary'
  | 'Bonus'
  | 'Freelance'
  | 'Investment'
  | 'Gift'
  | 'Other';

export interface Income {
  id: string;
  label: string;
  description: string;
  amount: number;
  source: string; // i.e. Company name, freelance job, friends/family, etc.
  category: IncomeCategory;
  otherCategory: string;
  cadence: BudgetItemCadence;
  notes: string;
}

export type ExpenseCategory =
  | 'Housing'
  | 'Groceries'
  | 'Transportation'
  | 'Entertainment'
  | 'Healthcare'
  | 'Personal Spending'
  | 'Other';

export interface Expense {
  id: string;
  label: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  otherCategory: string;
  subCategory: string; // i.e. Water, Electricity, Gas -> Utilities
  cadence: BudgetItemCadence;
  notes: string;
}
