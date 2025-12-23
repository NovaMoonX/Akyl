import {
  FILE_EXTENSION,
  FILE_HEADER_FIRST_LINE,
  FILE_HEADER_SECOND_LINE,
  FILE_HEADER_THIRD_LINE,
  FILE_TYPE,
} from './file.constants';
import type { Expense, Income } from './budget.types';
import type { BudgetItemCadenceType } from './budget.types';
import type { Space } from './space.types';
import { generateId } from '../utils';

// Valid frequency types for CSV import/export
const VALID_FREQUENCY_TYPES: BudgetItemCadenceType[] = ['day', 'week', 'month', 'year'];

// Column mapping interface for CSV parsing
interface ColumnMapping {
  [key: string]: number;
}

// Helper function to create column mapping from header row
function createColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  headers.forEach((header, index) => {
    mapping[header.trim()] = index;
  });
  return mapping;
}

// Helper function to validate frequency values
function validateFrequencyValues(
  interval: string,
  type: string,
  lineNumber: number,
  errors: string[]
): void {
  const parsedInterval = parseInt(interval);
  const lowerType = type.toLowerCase();
  
  if (isNaN(parsedInterval) || parsedInterval < 1) {
    errors.push(
      `Invalid frequency interval "${interval}" on line ${lineNumber} (must be a positive number)`
    );
  }
  
  if (!VALID_FREQUENCY_TYPES.includes(lowerType as BudgetItemCadenceType)) {
    errors.push(
      `Invalid frequency type "${type}" on line ${lineNumber} (must be: ${VALID_FREQUENCY_TYPES.join(', ')})`
    );
  }
}

// Helper function to parse frequency from CSV cells using column mapping
function parseFrequency(cells: string[], columnMap: ColumnMapping): {
  interval: number;
  type: BudgetItemCadenceType;
} {
  const intervalIdx = columnMap['Frequency Interval'];
  const typeIdx = columnMap['Frequency Type'];
  
  // If frequency columns don't exist, return defaults
  if (intervalIdx === undefined || typeIdx === undefined) {
    return { interval: 1, type: 'month' };
  }
  
  const frequencyInterval = parseInt(cells[intervalIdx]);
  const frequencyType = cells[typeIdx]?.toLowerCase();
  
  return {
    interval: isNaN(frequencyInterval) || frequencyInterval < 1 ? 1 : frequencyInterval,
    type: VALID_FREQUENCY_TYPES.includes(frequencyType as BudgetItemCadenceType)
      ? (frequencyType as BudgetItemCadenceType)
      : 'month',
  };
}

// Helper function to get notes from CSV cells using column mapping
function parseNotes(cells: string[], columnMap: ColumnMapping): string {
  const notesIdx = columnMap['Notes'];
  if (notesIdx !== undefined) {
    return cells[notesIdx] || '';
  }
  return '';
}

export function exportFile(fileName: string, space: Space) {
  const jsonData = JSON.stringify(space, null, 2);
  const fileContent = [
    FILE_HEADER_FIRST_LINE,
    FILE_HEADER_SECOND_LINE,
    FILE_HEADER_THIRD_LINE,
    jsonData,
  ].join('\n');

  const file = new Blob([fileContent], { type: FILE_TYPE });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.trim()}${FILE_EXTENSION}`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFile(): Promise<Space> {
  const handleImport: (file: File) => Promise<Space | null> = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const lines = content.split('\n');
        if (
          lines[0] !== FILE_HEADER_FIRST_LINE ||
          lines[1] !== FILE_HEADER_SECOND_LINE ||
          lines[2] !== FILE_HEADER_THIRD_LINE
        ) {
          reject(new Error('Invalid file format'));
          return;
        }
        const jsonData = lines.slice(3)?.join('\n') || '';
        try {
          const space = JSON.parse(jsonData);
          resolve(space);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };

  const file = await pickFile();
  if (!file) {
    throw new Error('No file selected');
  }
  const fileContent = await handleImport(file);
  if (typeof fileContent === 'object' && fileContent !== null) {
    const fileSpace = fileContent as Space;
    if (fileSpace?.id) {
      localStorage.setItem(fileSpace.id, JSON.stringify(fileSpace));
      setTimeout(() => {
        window.location.href = `/${fileSpace.id}`;
      }, 100);
    }
    throw new Error('Invalid file content - no ID');
  }
  throw new Error('Invalid file content - no object');
}

export function pickFile(acceptedFileTypes?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = acceptedFileTypes || FILE_EXTENSION;

    input.onchange = () => {
      if (input.files && input.files[0]) {
        resolve(input.files[0]);
      } else {
        reject(new Error('No file selected'));
      }
      document.body.removeChild(input);
    };

    input.onerror = (e) => {
      reject(e);
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  });
}

export function exportCSV(fileName: string, space: Space, sheetId?: string) {
  // Filter items by sheet if specified
  let incomes = space.incomes;
  let expenses = space.expenses;

  if (sheetId && sheetId !== 'all') {
    incomes = space.incomes.filter(
      (income: Income) =>
        // Only include items that are explicitly assigned to this sheet
        income.sheets && income.sheets.includes(sheetId)
    );
    expenses = space.expenses.filter(
      (expense: Expense) =>
        // Only include items that are explicitly assigned to this sheet
        expense.sheets && expense.sheets.includes(sheetId)
    );
  }

  // Create CSV content for incomes
  const incomesCSV = [
    'Type,Label,Description,Amount,Source,Frequency Interval,Frequency Type,Notes',
    ...incomes.map((income: Income) =>
      [
        'Income',
        escapeCSV(income.label),
        escapeCSV(income.description),
        income.amount,
        escapeCSV(income.source),
        income.cadence?.interval || 1,
        income.cadence?.type || 'month',
        escapeCSV(income.notes),
      ].join(',')
    ),
  ];

  // Create CSV content for expenses
  const expensesCSV = [
    'Type,Label,Description,Amount,Category,Frequency Interval,Frequency Type,Notes',
    ...expenses.map((expense: Expense) =>
      [
        'Expense',
        escapeCSV(expense.label),
        escapeCSV(expense.description),
        expense.amount,
        escapeCSV(expense.category),
        expense.cadence?.interval || 1,
        expense.cadence?.type || 'month',
        escapeCSV(expense.notes),
      ].join(',')
    ),
  ];

  // Combine incomes and expenses
  const csvContent = [...incomesCSV, '', ...expensesCSV].join('\n');

  const file = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.trim()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSVTemplate() {
  const incomesCSV = [
    'Type,Label,Description,Amount,Source,Frequency Interval,Frequency Type,Notes',
    'Income,Salary,Monthly salary,5000,Tech Company,1,month,Regular income',
    'Income,Freelance,Side projects,1000,Freelance Work,2,week,Variable income',
  ];

  const expensesCSV = [
    'Type,Label,Description,Amount,Category,Frequency Interval,Frequency Type,Notes',
    'Expense,Rent,Monthly rent payment,1500,Housing,1,month,Fixed cost',
    'Expense,Groceries,Food and supplies,500,Food,1,week,Weekly shopping',
  ];

  const csvContent = [...incomesCSV, '', ...expensesCSV].join('\n');

  const file = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'budget-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string): string {
  if (!value) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function importCSV(
  file: File,
  sheetId?: string
): Promise<{ incomes: Income[]; expenses: Expense[] }> {
  if (!file) {
    throw new Error('No file selected');
  }

  const content = await file.text();
  const result = parseCSVContent(content, sheetId);
  
  if (!result.valid) {
    throw new Error(result.errors.join('\n'));
  }
  
  return {
    incomes: result.incomes,
    expenses: result.expenses,
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

export interface CSVParseResult {
  valid: boolean;
  errors: string[];
  hasFrequency: boolean;
  incomes: Income[];
  expenses: Expense[];
}

/**
 * Reads and parses CSV content, validating format and returning both data and any errors.
 * This function combines validation and parsing in a single pass.
 * 
 * @param content - The CSV file content as a string
 * @param sheetId - Optional sheet ID to assign parsed items to
 * @returns CSVParseResult with validation status, errors, and parsed data
 */
export function parseCSVContent(content: string, sheetId?: string): CSVParseResult {
  const errors: string[] = [];
  const lines = content.split('\n').filter((line) => line.trim());
  
  if (lines.length === 0) {
    return { 
      valid: false, 
      errors: ['CSV file is empty'], 
      hasFrequency: false,
      incomes: [],
      expenses: []
    };
  }

  let hasIncomeSection = false;
  let hasExpenseSection = false;
  let hasFrequency = false;
  let incomeHeaderIndex = -1;
  let expenseHeaderIndex = -1;
  let incomeColumnMap: ColumnMapping = {};
  let expenseColumnMap: ColumnMapping = {};

  // Find sections and validate headers
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = parseCSVLine(line);
    
    // Detect section headers
    if (cells[0] === 'Type' && cells[1] === 'Label') {
      if (cells.includes('Source')) {
        hasIncomeSection = true;
        incomeHeaderIndex = i;
        incomeColumnMap = createColumnMapping(cells);
        
        // Check for required columns
        const hasType = incomeColumnMap['Type'] !== undefined;
        const hasLabel = incomeColumnMap['Label'] !== undefined;
        const hasAmount = incomeColumnMap['Amount'] !== undefined;
        const hasSource = incomeColumnMap['Source'] !== undefined;
        
        if (!hasType || !hasLabel || !hasAmount || !hasSource) {
          errors.push('Income section missing required columns (Type, Label, Amount, Source)');
        }
        
        // Check if frequency columns are present
        if (incomeColumnMap['Frequency Interval'] !== undefined && 
            incomeColumnMap['Frequency Type'] !== undefined) {
          hasFrequency = true;
        }
        
      } else if (cells.includes('Category')) {
        hasExpenseSection = true;
        expenseHeaderIndex = i;
        expenseColumnMap = createColumnMapping(cells);
        
        // Check for required columns
        const hasType = expenseColumnMap['Type'] !== undefined;
        const hasLabel = expenseColumnMap['Label'] !== undefined;
        const hasAmount = expenseColumnMap['Amount'] !== undefined;
        const hasCategory = expenseColumnMap['Category'] !== undefined;
        
        if (!hasType || !hasLabel || !hasAmount || !hasCategory) {
          errors.push('Expense section missing required columns (Type, Label, Amount, Category)');
        }
        
        // Check if frequency columns are present
        if (expenseColumnMap['Frequency Interval'] !== undefined && 
            expenseColumnMap['Frequency Type'] !== undefined) {
          hasFrequency = true;
        }
      }
    }
  }

  // At least one section is required
  if (!hasIncomeSection && !hasExpenseSection) {
    errors.push('CSV must contain at least one section (Income or Expense) with proper headers');
    return { valid: false, errors, hasFrequency: false, incomes: [], expenses: [] };
  }

  // Parse data and validate
  const newIncomes: Income[] = [];
  const newExpenses: Expense[] = [];

  if (hasIncomeSection) {
    for (let i = incomeHeaderIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = parseCSVLine(line);
      if (cells[0] === 'Type' && cells.includes('Category')) {
        // Hit expense section
        break;
      }
      
      // Check if we have minimum required data
      const labelIdx = incomeColumnMap['Label'];
      const amountIdx = incomeColumnMap['Amount'];
      const sourceIdx = incomeColumnMap['Source'];
      
      if (labelIdx === undefined || amountIdx === undefined || sourceIdx === undefined) {
        continue;
      }
      
      if (cells.length > Math.max(labelIdx, amountIdx, sourceIdx)) {
        // Validate frequency values if present
        const intervalIdx = incomeColumnMap['Frequency Interval'];
        const typeIdx = incomeColumnMap['Frequency Type'];
        
        if (intervalIdx !== undefined && typeIdx !== undefined && 
            cells.length > Math.max(intervalIdx, typeIdx)) {
          validateFrequencyValues(cells[intervalIdx], cells[typeIdx], i + 1, errors);
        }
        
        // Parse the income data
        const cadence = parseFrequency(cells, incomeColumnMap);
        const notes = parseNotes(cells, incomeColumnMap);
        const descriptionIdx = incomeColumnMap['Description'];
        
        const income: Income = {
          id: generateId('budget'),
          label: cells[labelIdx],
          description: descriptionIdx !== undefined ? cells[descriptionIdx] : '',
          amount: parseFloat(cells[amountIdx]) || 0,
          source: cells[sourceIdx],
          type: cells[sourceIdx], // Using source as type
          cadence,
          notes,
        };
        
        // Assign to sheet if specified
        if (sheetId && sheetId !== 'all') {
          income.sheets = [sheetId];
        }
        
        newIncomes.push(income);
      }
    }
  }

  if (hasExpenseSection) {
    for (let i = expenseHeaderIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = parseCSVLine(line);
      
      // Check if we have minimum required data
      const labelIdx = expenseColumnMap['Label'];
      const amountIdx = expenseColumnMap['Amount'];
      const categoryIdx = expenseColumnMap['Category'];
      
      if (labelIdx === undefined || amountIdx === undefined || categoryIdx === undefined) {
        continue;
      }
      
      if (cells.length > Math.max(labelIdx, amountIdx, categoryIdx)) {
        // Validate frequency values if present
        const intervalIdx = expenseColumnMap['Frequency Interval'];
        const typeIdx = expenseColumnMap['Frequency Type'];
        
        if (intervalIdx !== undefined && typeIdx !== undefined && 
            cells.length > Math.max(intervalIdx, typeIdx)) {
          validateFrequencyValues(cells[intervalIdx], cells[typeIdx], i + 1, errors);
        }
        
        // Parse the expense data
        const cadence = parseFrequency(cells, expenseColumnMap);
        const notes = parseNotes(cells, expenseColumnMap);
        const descriptionIdx = expenseColumnMap['Description'];
        
        const expense: Expense = {
          id: generateId('budget'),
          label: cells[labelIdx],
          description: descriptionIdx !== undefined ? cells[descriptionIdx] : '',
          amount: parseFloat(cells[amountIdx]) || 0,
          category: cells[categoryIdx],
          subCategory: '', // Default to empty since not included in CSV
          cadence,
          notes,
        };
        
        // Assign to sheet if specified
        if (sheetId && sheetId !== 'all') {
          expense.sheets = [sheetId];
        }
        
        newExpenses.push(expense);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    hasFrequency,
    incomes: newIncomes,
    expenses: newExpenses,
  };
}
