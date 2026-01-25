export type BudgetItemCadenceType = 'month' | 'week' | 'day' | 'year';

export interface BudgetItemCadence {
  type: BudgetItemCadenceType;
  interval: number; // How often the event repeats (e.g., every 2 weeks = interval: 2)
}

export type BudgetItemEndType = 'period' | 'amount' | 'occurrences';

export interface BudgetItemEnd {
  type: BudgetItemEndType;
  // For 'period' type: when the item should end
  period?: {
    value: number; // number of periods
    cadence: BudgetItemCadenceType; // type of period (month, week, day, year)
  };
  // For 'amount' type: total amount cap
  amount?: number;
  // For 'occurrences' type: number of times the item occurs
  occurrences?: number;
}

export interface Income {
  id: string;
  label: string;
  description: string;
  amount: number;
  source: string; // i.e. Company name, freelance job, friends/family, etc.
  type: string;
  cadence?: BudgetItemCadence; // Optional: if not provided, item happens "once"
  notes: string;
  end?: BudgetItemEnd; // Optional: when the recurring item should end
  hidden?: boolean; // For UI purposes, to hide/show income items (global, deprecated in favor of hiddenInSheets)
  hiddenInSheets?: string[]; // Array of sheet IDs where this item is hidden
  sheets?: string[]; // Optional array of sheet ids
  disabled?: boolean; // Whether the item is disabled (excluded from active totals but shown in complete totals)
}

export interface Expense {
  id: string;
  label: string;
  description: string;
  amount: number;
  category: string;
  subCategory: string; // i.e. Water, Electricity, Gas -> Utilities
  cadence?: BudgetItemCadence; // Optional: if not provided, item happens "once"
  notes: string;
  end?: BudgetItemEnd; // Optional: when the recurring item should end
  hidden?: boolean; // For UI purposes, to hide/show expense items (global, deprecated in favor of hiddenInSheets)
  hiddenInSheets?: string[]; // Array of sheet IDs where this item is hidden
  sheets?: string[]; // Optional array of sheet ids
  disabled?: boolean; // Whether the item is disabled (excluded from active totals but shown in complete totals)
}
