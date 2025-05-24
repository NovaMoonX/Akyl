export const CURRENT_FILE_VERSION = '1.0.0';
export const CURRENT_APP_VERSION = '1.0.0';

// Cash Flow
export declare enum CashFlowInVerbiageEnum {
  Income = 'income',
  Inflow = 'inflow',
  Earnings = 'earnings',
  MoneyIn = 'money in',
}

export declare enum CashFlowOutVerbiageEnum {
  Expense = 'expense',
  Outflow = 'outflow',
  Spending = 'spending',
  MoneyOut = 'money out',
}

export const CashFlowVerbiagePairs = {
  default: {
    in: CashFlowInVerbiageEnum.Income,
    out: CashFlowOutVerbiageEnum.Expense,
  },
  flow: {
    in: CashFlowInVerbiageEnum.Inflow,
    out: CashFlowOutVerbiageEnum.Outflow,
  },
  formal: {
    in: CashFlowInVerbiageEnum.Earnings,
    out: CashFlowOutVerbiageEnum.Spending,
  },
  money: {
    in: CashFlowInVerbiageEnum.MoneyIn,
    out: CashFlowOutVerbiageEnum.MoneyOut,
  },
} as const;
