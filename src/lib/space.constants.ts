export const CURRENT_FILE_VERSION = '1.0.0';
export const CURRENT_APP_VERSION = '1.0.0';

// Cash Flow
const CashFlowInVerbiages = {
  Income: 'income',
  Inflow: 'inflow',
  Earnings: 'earnings',
  MoneyIn: 'money in',
} as const;

const CashFlowOutVerbiages = {
  Expense: 'expense',
  Outflow: 'outflow',
  Spending: 'spending',
  MoneyOut: 'money out',
} as const;

export const CashFlowVerbiagePairs = {
  default: {
    in: CashFlowInVerbiages.Income,
    out: CashFlowOutVerbiages.Expense,
  },
  flow: {
    in: CashFlowInVerbiages.Inflow,
    out: CashFlowOutVerbiages.Outflow,
  },
  formal: {
    in: CashFlowInVerbiages.Earnings,
    out: CashFlowOutVerbiages.Spending,
  },
  money: {
    in: CashFlowInVerbiages.MoneyIn,
    out: CashFlowOutVerbiages.MoneyOut,
  },
} as const;

// Colors
export const SpaceAccentColors = {
  default: '#f0fdfa', // teal-50
};

export const NO_BACKGROUND_VARIANT = '';

// Diagram
export const BUCKET_SPACING_X = 200;

export const INCOME_BUCKET_Y = -200;
export const INCOME_ITEM_Y = -400;

export const EXPENSE_BUCKET_Y = 300;
export const EXPENSE_ITEM_Y = 500;
