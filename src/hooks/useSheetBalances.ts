import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { DEFAULT_TIME_WINDOW, getBudgetItemWindowAmount } from '../lib';
import { useSpace } from '../store';

export type BalanceState = 'surplus' | 'burden' | 'even';

/**
 * Computes the balance state (surplus / burden / even) for each sheet,
 * using the global time window to normalize cadences for comparison.
 */
export default function useSheetBalances(): Record<string, BalanceState> {
  const [incomesInSpace, expensesInSpace, sheets, spaceTimeWindow, periodConversionMethod] =
    useSpace(
      useShallow((state) => [
        state?.space?.incomes,
        state?.space?.expenses,
        state?.space?.sheets,
        state?.space?.config?.timeWindow,
        state?.space?.config?.periodConversionMethod,
      ]),
    );

  return useMemo(() => {
    if (!sheets) return {};
    const result: Record<string, BalanceState> = {};
    const timeWindow = spaceTimeWindow ?? DEFAULT_TIME_WINDOW;

    for (const sheet of sheets) {
      const sheetIncomes = incomesInSpace?.filter((i) => i.sheets?.includes(sheet.id)) ?? [];
      const sheetExpenses = expensesInSpace?.filter((e) => e.sheets?.includes(sheet.id)) ?? [];

      const incomeTotal = sheetIncomes.reduce((sum, i) => {
        const adjusted = getBudgetItemWindowAmount(
          i.amount,
          i.cadence,
          timeWindow,
          periodConversionMethod || 'exact',
          i.end,
        );
        return sum + adjusted;
      }, 0);

      const expenseTotal = sheetExpenses.reduce((sum, e) => {
        const adjusted = getBudgetItemWindowAmount(
          e.amount,
          e.cadence,
          timeWindow,
          periodConversionMethod || 'exact',
          e.end,
        );
        return sum + adjusted;
      }, 0);

      const balance = incomeTotal - expenseTotal;
      if (balance > 0.01) result[sheet.id] = 'surplus';
      else if (balance < -0.01) result[sheet.id] = 'burden';
      else result[sheet.id] = 'even';
    }

    return result;
  }, [sheets, incomesInSpace, expensesInSpace, spaceTimeWindow, periodConversionMethod]);
}
