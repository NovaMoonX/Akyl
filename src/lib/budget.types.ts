export interface BudgetItemCadence {
  type: 'monthly' | 'weekly' | 'daily' | 'custom';
  interval: number; // How often the event repeats (e.g., every 2 weeks = interval: 2)
  day_of_month: number; // For "monthly" type (e.g., bill is due on the 15th)
  days_of_week: number[]; // For "weekly" type (0=Sun, 1=Mon, ..., 6=Sat)
  start_date: string; // Optional: when this cadence starts (e.g., '2023-01-01')
  end_date: string; // Optional: when this cadence ends (e.g., '2023-12-31')
  custom_days: number[]; // For "custom" type, days after the start date (e.g., every 5th, 10th, 20th day)
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
  // cadence: BudgetItemCadence; // FUTURE: support cadence for incomes and expenses
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
  // cadence: BudgetItemCadence;
  notes: string;
}
