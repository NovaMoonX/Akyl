import { getUserLocale } from '../utils';

export function formatCurrency(amount: number, currency: string): string {
  const locale = getUserLocale();
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
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
