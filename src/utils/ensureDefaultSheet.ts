import type { Space } from '../lib/space.types';
import generateId from './generateId';

/**
 * Ensures all budget items have at least one sheet.
 * If items exist without sheets, creates a default "Sheet 1" and assigns them to it.
 * Modifies the space object in place and returns whether any updates were made.
 * 
 * @param space - The space object to process
 * @returns true if the space was modified, false otherwise
 */
export function ensureDefaultSheet(space: Space): boolean {
  let needsUpdate = false;
  
  // Check if there are budget items without sheets
  const hasItemsWithoutSheets = 
    space.incomes.some(income => !income.sheets || income.sheets.length === 0) ||
    space.expenses.some(expense => !expense.sheets || expense.sheets.length === 0);
  
  if (hasItemsWithoutSheets) {
    // Create a default sheet if none exist
    if (!space.sheets || space.sheets.length === 0) {
      const defaultSheetId = generateId('sheet');
      space.sheets = [{
        id: defaultSheetId,
        name: 'Sheet 1',
      }];
      needsUpdate = true;
    }
    
    // Get the first sheet ID
    const defaultSheetId = space.sheets[0].id;
    
    // Assign all budget items without sheets to the default sheet
    space.incomes = space.incomes.map(income => {
      if (!income.sheets || income.sheets.length === 0) {
        needsUpdate = true;
        return { ...income, sheets: [defaultSheetId] };
      }
      return income;
    });
    
    space.expenses = space.expenses.map(expense => {
      if (!expense.sheets || expense.sheets.length === 0) {
        needsUpdate = true;
        return { ...expense, sheets: [defaultSheetId] };
      }
      return expense;
    });
  }
  
  return needsUpdate;
}
