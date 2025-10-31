// Formula types for calculated amounts

export interface FormulaError {
  message: string;
  position?: number;
}

export interface FormulaReference {
  type: 'source' | 'category' | 'income' | 'expense';
  id?: string; // For specific budget items
  name?: string; // For sources/categories
}

export interface FormulaValidationResult {
  isValid: boolean;
  error?: FormulaError;
  references?: FormulaReference[];
}

export interface CalculatedAmountResult {
  value: number;
  error?: FormulaError;
  references: FormulaReference[];
}
