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

/**
 * Get the conversion ratio from one period type to another using exact ratios.
 * Examples:
 * - week to month: 4 weeks per month
 * - month to year: 12 months per year
 * - week to year: 52 weeks per year
 */
function getConversionRatio(
  fromType: string,
  toType: string,
): number {
  // Same type, no conversion needed
  if (fromType === toType) {
    return 1;
  }

  // Define exact conversion ratios
  const conversions: Record<string, Record<string, number>> = {
    day: {
      week: 1 / 7,
      month: 1 / 30,
      year: 1 / 365,
    },
    week: {
      day: 7,
      month: 4, // 4 weeks per month (exact ratio)
      year: 52, // 52 weeks per year (exact ratio)
    },
    month: {
      day: 30,
      week: 1 / 4, // 1 month = 1/4 of 4 weeks
      year: 12, // 12 months per year (exact ratio)
    },
    year: {
      day: 365,
      week: 1 / 52, // 1 year = 1/52 of 52 weeks
      month: 1 / 12, // 1 year = 1/12 of 12 months
    },
  };

  const ratio = conversions[fromType]?.[toType];
  if (ratio === undefined) {
    throw new Error(`Unknown conversion from ${fromType} to ${toType}`);
  }
  return ratio;
}

/**
 * Get the conversion ratio using day-based approximations.
 * This is the legacy method that uses days as an intermediate step.
 */
function getConversionRatioDayBased(
  fromType: string,
  toType: string,
): number {
  // Same type, no conversion needed
  if (fromType === toType) {
    return 1;
  }

  // Convert from type to days
  const toDays: Record<string, number> = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };

  // Convert to days, then to target type
  const fromDays = toDays[fromType];
  const toDaysTarget = toDays[toType];
  
  if (fromDays === undefined || toDaysTarget === undefined) {
    throw new Error(`Unknown conversion from ${fromType} to ${toType}`);
  }

  return toDaysTarget / fromDays;
}

export function getBudgetItemWindowAmount(
  amount: number,
  itemCadence: BudgetItemCadence,
  window: BudgetItemCadence,
  conversionMethod: 'exact' | 'day-based' = 'exact',
): number {
  // Get the conversion ratio based on the selected method
  const ratio = conversionMethod === 'exact' 
    ? getConversionRatio(itemCadence.type, window.type)
    : getConversionRatioDayBased(itemCadence.type, window.type);
  
  // Apply the ratio and adjust for intervals
  // Formula: amount * ratio * (window.interval / itemCadence.interval)
  return (amount * ratio * window.interval) / itemCadence.interval;
}
