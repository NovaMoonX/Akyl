import { getUserLocale } from '../utils';

export function formatCurrency(amount: number, currency: string): string {
  const locale = getUserLocale();
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
