import type { Space } from '../lib';

/**
 * Validates if a parsed object is a valid Space object
 * Checks for all required Space properties
 */
export default function isValidSpace(parsed: unknown): parsed is Space {
  if (typeof parsed !== 'object' || parsed === null) {
    return false;
  }

  const obj = parsed as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    obj.metadata !== null &&
    typeof obj.metadata === 'object' &&
    obj.config !== null &&
    typeof obj.config === 'object' &&
    Array.isArray(obj.incomes) &&
    Array.isArray(obj.expenses)
  );
}
