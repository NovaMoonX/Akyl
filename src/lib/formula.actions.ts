import type { Expense, Income } from './budget.types';
import type {
  CalculatedAmountResult,
  FormulaReference,
  FormulaValidationResult,
} from './formula.types';

/**
 * Parse and evaluate a formula expression
 * Supports:
 * - Basic arithmetic: +, -, *, /, ()
 * - Numbers: integers and decimals
 * - References: @source:Name, @category:Name, @item:Name
 */
export function evaluateFormula(
  formula: string,
  incomes: Income[],
  expenses: Expense[],
): CalculatedAmountResult {
  const references: FormulaReference[] = [];
  let processedFormula = formula.trim();

  // Handle empty formula
  if (!processedFormula) {
    return {
      value: 0,
      error: { message: 'Formula cannot be empty' },
      references: [],
    };
  }

  try {
    // Replace references with their values
    // Pattern: @src:Name, @cat:Name, @in:ID, @out:ID
    // The pattern now trims whitespace from the reference value
    const referencePattern = /@(src|cat|in|out):([^@+\-*/()]+)/g;
    let match;

    while ((match = referencePattern.exec(formula)) !== null) {
      const refType = match[1] as 'src' | 'cat' | 'in' | 'out';
      const refValue = match[2].trim();
      const fullMatch = match[0];

      let resolvedValue = 0;

      if (refType === 'src') {
        // Sum all incomes from this source
        const sourceIncomes = incomes.filter(
          (inc) => inc.source.toLowerCase() === refValue.toLowerCase(),
        );
        resolvedValue = sourceIncomes.reduce((sum, inc) => sum + inc.amount, 0);
        references.push({ type: 'source', name: refValue });
      } else if (refType === 'cat') {
        // Sum all expenses from this category
        const categoryExpenses = expenses.filter(
          (exp) => exp.category.toLowerCase() === refValue.toLowerCase(),
        );
        resolvedValue = categoryExpenses.reduce(
          (sum, exp) => sum + exp.amount,
          0,
        );
        references.push({ type: 'category', name: refValue });
      } else if (refType === 'in' || refType === 'out') {
        // Get specific budget item by ID
        const income = incomes.find((inc) => inc.id === refValue);
        const expense = expenses.find((exp) => exp.id === refValue);

        if (income) {
          resolvedValue = income.amount;
          references.push({ type: 'income', id: refValue });
        } else if (expense) {
          resolvedValue = expense.amount;
          references.push({ type: 'expense', id: refValue });
        } else {
          throw new Error(`Budget item not found: ${refValue}`);
        }
      }

      // Replace the reference with its value
      processedFormula = processedFormula.replace(fullMatch, String(resolvedValue));
    }

    // Check for incomplete expressions (e.g., trailing operators) BEFORE other validation
    const trimmedFormula = processedFormula.trim();
    const incompletePattern = /[+\-*/]\s*$/;
    if (incompletePattern.test(trimmedFormula)) {
      throw new Error('Incomplete formula: operator at end');
    }

    // Validate the expression has only allowed characters
    const allowedPattern = /^[\d+\-*/().\s]+$/;
    if (!allowedPattern.test(processedFormula)) {
      throw new Error('Invalid characters in formula');
    }

    // Check for empty parentheses or unbalanced parentheses
    if (trimmedFormula.includes('()')) {
      throw new Error('Empty parentheses in formula');
    }

    // Evaluate the mathematical expression
    // Note: Using Function constructor is a calculated risk here. The formula is:
    // 1. Strictly validated to contain only numbers and math operators
    // 2. All user references are replaced with numeric values before evaluation
    // 3. No external variables or functions are accessible in the evaluation context
    // A dedicated math parser library would be more secure, but adds dependency overhead
    // for a feature with strict input validation
    const result = new Function(`'use strict'; return (${processedFormula})`)() as number;

    if (!isFinite(result)) {
      throw new Error('Formula resulted in invalid number');
    }

    return {
      value: Math.max(0, result), // Ensure non-negative
      references,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid formula';
    return {
      value: 0,
      error: { message: errorMessage },
      references,
    };
  }
}

/**
 * Validate a formula without evaluating it
 */
export function validateFormula(formula: string): FormulaValidationResult {
  if (!formula.trim()) {
    return {
      isValid: false,
      error: { message: 'Formula cannot be empty' },
    };
  }

  const references: FormulaReference[] = [];
  let processedFormula = formula.trim();

  try {
    // Extract and validate references
    const referencePattern = /@(source|category|item):([^@+\-*/()]+)/g;
    let match;

    while ((match = referencePattern.exec(formula)) !== null) {
      const refType = match[1] as 'source' | 'category' | 'item';
      const refValue = match[2].trim();
      const fullMatch = match[0];

      if (!refValue) {
        throw new Error(`Empty reference: ${fullMatch}`);
      }

      if (refType === 'source') {
        references.push({ type: 'source', name: refValue });
      } else if (refType === 'category') {
        references.push({ type: 'category', name: refValue });
      } else if (refType === 'item') {
        // For validation, we just store as 'income' since we don't know the actual type
        // The actual type will be determined during evaluation
        references.push({ type: 'income', id: refValue });
      }

      // Replace with placeholder for validation
      processedFormula = processedFormula.replace(fullMatch, '1');
    }

    // Validate the expression syntax
    const allowedPattern = /^[\d+\-*/().\s]+$/;
    if (!allowedPattern.test(processedFormula)) {
      throw new Error('Invalid characters in formula');
    }

    // Try to parse it
    new Function(`'use strict'; return (${processedFormula})`)();

    return {
      isValid: true,
      references,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid formula';
    return {
      isValid: false,
      error: { message: errorMessage },
      references,
    };
  }
}

/**
 * Check if a source/category/item is referenced in any formula
 */
export function findReferencingItems(
  targetType: 'source' | 'category' | 'income' | 'expense',
  targetIdentifier: string, // source/category name or item ID
  incomes: Income[],
  expenses: Expense[],
): { incomes: Income[]; expenses: Expense[] } {
  const referencingIncomes: Income[] = [];
  const referencingExpenses: Expense[] = [];

  const allItems = [...incomes, ...expenses];

  for (const item of allItems) {
    if (!item.formula) continue;

    const referencePattern = /@(src|cat|in|out):([^@+\-*/()]+)/g;
    let match;

    while ((match = referencePattern.exec(item.formula)) !== null) {
      const refType = match[1];
      const refValue = match[2].trim();

      if (
        (targetType === 'source' && refType === 'src' && refValue.toLowerCase() === targetIdentifier.toLowerCase()) ||
        (targetType === 'category' && refType === 'cat' && refValue.toLowerCase() === targetIdentifier.toLowerCase()) ||
        (targetType === 'income' && refType === 'in' && refValue === targetIdentifier) ||
        (targetType === 'expense' && refType === 'out' && refValue === targetIdentifier)
      ) {
        // Found a reference
        if ('source' in item) {
          referencingIncomes.push(item as Income);
        } else {
          referencingExpenses.push(item as Expense);
        }
        break; // No need to check more references in this item
      }
    }
  }

  return { incomes: referencingIncomes, expenses: referencingExpenses };
}

/**
 * Detect circular dependencies in formulas
 */
export function hasCircularDependency(
  itemId: string,
  formula: string,
  incomes: Income[],
  expenses: Expense[],
  visited = new Set<string>(),
): boolean {
  if (visited.has(itemId)) {
    return true; // Circular dependency detected
  }

  visited.add(itemId);

  // Extract item references from formula
  const referencePattern = /@item:([^@+\-*/()]+)/g;
  let match;

  while ((match = referencePattern.exec(formula)) !== null) {
    const refId = match[1].trim();

    // Check if this reference creates a cycle
    const referencedItem =
      incomes.find((inc) => inc.id === refId) ||
      expenses.find((exp) => exp.id === refId);

    if (referencedItem && referencedItem.formula) {
      if (
        hasCircularDependency(
          refId,
          referencedItem.formula,
          incomes,
          expenses,
          new Set(visited),
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Convert a formula with item IDs to one with item labels for display
 */
export function formulaIdsToLabels(
  formula: string,
  incomes: Income[],
  expenses: Expense[],
): string {
  let displayFormula = formula;
  const referencePattern = /@(in|out):([^@+\-*/()]+)/g;
  
  // Replace all matches
  displayFormula = displayFormula.replace(referencePattern, (match, _refType, refId) => {
    const trimmedId = refId.trim();
    const income = incomes.find((inc) => inc.id === trimmedId);
    const expense = expenses.find((exp) => exp.id === trimmedId);
    
    if (income) {
      return `@in:${income.label}`;
    } else if (expense) {
      return `@out:${expense.label}`;
    }
    // If not found, keep the original
    return match;
  });
  
  return displayFormula;
}

/**
 * Convert a formula with item labels to one with item IDs for storage
 */
export function formulaLabelsToIds(
  formula: string,
  incomes: Income[],
  expenses: Expense[],
): string {
  let storageFormula = formula;
  const referencePattern = /@(in|out):([^@+\-*/()]+)/g;
  
  // Replace all matches
  storageFormula = storageFormula.replace(referencePattern, (match, _refType, refLabel) => {
    const trimmedLabel = refLabel.trim();
    // Try to find by label (case-insensitive)
    const income = incomes.find((inc) => inc.label.toLowerCase() === trimmedLabel.toLowerCase());
    const expense = expenses.find((exp) => exp.label.toLowerCase() === trimmedLabel.toLowerCase());
    
    if (income) {
      return `@in:${income.id}`;
    } else if (expense) {
      return `@out:${expense.id}`;
    }
    // If not found, keep the original
    return match;
  });
  
  return storageFormula;
}
