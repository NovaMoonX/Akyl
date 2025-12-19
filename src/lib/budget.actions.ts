import { getUserLocale } from '../utils';
import type { BudgetItemCadence } from './budget.types';

export function formatCurrency(amount: number, currency: string): string {
  const locale = getUserLocale();
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);

  const negativeZero = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(-0);
  const positiveZero = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(0);

  if (formatted === negativeZero) {
    return positiveZero;
  }
  return formatted;
}

export function getCurrencySymbol(currency: string): string {
  const locale = getUserLocale();
  return (0)
    .toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, '')
    .trim();
}

function getBudgetItemDayAmount(
  amount: number,
  cadence: BudgetItemCadence,
): number {
  const { type, interval } = cadence;
  switch (type) {
    case 'month':
      return amount / (30 * interval);
    case 'week':
      return amount / (7 * interval);
    case 'day':
      return amount / interval;
    case 'year':
      return amount / (365 * interval);
    default:
      throw new Error(`Unknown cadence type: ${type}`);
  }
}

export function getBudgetItemWindowAmount(
  amount: number,
  itemCadence: BudgetItemCadence,
  window: BudgetItemCadence,
): number {
  const itemDayAmount = getBudgetItemDayAmount(amount, itemCadence);
  switch (window.type) {
    case 'month':
      return itemDayAmount * 30 * window.interval;
    case 'week':
      return itemDayAmount * 7 * window.interval;
    case 'day':
      return itemDayAmount * window.interval;
    case 'year':
      return itemDayAmount * 365 * window.interval;
    default:
      throw new Error(`Unknown cadence type: ${window.type}`);
  }
}
