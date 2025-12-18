export type BudgetItemCadenceType = 'month' | 'week' | 'day' | 'year';

export interface BudgetItemCadence {
  type: BudgetItemCadenceType;
  interval: number; // How often the event repeats (e.g., every 2 weeks = interval: 2)
}

export interface SubItem {
  id: string;
  title: string;
  value: number;
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
  hidden?: boolean; // For UI purposes, to hide/show income items (global, deprecated in favor of hiddenInSheets)
  hiddenInSheets?: string[]; // Array of sheet IDs where this item is hidden
  sheets?: string[]; // Optional array of sheet ids
  disabled?: boolean; // Whether the item is disabled (excluded from active totals but shown in complete totals)
  subItems?: SubItem[]; // Optional array of sub-items with title and value
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
  hidden?: boolean; // For UI purposes, to hide/show expense items (global, deprecated in favor of hiddenInSheets)
  hiddenInSheets?: string[]; // Array of sheet IDs where this item is hidden
  sheets?: string[]; // Optional array of sheet ids
  disabled?: boolean; // Whether the item is disabled (excluded from active totals but shown in complete totals)
  subItems?: SubItem[]; // Optional array of sub-items with title and value
}
